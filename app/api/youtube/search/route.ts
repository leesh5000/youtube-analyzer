import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';
import { withCache, CacheKey, CacheTTL } from '@/lib/redis/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // 캐시 키 생성
    const cacheKey = CacheKey.searchChannels(query);

    // Redis 캐시를 통해 데이터 조회
    const result = await withCache(
      cacheKey,
      async () => {
        const youtube = getYouTubeClient();
        const results = await youtube.searchChannels(query, 10);

        return {
          channels: results.map((result) => ({
            id: result.snippet?.channelId,
            title: result.snippet?.title,
            description: result.snippet?.description,
            thumbnails: {
              default: result.snippet?.thumbnails?.default?.url,
              medium: result.snippet?.thumbnails?.medium?.url,
              high: result.snippet?.thumbnails?.high?.url,
            },
          })),
        };
      },
      CacheTTL.SEARCH
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
