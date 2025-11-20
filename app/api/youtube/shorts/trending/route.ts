import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';
import { calculateVideoAnalytics } from '@/lib/youtube/analytics';
import { withCache, CacheKey, CacheTTL } from '@/lib/redis/cache';

/**
 * GET /api/youtube/shorts/trending
 * 인기 급상승 쇼츠 조회 API
 *
 * Query Parameters:
 * - regionCode: 국가 코드 (KR, US, JP, GLOBAL 등) - 기본값: US
 * - videoCategoryId: 선택적 카테고리 ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionCode = searchParams.get('regionCode') || 'US';
    const videoCategoryId = searchParams.get('videoCategoryId') || undefined;
    const pageToken = searchParams.get('pageToken') || undefined;

    // 캐시 키 생성
    const cacheKey = CacheKey.trendingShorts(
      regionCode,
      videoCategoryId,
      pageToken
    );

    // Redis 캐시를 통해 데이터 조회
    const result = await withCache(
      cacheKey,
      async () => {
        // YouTube 클라이언트 가져오기
        const youtube = getYouTubeClient();

        // 인기 쇼츠 조회 (client에서 자동으로 50개 모아줌)
        const result = await youtube.getTrendingShorts(
          regionCode,
          50,
          videoCategoryId,
          pageToken
        );

        const shorts = result.items;

        // 각 쇼츠에 대한 분석 정보 추가
        const shortsWithAnalytics = shorts.map((short: any) => {
          const analytics = calculateVideoAnalytics(short);

          return {
            id: short.id,
            title: short.snippet?.title,
            description: short.snippet?.description,
            thumbnailUrl:
              short.snippet?.thumbnails?.high?.url ||
              short.snippet?.thumbnails?.medium?.url ||
              short.snippet?.thumbnails?.default?.url,
            publishedAt: short.snippet?.publishedAt,
            channelId: short.snippet?.channelId,
            channelTitle: short.snippet?.channelTitle,

            // 통계 정보
            viewCount: parseInt(short.statistics?.viewCount || '0', 10),
            likeCount: parseInt(short.statistics?.likeCount || '0', 10),
            commentCount: parseInt(short.statistics?.commentCount || '0', 10),

            // 동영상 정보
            duration: short.contentDetails?.duration,

            // 분석 정보 (참여율)
            engagementRate: analytics.engagementRate,

            // 채널 정보 (enrichWithChannelInfo로 추가된 정보)
            channel: short.channelInfo
              ? {
                  id: short.channelInfo.id,
                  title: short.channelInfo.snippet?.title,
                  thumbnailUrl:
                    short.channelInfo.snippet?.thumbnails?.default?.url,
                  subscriberCount: parseInt(
                    short.channelInfo.statistics?.subscriberCount || '0',
                    10
                  ),
                  videoCount: parseInt(
                    short.channelInfo.statistics?.videoCount || '0',
                    10
                  ),
                }
              : undefined,
          };
        });

        return {
          shorts: shortsWithAnalytics,
          region: regionCode,
          total: shortsWithAnalytics.length,
          nextPageToken: result.nextPageToken,
        };
      },
      CacheTTL.TRENDING
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/youtube/shorts/trending:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch trending shorts' },
      { status: 500 }
    );
  }
}
