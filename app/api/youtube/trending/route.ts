import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';
import { calculateVideoAnalytics } from '@/lib/youtube/analytics';
import { withCache, CacheKey, CacheTTL } from '@/lib/redis/cache';

/**
 * GET /api/youtube/trending
 * 인기 급상승 일반 동영상 조회 API (60초 초과)
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
    const cacheKey = CacheKey.trendingVideos(
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

        // 인기 일반 동영상 조회 (client에서 자동으로 50개 모아줌)
        const result = await youtube.getTrendingVideos(
          regionCode,
          50,
          videoCategoryId,
          pageToken
        );

        const videos = result.items;

        // 각 동영상에 대한 분석 정보 추가
        const videosWithAnalytics = videos.map((video: any) => {
          const analytics = calculateVideoAnalytics(video);

          return {
            id: video.id,
            title: video.snippet?.title,
            description: video.snippet?.description,
            thumbnailUrl:
              video.snippet?.thumbnails?.high?.url ||
              video.snippet?.thumbnails?.medium?.url ||
              video.snippet?.thumbnails?.default?.url,
            publishedAt: video.snippet?.publishedAt,
            channelId: video.snippet?.channelId,
            channelTitle: video.snippet?.channelTitle,

            // 통계 정보
            viewCount: parseInt(video.statistics?.viewCount || '0', 10),
            likeCount: parseInt(video.statistics?.likeCount || '0', 10),
            commentCount: parseInt(video.statistics?.commentCount || '0', 10),

            // 동영상 정보
            duration: video.contentDetails?.duration,

            // 분석 정보 (참여율)
            engagementRate: analytics.engagementRate,

            // 채널 정보 (enrichWithChannelInfo로 추가된 정보)
            channel: video.channelInfo
              ? {
                  id: video.channelInfo.id,
                  title: video.channelInfo.snippet?.title,
                  thumbnailUrl:
                    video.channelInfo.snippet?.thumbnails?.default?.url,
                  subscriberCount: parseInt(
                    video.channelInfo.statistics?.subscriberCount || '0',
                    10
                  ),
                  videoCount: parseInt(
                    video.channelInfo.statistics?.videoCount || '0',
                    10
                  ),
                }
              : undefined,
          };
        });

        return {
          videos: videosWithAnalytics,
          region: regionCode,
          total: videosWithAnalytics.length,
          nextPageToken: result.nextPageToken,
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
