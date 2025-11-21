import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCache, CacheTTL } from '@/lib/redis/cache';

/**
 * GET /api/youtube/trending
 * 인기 급상승 일반 동영상 조회 API (DB 기반)
 *
 * Query Parameters:
 * - regionCode: 국가 코드 (KR, US, JP, GLOBAL 등) - 기본값: KR
 * - videoCategoryId: 선택적 카테고리 ID (기본값: null = all)
 * - period: 기간 필터 (daily, weekly, monthly, yearly, yearEnd, all) - 기본값: all
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionCode = searchParams.get('regionCode') || 'KR';
    const videoCategoryId = searchParams.get('videoCategoryId') || null;
    const period = searchParams.get('period') || 'all';

    // 캐시 키 생성
    const cacheKey = `youtube:trending:videos:${regionCode}:${videoCategoryId}:${period}`;

    // Redis 캐시를 통해 데이터 조회
    const result = await withCache(
      cacheKey,
      async () => {
        // Period에 따른 publishedAt 필터 생성
        const publishedAtFilter = getPeriodFilter(period);

        // DB에서 trending videos 조회
        const videos = await prisma.trendingVideo.findMany({
          where: {
            regionCode,
            categoryId: videoCategoryId,
            videoType: 'video',
            ...(publishedAtFilter && { publishedAt: publishedAtFilter }),
          },
          orderBy: {
            rank: 'asc', // 순위 순으로 정렬
          },
          take: 50,
        });

        // API 응답 형식으로 변환
        const videosWithAnalytics = videos.map((video) => ({
          id: video.videoId,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt.toISOString(),
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          categoryId: video.categoryId,

          // 통계 정보
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,

          // 동영상 정보
          duration: video.duration,

          // 분석 정보 (참여율)
          engagementRate: video.engagementRate,

          // 채널 정보
          channel: {
            id: video.channelId,
            title: video.channelTitle,
            thumbnailUrl: video.channelThumbnailUrl,
            subscriberCount: video.subscriberCount,
            videoCount: video.videoCount,
          },
        }));

        return {
          videos: videosWithAnalytics,
          region: regionCode,
          total: videosWithAnalytics.length,
          nextPageToken: undefined, // DB 조회에서는 페이지네이션 없음
        };
      },
      CacheTTL.TRENDING
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/youtube/trending:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
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
      // 오늘 00:00:00 이후
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: today };
    }

    case 'weekly': {
      // 최근 7일
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: weekAgo };
    }

    case 'monthly': {
      // 최근 30일
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { gte: monthAgo };
    }

    case 'yearly': {
      // 최근 365일
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return { gte: yearAgo };
    }

    case 'yearEnd': {
      // 현재 연도 12월
      const currentYear = now.getFullYear();
      const decemberStart = new Date(currentYear, 11, 1); // 12월 1일
      return { gte: decemberStart };
    }

    case 'all':
    default:
      // 필터 없음
      return undefined;
  }
}
