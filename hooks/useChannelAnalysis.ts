import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ChannelAnalysisData {
  channel: {
    id: string;
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: string;
      medium?: string;
      high?: string;
    };
    statistics: {
      subscriberCount: number;
      viewCount: number;
      videoCount: number;
    };
  };
  analytics: {
    viewsPerSubscriber: number;
    avgViewsPerVideo: number;
    engagementRate: number;
  };
  topVideos: Array<{
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    engagementRate: number;
    publishedAt: string;
  }>;
  hiddenGems: Array<{
    id: string;
    title: string;
    viewCount: number;
    viewsToSubscriberRatio: number;
    publishedAt: string;
  }>;
  performance: {
    score: number;
    insights: string[];
  };
}

export function useChannelAnalysis(channelId: string | null) {
  return useQuery<ChannelAnalysisData>({
    queryKey: ['channelAnalysis', channelId],
    queryFn: async () => {
      const response = await axios.get(`/api/youtube/channel`, {
        params: { channelId },
      });
      return response.data;
    },
    enabled: !!channelId,
  });
}
