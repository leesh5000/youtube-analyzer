import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface ShortData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
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

export interface TrendingShortsData {
  shorts: ShortData[];
  region: string;
  total: number;
  nextPageToken?: string;
}

export function useTrendingShorts(
  regionCode: string = 'US',
  videoCategoryId?: string
) {
  return useInfiniteQuery<TrendingShortsData>({
    queryKey: ['trendingShorts', regionCode, videoCategoryId],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get('/api/youtube/shorts/trending', {
        params: {
          regionCode,
          videoCategoryId,
          pageToken: pageParam,
        },
      });
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    staleTime: 30 * 1000, // 30초 동안 캐시 유지 (서버 Redis 캐시가 primary)
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
  });
}
