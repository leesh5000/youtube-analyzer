import Redis from 'ioredis';

/**
 * Redis 클라이언트 싱글톤
 *
 * YouTube API 응답을 서버 측에서 캐싱하기 위한 Redis 클라이언트.
 * REDIS_URL 환경 변수가 설정되지 않은 경우 null을 반환하여
 * 캐싱을 비활성화합니다 (graceful fallback).
 */

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | null | undefined;
}

let redis: Redis | null = null;

/**
 * Redis 클라이언트 인스턴스를 가져옵니다.
 * 환경 변수 REDIS_URL이 설정되지 않은 경우 null을 반환합니다.
 *
 * @returns Redis 클라이언트 인스턴스 또는 null
 */
export function getRedisClient(): Redis | null {
  // REDIS_URL이 설정되지 않은 경우 null 반환 (캐싱 비활성화)
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not set. Caching is disabled.');
    return null;
  }

  // 개발 환경에서 HMR로 인한 중복 연결 방지
  if (process.env.NODE_ENV === 'development') {
    if (!global.redisClient) {
      global.redisClient = createRedisClient();
    }
    return global.redisClient;
  }

  // 프로덕션 환경에서는 매번 새로운 인스턴스 사용
  if (!redis) {
    redis = createRedisClient();
  }

  return redis;
}

/**
 * Redis 클라이언트 인스턴스를 생성합니다.
 */
function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL!;

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // 연결 실패 시 로그
    lazyConnect: true,
  });

  client.on('error', (error) => {
    console.error('Redis client error:', error);
  });

  client.on('connect', () => {
    console.log('Redis client connected successfully');
  });

  // 즉시 연결 시도
  client.connect().catch((error) => {
    console.error('Failed to connect to Redis:', error);
  });

  return client;
}

/**
 * Redis 연결을 종료합니다.
 * 주로 테스트나 서버 종료 시 사용합니다.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  if (global.redisClient) {
    await global.redisClient.quit();
    global.redisClient = null;
  }
}
