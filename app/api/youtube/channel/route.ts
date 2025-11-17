import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';
import {
  calculateChannelAnalytics,
  calculateVideoAnalytics,
  findHiddenGems,
  evaluateChannelPerformance,
} from '@/lib/youtube/analytics';
import { withCache, CacheKey, CacheTTL } from '@/lib/redis/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // 캐시 키 생성
    const cacheKey = CacheKey.channel(channelId);

    // Redis 캐시를 통해 데이터 조회
    const result = await withCache(
      cacheKey,
      async () => {
        const youtube = getYouTubeClient();

        // 채널 정보 가져오기
        const channel = await youtube.getChannelInfo(channelId);
        if (!channel) {
          throw new Error('Channel not found');
        }

        // 채널 분석
        const channelAnalytics = calculateChannelAnalytics(channel);

        // 채널의 비디오 목록 가져오기
        const videos = await youtube.getChannelVideos(channelId, 50);

        // 비디오별 분석
        const videoAnalytics = videos.map(calculateVideoAnalytics);

        // 평균 참여율 계산
        const avgEngagementRate =
          videoAnalytics.length > 0
            ? videoAnalytics.reduce((sum, v) => sum + v.engagementRate, 0) /
              videoAnalytics.length
            : 0;

        // 히든 젬 찾기
        const hiddenGems = findHiddenGems(
          videos,
          channelAnalytics.subscriberCount,
          2.0
        );

        // 성과 평가
        const performance = evaluateChannelPerformance({
          ...channelAnalytics,
          engagementRate: avgEngagementRate,
        });

        // 조회수 상위 비디오
        const topVideos = [...videoAnalytics]
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 10);

        return {
          channel: {
            id: channel.id,
            title: channel.snippet?.title,
            description: channel.snippet?.description,
            customUrl: channel.snippet?.customUrl,
            publishedAt: channel.snippet?.publishedAt,
            thumbnails: {
              default: channel.snippet?.thumbnails?.default?.url,
              medium: channel.snippet?.thumbnails?.medium?.url,
              high: channel.snippet?.thumbnails?.high?.url,
            },
            statistics: {
              subscriberCount: channelAnalytics.subscriberCount,
              viewCount: channelAnalytics.viewCount,
              videoCount: channelAnalytics.videoCount,
            },
          },
          analytics: {
            viewsPerSubscriber: channelAnalytics.viewsPerSubscriber,
            avgViewsPerVideo: channelAnalytics.avgViewsPerVideo,
            engagementRate: avgEngagementRate,
          },
          topVideos: topVideos.map((v) => ({
            id: v.videoId,
            title: v.title,
            viewCount: v.viewCount,
            likeCount: v.likeCount,
            commentCount: v.commentCount,
            engagementRate: v.engagementRate,
            publishedAt: v.publishedAt,
          })),
          hiddenGems: hiddenGems.slice(0, 10).map((gem) => ({
            id: gem.videoId,
            title: gem.title,
            viewCount: gem.viewCount,
            viewsToSubscriberRatio: gem.viewsToSubscriberRatio,
            publishedAt: gem.publishedAt,
          })),
          performance: {
            score: performance.score,
            insights: performance.insights,
          },
        };
      },
      CacheTTL.CHANNEL
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in channel API:', error);

    // "Channel not found" 오류는 404로 반환
    if (error instanceof Error && error.message === 'Channel not found') {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
