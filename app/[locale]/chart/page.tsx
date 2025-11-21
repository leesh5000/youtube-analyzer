'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { format, parseISO, startOfDay, endOfDay, addDays } from 'date-fns';

type VideoType = 'shorts' | 'videos';
type CombinedVideoData = (ShortData | VideoData) & { isShort?: boolean };

// Get today's date in yyyy-MM-dd format
const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

export default function ChartPage() {
  const t = useTranslations('chart');
  // 초기값: 전체/전세계/일간/오늘날짜
  const [regionCode, setRegionCode] = useState<RegionCode>('GLOBAL');
  const [videoType, setVideoType] = useState<VideoType>('shorts');
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [period, setPeriod] = useState<PeriodFilter>('daily');
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDateString());

  // Reset selectedDate when period changes to 'all'
  useEffect(() => {
    if (period === 'all') {
      setSelectedDate(null);
    } else if (!selectedDate) {
      // If period is not 'all' but no date selected, set to today
      setSelectedDate(getTodayDateString());
    }
  }, [period, selectedDate]);

  // Convert category to videoCategoryId
  const videoCategoryId = category === 'all' ? undefined : category;

  const {
    data: shortsData,
    isLoading: shortsLoading,
    error: shortsError,
  } = useTrendingShorts(regionCode, videoCategoryId, period);

  const {
    data: videosData,
    isLoading: videosLoading,
    error: videosError,
  } = useTrendingVideos(regionCode, videoCategoryId, period);

  const isLoading = videoType === 'shorts' ? shortsLoading : videosLoading;
  const error = videoType === 'shorts' ? shortsError : videosError;

  // Get current videos based on selected type
  const currentVideos = useMemo(() => {
    let videos: CombinedVideoData[] = [];

    if (videoType === 'shorts') {
      const allShorts = shortsData?.shorts || [];
      videos = allShorts.map(s => ({ ...s, isShort: true }));
    } else {
      const allVideos = videosData?.videos || [];
      videos = allVideos.map(v => ({ ...v, isShort: false }));
    }

    return videos;
  }, [shortsData, videosData, videoType]);

  // Apply filters: date and hidden gems
  const filteredVideos = useMemo(() => {
    let videos = [...currentVideos];

    // Date filter
    if (selectedDate && period !== 'all') {
      const selectedDateObj = parseISO(selectedDate);

      videos = videos.filter(video => {
        const publishedAt = parseISO(video.publishedAt);

        switch (period) {
          case 'daily': {
            // Same day
            const dayStart = startOfDay(selectedDateObj);
            const dayEnd = endOfDay(selectedDateObj);
            return publishedAt >= dayStart && publishedAt <= dayEnd;
          }

          case 'weekly': {
            // 7 days starting from selected Monday
            const weekEnd = addDays(selectedDateObj, 7);
            return publishedAt >= selectedDateObj && publishedAt < weekEnd;
          }

          case 'monthly': {
            // Same month and year
            const videoMonth = publishedAt.getMonth();
            const videoYear = publishedAt.getFullYear();
            const selectedMonth = selectedDateObj.getMonth();
            const selectedYear = selectedDateObj.getFullYear();
            return videoMonth === selectedMonth && videoYear === selectedYear;
          }

          case 'yearly': {
            // Same year
            const videoYear = publishedAt.getFullYear();
            const selectedYear = selectedDateObj.getFullYear();
            return videoYear === selectedYear;
          }

          case 'yearEnd': {
            // December of selected year
            const videoMonth = publishedAt.getMonth();
            const videoYear = publishedAt.getFullYear();
            const selectedYear = selectedDateObj.getFullYear();
            return videoMonth === 11 && videoYear === selectedYear; // December = month 11
          }

          default:
            return true;
        }
      });
    }

    // Hidden gems filter
    if (showHiddenGemsOnly) {
      videos = videos.filter(video => {
        const subscriberCount = video.channel?.subscriberCount || 0;
        if (subscriberCount === 0) return false;
        const ratio = video.viewCount / subscriberCount;
        return ratio >= 2.0; // Hidden gem threshold
      });
    }

    return videos;
  }, [currentVideos, showHiddenGemsOnly, selectedDate, period]);

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

        </div>
      </div>
    </div>
  );
}
