import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  engagementRate: number;
  channel?: {
    id: string;
    title: string;
    thumbnailUrl: string;
    subscriberCount: number;
    videoCount: number;
  };
}

export interface TrendingVideosData {
  videos: VideoData[];
  region: string;
  total: number;
  nextPageToken?: string;
}

export function useTrendingVideos(
  regionCode: string = 'KR',
  videoCategoryId?: string,
  period: string = 'all'
) {
  return useQuery<TrendingVideosData>({
    queryKey: ['trendingVideos', regionCode, videoCategoryId, period],
    queryFn: async () => {
      const response = await axios.get('/api/youtube/trending', {
        params: {
          regionCode,
          videoCategoryId,
          period,
        },
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30초 동안 캐시 유지 (서버 Redis 캐시가 primary)
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
  });
}
