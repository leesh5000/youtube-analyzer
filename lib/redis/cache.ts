import { getRedisClient } from './client';

/**
 * 캐시 TTL (Time To Live) 상수 (초 단위)
 */
export const CacheTTL = {
  /** 트렌딩 쇼츠/동영상: 5분 */
  TRENDING: 5 * 60,
  /** 채널 분석: 10분 */
  CHANNEL: 10 * 60,
  /** 검색 결과: 15분 */
  SEARCH: 15 * 60,
} as const;

/**
 * 캐시 키 생성 유틸리티
 */
export const CacheKey = {
  /**
   * 트렌딩 쇼츠 캐시 키 생성
   * @param regionCode 국가 코드 (예: KR, US)
   * @param categoryId 카테고리 ID (선택적)
   * @param pageToken 페이지 토큰 (선택적)
   */
  trendingShorts: (
    regionCode: string,
    categoryId?: string,
    pageToken?: string
  ) => {
    const parts = ['youtube', 'trending', 'shorts', regionCode];
    if (categoryId) parts.push(categoryId);
    if (pageToken) parts.push(pageToken);
    return parts.join(':');
  },

  /**
   * 트렌딩 동영상 캐시 키 생성
   * @param regionCode 국가 코드 (예: KR, US)
   * @param categoryId 카테고리 ID (선택적)
   * @param pageToken 페이지 토큰 (선택적)
   */
  trendingVideos: (
    regionCode: string,
    categoryId?: string,
    pageToken?: string
  ) => {
    const parts = ['youtube', 'trending', 'videos', regionCode];
    if (categoryId) parts.push(categoryId);
    if (pageToken) parts.push(pageToken);
    return parts.join(':');
  },

  /**
   * 채널 분석 캐시 키 생성
   * @param channelId 채널 ID
   */
  channel: (channelId: string) => `youtube:channel:${channelId}`,

  /**
   * 채널 검색 캐시 키 생성
   * @param query 검색어
   */
  searchChannels: (query: string) =>
    `youtube:search:channels:${encodeURIComponent(query)}`,
} as const;

/**
 * Redis 캐시를 사용하여 데이터를 가져오거나 생성합니다.
 *
 * @template T 캐시될 데이터의 타입
 * @param key 캐시 키
 * @param fetchFn 캐시 미스 시 실행할 함수
 * @param ttl 캐시 TTL (초 단위)
 * @returns 캐시된 데이터 또는 fetchFn의 결과
 *
 * @example
 * ```typescript
 * const data = await withCache(
 *   CacheKey.channel('UC123'),
 *   async () => {
 *     const channelInfo = await youtube.getChannelInfo('UC123');
 *     return processChannelData(channelInfo);
 *   },
 *   CacheTTL.CHANNEL
 * );
 * ```
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const redis = getRedisClient();

  // Redis가 비활성화된 경우 fetchFn 직접 실행
  if (!redis) {
    console.log(`[Cache] Redis disabled, fetching directly: ${key}`);
    return fetchFn();
  }

  try {
    // 1. 캐시에서 데이터 조회
    const cached = await redis.get(key);

    if (cached) {
      console.log(`[Cache] HIT: ${key}`);
      return JSON.parse(cached) as T;
    }

    console.log(`[Cache] MISS: ${key}`);

    // 2. 캐시 미스 - fetchFn 실행
    const data = await fetchFn();

    // 3. 결과를 캐시에 저장 (fire-and-forget)
    redis
      .setex(key, ttl, JSON.stringify(data))
      .catch((error) => {
        console.error(`[Cache] Failed to set cache for key ${key}:`, error);
      });

    return data;
  } catch (error) {
    // Redis 오류 발생 시 graceful fallback
    console.error(`[Cache] Error accessing cache for key ${key}:`, error);
    console.log(`[Cache] Falling back to direct fetch`);
    return fetchFn();
  }
}

/**
 * 특정 패턴과 일치하는 캐시 키들을 삭제합니다.
 *
 * @param pattern 삭제할 키 패턴 (예: "youtube:channel:*")
 * @returns 삭제된 키의 개수
 *
 * @example
 * ```typescript
 * // 모든 채널 캐시 삭제
 * await invalidateCache('youtube:channel:*');
 *
 * // 특정 지역의 트렌딩 캐시 삭제
 * await invalidateCache('youtube:trending:*:KR*');
 * ```
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const redis = getRedisClient();

  if (!redis) {
    console.warn('[Cache] Redis disabled, cannot invalidate cache');
    return 0;
  }

  try {
    // SCAN을 사용하여 패턴과 일치하는 키 찾기
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, foundKeys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length === 0) {
      console.log(`[Cache] No keys found matching pattern: ${pattern}`);
      return 0;
    }

    // 찾은 키들을 삭제
    await redis.del(...keys);
    console.log(
      `[Cache] Invalidated ${keys.length} keys matching pattern: ${pattern}`
    );

    return keys.length;
  } catch (error) {
    console.error(`[Cache] Error invalidating cache for pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Redis 캐시의 상태를 확인합니다.
 *
 * @returns Redis 연결 상태 및 정보
 */
export async function getCacheStats(): Promise<{
  connected: boolean;
  keyCount?: number;
  memoryUsed?: string;
}> {
  const redis = getRedisClient();

  if (!redis) {
    return { connected: false };
  }

  try {
    // PING으로 연결 확인
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      return { connected: false };
    }

    // DBSIZE로 키 개수 확인
    const keyCount = await redis.dbsize();

    // INFO memory로 메모리 사용량 확인
    const info = await redis.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.*)/);
    const memoryUsed = memoryMatch ? memoryMatch[1].trim() : 'unknown';

    return {
      connected: true,
      keyCount,
      memoryUsed,
    };
  } catch (error) {
    console.error('[Cache] Error getting cache stats:', error);
    return { connected: false };
  }
}
