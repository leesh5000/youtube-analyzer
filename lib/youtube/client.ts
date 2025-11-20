import { google, youtube_v3 } from 'googleapis';
import { isShortVideo } from './utils';

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

  /**
   * 인기 급상승 쇼츠 조회
   * @param regionCode 국가 코드 (예: 'KR', 'US', 'JP') 또는 'GLOBAL'
   * @param maxResults 최대 결과 수 (기본값: 50)
   * @param videoCategoryId 선택적 카테고리 ID
   * @param pageToken 페이지네이션 토큰
   */
  async getTrendingShorts(
    regionCode: string = 'US',
    maxResults: number = 50,
    videoCategoryId?: string,
    pageToken?: string
  ): Promise<{ items: any[]; nextPageToken?: string | null }> {
    try {
      // GLOBAL 옵션: 여러 국가의 데이터를 가져와서 합침
      if (regionCode === 'GLOBAL') {
        return await this.getGlobalTrendingShorts(maxResults, videoCategoryId, pageToken);
      }

      // maxResults 개수의 Shorts를 모을 때까지 여러 페이지 가져오기
      const allShorts: any[] = [];
      let currentPageToken = pageToken;
      let lastNextPageToken: string | null | undefined;
      const MAX_PAGES = 10; // 최대 10페이지까지 시도

      console.log(`[getTrendingShorts] Starting to fetch shorts for region: ${regionCode}, maxResults: ${maxResults}, pageToken: ${pageToken}`);

      for (let page = 0; page < MAX_PAGES && allShorts.length < maxResults; page++) {
        // 특정 국가의 인기 동영상 조회
        const response = await this.youtube.videos.list({
          part: 'snippet,statistics,contentDetails' as any,
          chart: 'mostPopular',
          regionCode,
          maxResults: 50, // 항상 최대로 가져오기
          videoCategoryId: videoCategoryId,
          pageToken: currentPageToken,
        });

        const videos = response.data.items || [];
        lastNextPageToken = response.data.nextPageToken;

        console.log(`[getTrendingShorts] Page ${page + 1}: Fetched ${videos.length} videos from YouTube API`);

        // 60초 이하 동영상만 필터링 (Shorts)
        const shorts = videos.filter((video) => {
          const duration = video.contentDetails?.duration;
          return duration && isShortVideo(duration);
        });

        console.log(`[getTrendingShorts] Page ${page + 1}: Found ${shorts.length} shorts after filtering`);

        allShorts.push(...shorts);

        console.log(`[getTrendingShorts] Page ${page + 1}: Total shorts accumulated: ${allShorts.length}`);

        // 다음 페이지가 없으면 중단
        if (!lastNextPageToken) {
          break;
        }

        // 목표 개수 이상 모았으면 중단
        if (allShorts.length >= maxResults) {
          break;
        }

        currentPageToken = lastNextPageToken;
      }

      // maxResults로 제한
      const limitedShorts = allShorts.slice(0, maxResults);

      console.log(`[getTrendingShorts] Final result: ${limitedShorts.length} shorts (target: ${maxResults})`);

      // 채널 정보 함께 조회
      const enrichedShorts = await this.enrichWithChannelInfo(limitedShorts);

      console.log(`[getTrendingShorts] Returning ${enrichedShorts.length} enriched shorts with nextPageToken: ${lastNextPageToken}`);

      return {
        items: enrichedShorts,
        nextPageToken: lastNextPageToken,
      };
    } catch (error) {
      console.error('Error fetching trending shorts:', error);
      throw error;
    }
  }

  /**
   * 인기 급상승 일반 동영상 조회 (60초 초과)
   * @param regionCode 국가 코드 (예: 'KR', 'US', 'JP') 또는 'GLOBAL'
   * @param maxResults 최대 결과 수 (기본값: 50)
   * @param videoCategoryId 선택적 카테고리 ID
   * @param pageToken 페이지네이션 토큰
   */
  async getTrendingVideos(
    regionCode: string = 'US',
    maxResults: number = 50,
    videoCategoryId?: string,
    pageToken?: string
  ): Promise<{ items: any[]; nextPageToken?: string | null }> {
    try {
      // GLOBAL 옵션: 여러 국가의 데이터를 가져와서 합침
      if (regionCode === 'GLOBAL') {
        return await this.getGlobalTrendingVideos(maxResults, videoCategoryId, pageToken);
      }

      // maxResults 개수의 일반 동영상을 모을 때까지 여러 페이지 가져오기
      const allVideos: any[] = [];
      let currentPageToken = pageToken;
      let lastNextPageToken: string | null | undefined;
      const MAX_PAGES = 10; // 최대 10페이지까지 시도

      for (let page = 0; page < MAX_PAGES && allVideos.length < maxResults; page++) {
        // 특정 국가의 인기 동영상 조회
        const response = await this.youtube.videos.list({
          part: 'snippet,statistics,contentDetails' as any,
          chart: 'mostPopular',
          regionCode,
          maxResults: 50, // 항상 최대로 가져오기
          videoCategoryId: videoCategoryId,
          pageToken: currentPageToken,
        });

        const videos = response.data.items || [];
        lastNextPageToken = response.data.nextPageToken;

        // 60초 초과 동영상만 필터링 (일반 동영상)
        const regularVideos = videos.filter((video) => {
          const duration = video.contentDetails?.duration;
          return duration && !isShortVideo(duration);
        });

        allVideos.push(...regularVideos);

        // 다음 페이지가 없으면 중단
        if (!lastNextPageToken) {
          break;
        }

        // 목표 개수 이상 모았으면 중단
        if (allVideos.length >= maxResults) {
          break;
        }

        currentPageToken = lastNextPageToken;
      }

      // maxResults로 제한
      const limitedVideos = allVideos.slice(0, maxResults);

      // 채널 정보 함께 조회
      const enrichedVideos = await this.enrichWithChannelInfo(limitedVideos);

      return {
        items: enrichedVideos,
        nextPageToken: lastNextPageToken,
      };
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  }

  /**
   * 글로벌 인기 쇼츠 조회 (여러 국가 데이터 합침)
   * @private
   */
  private async getGlobalTrendingShorts(
    maxResults: number = 50,
    videoCategoryId?: string,
    pageToken?: string
  ) {
    try {
      // 주요 3개 국가에서 데이터 가져오기 (API 쿼터 관리)
      const regions = ['US', 'KR', 'JP'];
      const perRegionLimit = Math.ceil(maxResults / regions.length);

      // 병렬로 각 국가의 쇼츠 가져오기
      const allShortsPromises = regions.map((region) =>
        this.getTrendingShorts(region, perRegionLimit, videoCategoryId, pageToken)
      );

      const allShortsArrays = await Promise.all(allShortsPromises);
      const allShorts = allShortsArrays.flatMap(result => result.items);

      // 중복 제거 (videoId 기준)
      const uniqueShorts = Array.from(
        new Map(allShorts.map((short) => [short.id, short])).values()
      );

      // 조회수 순으로 정렬
      const sortedShorts = uniqueShorts.sort((a, b) => {
        const viewsA = parseInt(a.statistics?.viewCount || '0', 10);
        const viewsB = parseInt(b.statistics?.viewCount || '0', 10);
        return viewsB - viewsA;
      });

      // 최대 결과 수 제한
      return {
        items: sortedShorts.slice(0, maxResults),
        nextPageToken: allShortsArrays[0]?.nextPageToken, // Use first region's token
      };
    } catch (error) {
      console.error('Error fetching global trending shorts:', error);
      throw error;
    }
  }

  /**
   * 글로벌 인기 일반 동영상 조회 (여러 국가 데이터 합침)
   * @private
   */
  private async getGlobalTrendingVideos(
    maxResults: number = 50,
    videoCategoryId?: string,
    pageToken?: string
  ) {
    try {
      // 주요 3개 국가에서 데이터 가져오기 (API 쿼터 관리)
      const regions = ['US', 'KR', 'JP'];
      const perRegionLimit = Math.ceil(maxResults / regions.length);

      // 병렬로 각 국가의 일반 동영상 가져오기
      const allVideosPromises = regions.map((region) =>
        this.getTrendingVideos(region, perRegionLimit, videoCategoryId, pageToken)
      );

      const allVideosArrays = await Promise.all(allVideosPromises);
      const allVideos = allVideosArrays.flatMap(result => result.items);

      // 중복 제거 (videoId 기준)
      const uniqueVideos = Array.from(
        new Map(allVideos.map((video) => [video.id, video])).values()
      );

      // 조회수 순으로 정렬
      const sortedVideos = uniqueVideos.sort((a, b) => {
        const viewsA = parseInt(a.statistics?.viewCount || '0', 10);
        const viewsB = parseInt(b.statistics?.viewCount || '0', 10);
        return viewsB - viewsA;
      });

      // 최대 결과 수 제한
      return {
        items: sortedVideos.slice(0, maxResults),
        nextPageToken: allVideosArrays[0]?.nextPageToken, // Use first region's token
      };
    } catch (error) {
      console.error('Error fetching global trending videos:', error);
      throw error;
    }
  }

  /**
   * 비디오에 채널 정보 추가
   * @private
   */
  private async enrichWithChannelInfo(videos: youtube_v3.Schema$Video[]) {
    try {
      // 채널 ID 추출
      const channelIds = [
        ...new Set(
          videos
            .map((video) => video.snippet?.channelId)
            .filter(Boolean) as string[]
        ),
      ];

      if (channelIds.length === 0) {
        return videos;
      }

      // 채널 정보 조회 (최대 50개씩)
      const channelInfoMap = new Map();

      for (let i = 0; i < channelIds.length; i += 50) {
        const batch = channelIds.slice(i, i + 50);
        const channelsResponse = await this.youtube.channels.list({
          part: ['snippet', 'statistics'],
          id: batch,
        });

        channelsResponse.data.items?.forEach((channel) => {
          if (channel.id) {
            channelInfoMap.set(channel.id, channel);
          }
        });
      }

      // 비디오에 채널 정보 추가
      return videos.map((video) => ({
        ...video,
        channelInfo: video.snippet?.channelId
          ? channelInfoMap.get(video.snippet.channelId)
          : undefined,
      }));
    } catch (error) {
      console.error('Error enriching with channel info:', error);
      // 채널 정보 조회 실패해도 비디오는 반환
      return videos;
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
