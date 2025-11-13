import { youtube_v3 } from 'googleapis';

export type Channel = youtube_v3.Schema$Channel;
export type Video = youtube_v3.Schema$Video;
export type SearchResult = youtube_v3.Schema$SearchResult;

export interface ChannelData {
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
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  duration: string;
}

export interface AnalysisResult {
  channel: ChannelData;
  analytics: {
    viewsPerSubscriber: number;
    avgViewsPerVideo: number;
    engagementRate: number;
  };
  topVideos: VideoData[];
  hiddenGems: VideoData[];
  performanceScore: number;
  insights: string[];
}
