import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCache, CacheTTL } from '@/lib/redis/cache';

/**
 * GET /api/home/rankings
 * 홈 화면용 종합 랭킹 데이터 API
 *
 * Query Parameters:
 * - videoType: shorts | videos - 기본값: shorts
 * - period: daily | weekly | monthly | all - 기본값: all
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoType = (searchParams.get('videoType') || 'shorts') as 'shorts' | 'videos';
    const period = searchParams.get('period') || 'all';

    // 캐시 키 생성
    const cacheKey = `youtube:home:rankings:${videoType}:${period}`;

    // Redis 캐시를 통해 데이터 조회
    const result = await withCache(
      cacheKey,
      async () => {
        // Period에 따른 publishedAt 필터 생성
        const publishedAtFilter = getPeriodFilter(period);

        // 기본 where 조건
        const baseWhere = {
          regionCode: 'GLOBAL',
          videoType: videoType === 'shorts' ? 'short' : 'video',
          ...(publishedAtFilter && { publishedAt: publishedAtFilter }),
        };

        // 1. 최다 조회 영상 Top 5
        const topVideos = await prisma.trendingVideo.findMany({
          where: baseWhere,
          orderBy: { viewCount: 'desc' },
          take: 5,
          select: {
            videoId: true,
            title: true,
            thumbnailUrl: true,
            channelId: true,
            channelTitle: true,
            channelThumbnailUrl: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
            subscriberCount: true,
            engagementRate: true,
          },
        });

        // 2. 떠오르는 영상 Top 5 (viewCount/subscriberCount >= 2.0)
        const allVideos = await prisma.trendingVideo.findMany({
          where: baseWhere,
          select: {
            videoId: true,
            title: true,
            thumbnailUrl: true,
            channelId: true,
            channelTitle: true,
            channelThumbnailUrl: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
            subscriberCount: true,
            engagementRate: true,
          },
        });

        const risingVideos = allVideos
          .map((video) => ({
            ...video,
            ratio: video.subscriberCount > 0 ? video.viewCount / video.subscriberCount : 0,
          }))
          .filter((video) => video.ratio >= 2.0)
          .sort((a, b) => b.ratio - a.ratio)
          .slice(0, 5);

        // 3. 참여율 높은 영상 Top 5
        const highEngagement = await prisma.trendingVideo.findMany({
          where: baseWhere,
          orderBy: { engagementRate: 'desc' },
          take: 5,
          select: {
            videoId: true,
            title: true,
            thumbnailUrl: true,
            channelId: true,
            channelTitle: true,
            channelThumbnailUrl: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
            subscriberCount: true,
            engagementRate: true,
          },
        });

        // 4. 인기 채널 Top 5 (구독자 수 기준)
        const topChannelsData = await prisma.trendingVideo.findMany({
          where: baseWhere,
          orderBy: { subscriberCount: 'desc' },
          distinct: ['channelId'],
          take: 50, // 중복 제거 전 여유있게 가져옴
          select: {
            channelId: true,
            channelTitle: true,
            channelThumbnailUrl: true,
            subscriberCount: true,
            videoCount: true,
          },
        });

        // 중복 제거 및 정렬
        const uniqueChannelsMap = new Map();
        topChannelsData.forEach((channel) => {
          if (!uniqueChannelsMap.has(channel.channelId)) {
            uniqueChannelsMap.set(channel.channelId, channel);
          }
        });
        const topChannels = Array.from(uniqueChannelsMap.values())
          .sort((a, b) => b.subscriberCount - a.subscriberCount)
          .slice(0, 5);

        // 5. 활발한 채널 Top 5 (트렌딩 영상 개수 기준)
        const channelVideoCounts = await prisma.trendingVideo.groupBy({
          by: ['channelId'],
          where: baseWhere,
          _count: {
            videoId: true,
          },
          orderBy: {
            _count: {
              videoId: 'desc',
            },
          },
          take: 5,
        });

        // 채널 정보 가져오기
        const activeChannels = await Promise.all(
          channelVideoCounts.map(async (item) => {
            const channelInfo = await prisma.trendingVideo.findFirst({
              where: {
                channelId: item.channelId,
              },
              select: {
                channelId: true,
                channelTitle: true,
                channelThumbnailUrl: true,
                subscriberCount: true,
                videoCount: true,
              },
            });

            return {
              ...channelInfo!,
              trendingCount: item._count.videoId,
            };
          })
        );

        // 6. 구독자 급상승 Top 5
        // 현재는 구독자 수로 정렬 (추후 historical tracking 추가 시 growth로 변경)
        const subscriberSurge = topChannels.map((channel) => ({
          ...channel,
          growth: 0, // TODO: Implement historical tracking
        }));

        // 7. 실시간 인기 영상 (최신 20개)
        const latestTrending = await prisma.trendingVideo.findMany({
          where: baseWhere,
          orderBy: { collectedAt: 'desc' },
          take: 20,
          select: {
            videoId: true,
            title: true,
            thumbnailUrl: true,
            channelTitle: true,
            viewCount: true,
          },
        });

        return {
          videoType,
          period,
          rankings: {
            topVideos: topVideos.map((v) => ({
              id: v.videoId,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              channelId: v.channelId,
              channelTitle: v.channelTitle,
              channelThumbnailUrl: v.channelThumbnailUrl,
              viewCount: v.viewCount,
              subscriberCount: v.subscriberCount,
              engagementRate: v.engagementRate,
            })),
            risingVideos: risingVideos.map((v) => ({
              id: v.videoId,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              channelId: v.channelId,
              channelTitle: v.channelTitle,
              channelThumbnailUrl: v.channelThumbnailUrl,
              viewCount: v.viewCount,
              subscriberCount: v.subscriberCount,
              ratio: v.ratio,
            })),
            highEngagement: highEngagement.map((v) => ({
              id: v.videoId,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              channelId: v.channelId,
              channelTitle: v.channelTitle,
              channelThumbnailUrl: v.channelThumbnailUrl,
              engagementRate: v.engagementRate,
              viewCount: v.viewCount,
            })),
            topChannels: topChannels.map((c) => ({
              id: c.channelId,
              title: c.channelTitle,
              thumbnailUrl: c.channelThumbnailUrl,
              subscriberCount: c.subscriberCount,
              videoCount: c.videoCount,
            })),
            activeChannels: activeChannels.map((c) => ({
              id: c.channelId,
              title: c.channelTitle,
              thumbnailUrl: c.channelThumbnailUrl,
              subscriberCount: c.subscriberCount,
              trendingCount: c.trendingCount,
            })),
            subscriberSurge: subscriberSurge.map((c) => ({
              id: c.channelId,
              title: c.channelTitle,
              thumbnailUrl: c.channelThumbnailUrl,
              subscriberCount: c.subscriberCount,
              growth: c.growth,
            })),
            latestTrending: latestTrending.map((v) => ({
              id: v.videoId,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              channelTitle: v.channelTitle,
              viewCount: v.viewCount,
            })),
          },
        };
      },
      CacheTTL.TRENDING
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/home/rankings:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch ranking data' },
      { status: 500 }
    );
  }
}

/**
 * Period 파라미터에 따른 publishedAt 필터 생성
 */
function getPeriodFilter(period: string) {
  const now = new Date();

  switch (period) {
    case 'daily': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: today };
    }

    case 'weekly': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: weekAgo };
    }

    case 'monthly': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { gte: monthAgo };
    }

    case 'all':
    default:
      return undefined;
  }
}
