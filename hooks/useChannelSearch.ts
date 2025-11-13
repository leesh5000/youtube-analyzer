import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
}

interface SearchResponse {
  channels: SearchResult[];
}

export function useChannelSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ['channelSearch', query],
    queryFn: async () => {
      const response = await axios.get(`/api/youtube/search`, {
        params: { q: query },
      });
      return response.data;
    },
    enabled: query.length > 0,
  });
}
