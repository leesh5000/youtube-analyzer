'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTrendingShorts, ShortData } from '@/hooks/useTrendingShorts';
import { useTrendingVideos, VideoData } from '@/hooks/useTrendingVideos';
import { VideoTable } from '@/components/Chart/VideoTable';
import {
  ChartFilters,
  CategoryId,
  RegionCode,
  PeriodFilter,
} from '@/components/Chart/ChartFilters';

type VideoType = 'shorts' | 'videos';
type CombinedVideoData = (ShortData | VideoData) & { isShort?: boolean };

export default function ChartPage() {
  const t = useTranslations('chart');
  const [regionCode, setRegionCode] = useState<RegionCode>('KR');
  const [videoType, setVideoType] = useState<VideoType>('shorts');
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [period, setPeriod] = useState<PeriodFilter>('daily');

  // Set default date to today
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDate());

  // Convert category to videoCategoryId
  const videoCategoryId = category === 'all' ? undefined : category;

  const {
    data: shortsData,
    isLoading: shortsLoading,
    error: shortsError,
    fetchNextPage: fetchNextShortsPage,
    hasNextPage: hasNextShortsPage,
    isFetchingNextPage: isFetchingNextShortsPage,
  } = useTrendingShorts(regionCode, videoCategoryId);

  const {
    data: videosData,
    isLoading: videosLoading,
    error: videosError,
    fetchNextPage: fetchNextVideosPage,
    hasNextPage: hasNextVideosPage,
    isFetchingNextPage: isFetchingNextVideosPage,
  } = useTrendingVideos(regionCode, videoCategoryId);

  const isLoading = videoType === 'shorts' ? shortsLoading : videosLoading;
  const error = videoType === 'shorts' ? shortsError : videosError;
  const isFetchingMore = videoType === 'shorts' ? isFetchingNextShortsPage : isFetchingNextVideosPage;
  const hasNextPage = videoType === 'shorts' ? hasNextShortsPage : hasNextVideosPage;
  const fetchNextPage = videoType === 'shorts' ? fetchNextShortsPage : fetchNextVideosPage;

  // Get current videos based on selected type
  const currentVideos = useMemo(() => {
    let videos: CombinedVideoData[] = [];

    if (videoType === 'shorts') {
      const allShorts = shortsData?.pages.flatMap(page => page.shorts) || [];
      videos = allShorts.map(s => ({ ...s, isShort: true }));
    } else {
      const allVideos = videosData?.pages.flatMap(page => page.videos) || [];
      videos = allVideos.map(v => ({ ...v, isShort: false }));
    }

    return videos;
  }, [shortsData?.pages, videosData?.pages, videoType]);

  // Apply filters: period/date filter and hidden gems
  const filteredVideos = useMemo(() => {
    let videos = [...currentVideos];

    // 1. Period and date filter
    if (period !== 'all' || selectedDate) {
      const now = new Date();

      videos = videos.filter(video => {
        const publishedDate = new Date(video.publishedAt);

        // If specific date is selected
        if (selectedDate) {
          const parts = selectedDate.split('.');

          switch (period) {
            case 'daily': {
              // Filter by specific day
              const [year, month, day] = parts;
              const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              const videoDate = new Date(publishedDate.getFullYear(), publishedDate.getMonth(), publishedDate.getDate());
              return videoDate.getTime() === targetDate.getTime();
            }

            case 'weekly': {
              // Filter by week starting from the selected date
              const [year, month, day] = parts;
              const weekStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 7);
              return publishedDate >= weekStart && publishedDate < weekEnd;
            }

            case 'monthly': {
              // Filter by specific month
              const [year, month] = parts;
              return publishedDate.getFullYear() === parseInt(year) &&
                     publishedDate.getMonth() === parseInt(month) - 1;
            }

            case 'yearly': {
              // Filter by specific year
              const year = parts[0];
              return publishedDate.getFullYear() === parseInt(year);
            }

            case 'yearEnd': {
              // Filter by December of specific year
              const [year] = parts;
              return publishedDate.getFullYear() === parseInt(year) &&
                     publishedDate.getMonth() === 11; // December
            }

            default:
              return true;
          }
        }

        // If no specific date selected, filter by period
        let cutoffDate: Date;
        switch (period) {
          case 'daily':
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'weekly':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'yearly':
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          case 'yearEnd':
            // Year-end: December of current year
            const currentYear = now.getFullYear();
            cutoffDate = new Date(currentYear, 11, 1); // December 1st
            return publishedDate >= cutoffDate;
          default:
            return true;
        }

        return publishedDate >= cutoffDate;
      });
    }

    // 2. Hidden gems filter
    if (showHiddenGemsOnly) {
      videos = videos.filter(video => {
        const subscriberCount = video.channel?.subscriberCount || 0;
        if (subscriberCount === 0) return false;
        const ratio = video.viewCount / subscriberCount;
        return ratio >= 2.0; // Hidden gem threshold
      });
    }

    return videos;
  }, [currentVideos, period, selectedDate, showHiddenGemsOnly]);

  const hiddenGemsCount = useMemo(() => {
    return currentVideos.filter(video => {
      const subscriberCount = video.channel?.subscriberCount || 0;
      if (subscriberCount === 0) return false;
      const ratio = video.viewCount / subscriberCount;
      return ratio >= 2.0;
    }).length;
  }, [currentVideos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('pageTitle')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('pageDescription')}
              </p>
            </div>
          </div>

          {/* Video Type Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setVideoType('shorts')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  videoType === 'shorts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('tabs.shorts')}
              </button>
              <button
                onClick={() => setVideoType('videos')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  videoType === 'videos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('tabs.videos')}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ChartFilters
        category={category}
        onCategoryChange={setCategory}
        region={regionCode}
        onRegionChange={setRegionCode}
        period={period}
        onPeriodChange={setPeriod}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Secondary Header with Hidden Gems Toggle */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showHiddenGemsOnly
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showHiddenGemsOnly ? t('filters.hiddenGemsOnly') : t('filters.showAll')}
              </button>
              {hiddenGemsCount > 0 && (
                <span className="text-sm text-gray-600">
                  {t('filters.risingVideos', { count: hiddenGemsCount })}
                </span>
              )}
            </div>

            {/* Stats */}
            {!isLoading && (shortsData || videosData) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">{filteredVideos.length}</span>
                <span>{t('totalVideos', { count: filteredVideos.length })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Video Table */}
          <VideoTable
            videos={filteredVideos}
            isLoading={isLoading}
            error={error ? error.message : undefined}
          />

          {/* Load More Button */}
          {!isLoading && hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingMore}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isFetchingMore ? t('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
