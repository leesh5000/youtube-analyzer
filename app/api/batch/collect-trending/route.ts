import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';
import { calculateVideoAnalytics } from '@/lib/youtube/analytics';
import { prisma } from '@/lib/db';

/**
 * POST /api/batch/collect-trending
 *
 * 배치 작업: YouTube trending 데이터를 수집하여 DB에 저장
 * Vercel Cron에 의해 3시간마다 자동 실행됩니다.
 *
 * 수집 조합:
 * - 지역: GLOBAL, KR, US, JP, TW, VN (6개)
 * - 카테고리: all + 14개 카테고리 (15개)
 * - 비디오 타입: shorts, videos (2개)
 * - 총 180 조합
 */

// 수집할 지역 목록
const REGIONS = ['GLOBAL', 'KR', 'US', 'JP', 'TW', 'VN'];

// 수집할 카테고리 목록 (null은 'all'을 의미)
const CATEGORIES: (string | null)[] = [
  null,  // all
  '10',  // Music
  '20',  // Gaming
  '25',  // News & Politics
  '22',  // People & Blogs
  '1',   // Film & Animation
  '17',  // Sports
  '27',  // Education
  '28',  // Science & Technology
  '24',  // Entertainment
  '26',  // Howto & Style
  '23',  // Comedy
  '19',  // Travel & Events
  '15',  // Pets & Animals
  '2',   // Autos & Vehicles
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('[Batch] Starting trending data collection...');

    const youtube = getYouTubeClient();
    const collectedAt = new Date();

    let totalCollected = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    // 모든 조합 수집
    for (const regionCode of REGIONS) {
      for (const categoryId of CATEGORIES) {
        const categoryLabel = categoryId || 'all';

        // 1. Shorts 수집
        try {
          console.log(`[Batch] Collecting shorts: ${regionCode}/${categoryLabel}`);

          const shortsResult = await youtube.getTrendingShorts(
            regionCode,
            50,
            categoryId || undefined,
            undefined
          );

          // DB에 저장할 데이터 변환
          const shortsData = shortsResult.items.map((short: any, index: number) => {
            const analytics = calculateVideoAnalytics(short);

            return {
              videoId: short.id,
              videoType: 'short',
              title: short.snippet?.title || '',
              description: short.snippet?.description || '',
              thumbnailUrl:
                short.snippet?.thumbnails?.high?.url ||
                short.snippet?.thumbnails?.medium?.url ||
                short.snippet?.thumbnails?.default?.url ||
                '',
              publishedAt: new Date(short.snippet?.publishedAt),
              duration: short.contentDetails?.duration || '',
              viewCount: parseInt(short.statistics?.viewCount || '0', 10),
              likeCount: parseInt(short.statistics?.likeCount || '0', 10),
              commentCount: parseInt(short.statistics?.commentCount || '0', 10),
              engagementRate: analytics.engagementRate,
              channelId: short.snippet?.channelId || '',
              channelTitle: short.snippet?.channelTitle || '',
              channelThumbnailUrl:
                short.channelInfo?.snippet?.thumbnails?.default?.url,
              subscriberCount: parseInt(
                short.channelInfo?.statistics?.subscriberCount || '0',
                10
              ),
              videoCount: parseInt(
                short.channelInfo?.statistics?.videoCount || '0',
                10
              ),
              regionCode,
              categoryId: categoryId,
              rank: index + 1,
              collectedAt,
            };
          });

          // 기존 데이터 삭제 후 새 데이터 삽입
          await prisma.trendingVideo.deleteMany({
            where: {
              regionCode,
              categoryId: categoryId,
              videoType: 'short',
            },
          });

          if (shortsData.length > 0) {
            await prisma.trendingVideo.createMany({
              data: shortsData,
            });
          }

          totalCollected += shortsData.length;
          console.log(`[Batch] ✓ Collected ${shortsData.length} shorts for ${regionCode}/${categoryLabel}`);
        } catch (error) {
          const errorMsg = `Failed to collect shorts for ${regionCode}/${categoryLabel}`;
          console.error(`[Batch] ✗ ${errorMsg}:`, error);
          errors.push(errorMsg);
          totalErrors++;
        }

        // 2. Videos 수집
        try {
          console.log(`[Batch] Collecting videos: ${regionCode}/${categoryLabel}`);

          const videosResult = await youtube.getTrendingVideos(
            regionCode,
            50,
            categoryId || undefined,
            undefined
          );

          // DB에 저장할 데이터 변환
          const videosData = videosResult.items.map((video: any, index: number) => {
            const analytics = calculateVideoAnalytics(video);

            return {
              videoId: video.id,
              videoType: 'video',
              title: video.snippet?.title || '',
              description: video.snippet?.description || '',
              thumbnailUrl:
                video.snippet?.thumbnails?.high?.url ||
                video.snippet?.thumbnails?.medium?.url ||
                video.snippet?.thumbnails?.default?.url ||
                '',
              publishedAt: new Date(video.snippet?.publishedAt),
              duration: video.contentDetails?.duration || '',
              viewCount: parseInt(video.statistics?.viewCount || '0', 10),
              likeCount: parseInt(video.statistics?.likeCount || '0', 10),
              commentCount: parseInt(video.statistics?.commentCount || '0', 10),
              engagementRate: analytics.engagementRate,
              channelId: video.snippet?.channelId || '',
              channelTitle: video.snippet?.channelTitle || '',
              channelThumbnailUrl:
                video.channelInfo?.snippet?.thumbnails?.default?.url,
              subscriberCount: parseInt(
                video.channelInfo?.statistics?.subscriberCount || '0',
                10
              ),
              videoCount: parseInt(
                video.channelInfo?.statistics?.videoCount || '0',
                10
              ),
              regionCode,
              categoryId: categoryId,
              rank: index + 1,
              collectedAt,
            };
          });

          // 기존 데이터 삭제 후 새 데이터 삽입
          await prisma.trendingVideo.deleteMany({
            where: {
              regionCode,
              categoryId: categoryId,
              videoType: 'video',
            },
          });

          if (videosData.length > 0) {
            await prisma.trendingVideo.createMany({
              data: videosData,
            });
          }

          totalCollected += videosData.length;
          console.log(`[Batch] ✓ Collected ${videosData.length} videos for ${regionCode}/${categoryLabel}`);
        } catch (error) {
          const errorMsg = `Failed to collect videos for ${regionCode}/${categoryLabel}`;
          console.error(`[Batch] ✗ ${errorMsg}:`, error);
          errors.push(errorMsg);
          totalErrors++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(2);

    console.log(`[Batch] Collection completed in ${durationMinutes} minutes`);
    console.log(`[Batch] Total collected: ${totalCollected} videos`);
    console.log(`[Batch] Total errors: ${totalErrors}`);

    return NextResponse.json({
      success: true,
      totalCollected,
      totalErrors,
      errors: errors.slice(0, 10), // 최대 10개만 반환
      collectedAt: collectedAt.toISOString(),
      durationMs: duration,
      durationMinutes,
    });
  } catch (error) {
    console.error('[Batch] Fatal error during collection:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
