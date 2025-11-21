import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface VideoRanking {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  channelThumbnailUrl: string;
  viewCount: number;
  subscriberCount?: number;
  engagementRate?: number;
  ratio?: number;
}

export interface ChannelRanking {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount?: number;
  trendingCount?: number;
  growth?: number;
}

export interface LatestTrendingVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  viewCount: number;
}

export interface HomeRankingsData {
  videoType: 'shorts' | 'videos';
  period: string;
  rankings: {
    topVideos: VideoRanking[];
    risingVideos: VideoRanking[];
    highEngagement: VideoRanking[];
    topChannels: ChannelRanking[];
    activeChannels: ChannelRanking[];
    subscriberSurge: ChannelRanking[];
    latestTrending: LatestTrendingVideo[];
  };
}

export function useHomeRankings(
  videoType: 'shorts' | 'videos' = 'shorts',
  period: string = 'all'
) {
  return useQuery<HomeRankingsData>({
    queryKey: ['homeRankings', videoType, period],
    queryFn: async () => {
      const response = await axios.get('/api/home/rankings', {
        params: {
          videoType,
          period,
        },
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30초 동안 캐시 유지 (서버 Redis 캐시가 primary)
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
  });
}
