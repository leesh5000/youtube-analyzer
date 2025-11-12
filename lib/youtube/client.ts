import { google, youtube_v3 } from 'googleapis';

/**
 * YouTube Data API 클라이언트
 */
export class YouTubeClient {
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  /**
   * 채널 정보 조회
   */
  async getChannelInfo(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channelId],
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  /**
   * 채널의 비디오 목록 조회
   */
  async getChannelVideos(channelId: string, maxResults: number = 50) {
    try {
      // 1. 채널의 업로드 재생목록 ID 가져오기
      const channelResponse = await this.youtube.channels.list({
        part: ['contentDetails'],
        id: [channelId],
      });

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('Uploads playlist not found');
      }

      // 2. 업로드 재생목록에서 비디오 목록 가져오기
      const playlistResponse = await this.youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults,
      });

      const videoIds = playlistResponse.data.items?.map(
        (item) => item.contentDetails?.videoId
      ).filter(Boolean) as string[];

      // 3. 비디오 상세 정보 가져오기
      if (videoIds.length === 0) {
        return [];
      }

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      });

      return videosResponse.data.items || [];
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }

  /**
   * 비디오 상세 정보 조회
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching video info:', error);
      throw error;
    }
  }

  /**
   * 채널 검색
   */
  async searchChannels(query: string, maxResults: number = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['channel'],
        maxResults,
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error searching channels:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
let youtubeClient: YouTubeClient | null = null;

export function getYouTubeClient(): YouTubeClient {
  if (!youtubeClient) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not set');
    }
    youtubeClient = new YouTubeClient(apiKey);
  }
  return youtubeClient;
}
