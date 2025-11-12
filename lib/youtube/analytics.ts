import { youtube_v3 } from 'googleapis';

export interface ChannelAnalytics {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  viewsPerSubscriber: number;
  avgViewsPerVideo: number;
  engagementRate: number;
}

export interface VideoAnalytics {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  viewsToEngagementRatio: number;
}

export interface HiddenGem {
  videoId: string;
  title: string;
  viewCount: number;
  subscriberCountAtTime: number;
  viewsToSubscriberRatio: number;
  publishedAt: string;
}

/**
 * 채널 분석 메트릭 계산
 */
export function calculateChannelAnalytics(
  channel: youtube_v3.Schema$Channel
): ChannelAnalytics {
  const stats = channel.statistics;

  const subscriberCount = parseInt(stats?.subscriberCount || '0');
  const viewCount = parseInt(stats?.viewCount || '0');
  const videoCount = parseInt(stats?.videoCount || '0');

  const viewsPerSubscriber = subscriberCount > 0 ? viewCount / subscriberCount : 0;
  const avgViewsPerVideo = videoCount > 0 ? viewCount / videoCount : 0;

  // 참여율 계산 (좋아요 + 댓글) / 조회수
  // 채널 레벨에서는 평균 참여율로 계산
  const engagementRate = 0; // 개별 비디오에서 계산 필요

  return {
    subscriberCount,
    viewCount,
    videoCount,
    viewsPerSubscriber,
    avgViewsPerVideo,
    engagementRate,
  };
}

/**
 * 비디오 분석 메트릭 계산
 */
export function calculateVideoAnalytics(
  video: youtube_v3.Schema$Video
): VideoAnalytics {
  const stats = video.statistics;
  const snippet = video.snippet;

  const videoId = video.id || '';
  const title = snippet?.title || '';
  const publishedAt = snippet?.publishedAt || '';
  const viewCount = parseInt(stats?.viewCount || '0');
  const likeCount = parseInt(stats?.likeCount || '0');
  const commentCount = parseInt(stats?.commentCount || '0');

  // 참여율: (좋아요 + 댓글) / 조회수 * 100
  const totalEngagement = likeCount + commentCount;
  const engagementRate = viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

  // 조회수 대비 참여 비율
  const viewsToEngagementRatio = viewCount > 0 ? viewCount / totalEngagement : 0;

  return {
    videoId,
    title,
    publishedAt,
    viewCount,
    likeCount,
    commentCount,
    engagementRate,
    viewsToEngagementRatio,
  };
}

/**
 * 히든 영상 발굴 (구독자 대비 조회수가 높은 영상)
 */
export function findHiddenGems(
  videos: youtube_v3.Schema$Video[],
  subscriberCount: number,
  threshold: number = 2.0 // 구독자 수 대비 조회수 비율 임계값
): HiddenGem[] {
  const hiddenGems: HiddenGem[] = [];

  for (const video of videos) {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const viewsToSubscriberRatio = subscriberCount > 0 ? viewCount / subscriberCount : 0;

    // 조회수가 구독자 수의 N배 이상인 영상을 히든 젬으로 분류
    if (viewsToSubscriberRatio >= threshold) {
      hiddenGems.push({
        videoId: video.id || '',
        title: video.snippet?.title || '',
        viewCount,
        subscriberCountAtTime: subscriberCount,
        viewsToSubscriberRatio,
        publishedAt: video.snippet?.publishedAt || '',
      });
    }
  }

  // 비율이 높은 순으로 정렬
  return hiddenGems.sort((a, b) => b.viewsToSubscriberRatio - a.viewsToSubscriberRatio);
}

/**
 * 채널 성과 평가
 */
export function evaluateChannelPerformance(analytics: ChannelAnalytics): {
  score: number;
  insights: string[];
} {
  const insights: string[] = [];
  let score = 0;

  // 구독자 대비 조회수 평가
  if (analytics.viewsPerSubscriber > 100) {
    insights.push('구독자 대비 조회수가 매우 높습니다.');
    score += 30;
  } else if (analytics.viewsPerSubscriber > 50) {
    insights.push('구독자 대비 조회수가 양호합니다.');
    score += 20;
  } else {
    insights.push('구독자 대비 조회수를 개선할 여지가 있습니다.');
    score += 10;
  }

  // 평균 조회수 평가
  if (analytics.avgViewsPerVideo > 10000) {
    insights.push('비디오당 평균 조회수가 우수합니다.');
    score += 30;
  } else if (analytics.avgViewsPerVideo > 5000) {
    insights.push('비디오당 평균 조회수가 양호합니다.');
    score += 20;
  } else {
    insights.push('비디오당 평균 조회수를 높일 수 있습니다.');
    score += 10;
  }

  // 콘텐츠 생산성 평가
  if (analytics.videoCount > 100) {
    insights.push('콘텐츠 생산량이 풍부합니다.');
    score += 20;
  } else if (analytics.videoCount > 50) {
    insights.push('적절한 양의 콘텐츠를 보유하고 있습니다.');
    score += 15;
  } else {
    insights.push('더 많은 콘텐츠 생산을 고려해보세요.');
    score += 5;
  }

  // 전체 조회수 평가
  if (analytics.viewCount > 1000000) {
    insights.push('총 조회수가 매우 높습니다.');
    score += 20;
  } else if (analytics.viewCount > 100000) {
    insights.push('총 조회수가 양호합니다.');
    score += 15;
  } else {
    insights.push('채널 성장을 위한 노력이 필요합니다.');
    score += 5;
  }

  return { score, insights };
}
