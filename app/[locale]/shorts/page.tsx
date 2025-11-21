'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Info } from 'lucide-react';
import { useTrendingShorts, ShortData } from '@/hooks/useTrendingShorts';
import { useTrendingVideos, VideoData } from '@/hooks/useTrendingVideos';
import { RegionSelector } from '@/components/Shorts/RegionSelector';
import { ShortsGrid } from '@/components/Shorts/ShortsGrid';
import { ShortsFilters, FilterOptions } from '@/components/Shorts/ShortsFilters';
import { TrendingInfoModal } from '@/components/Shorts/TrendingInfoModal';

type VideoType = 'shorts' | 'videos' | 'all';
type CombinedVideoData = (ShortData | VideoData) & { isShort?: boolean };

export default function ShortsPage() {
  const t = useTranslations('shorts');
  const locale = useLocale();
  const [regionCode, setRegionCode] = useState('KR');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [videoType, setVideoType] = useState<VideoType>('all');

  const {
    data: shortsData,
    isLoading: shortsLoading,
    error: shortsError,
  } = useTrendingShorts(regionCode);

  const {
    data: videosData,
    isLoading: videosLoading,
    error: videosError,
  } = useTrendingVideos(regionCode);

  const isLoading = shortsLoading || videosLoading;
  const error = shortsError || videosError;

  // Combine and filter videos
  const filteredAndSortedVideos = useMemo(() => {
    // 1. Combine shorts and videos based on videoType
    let combinedVideos: CombinedVideoData[] = [];

    if (videoType === 'all' || videoType === 'shorts') {
      const allShorts = shortsData?.shorts || [];
      const shortsWithFlag = allShorts.map(s => ({ ...s, isShort: true }));
      combinedVideos = [...combinedVideos, ...shortsWithFlag];
    }

    if (videoType === 'all' || videoType === 'videos') {
      const allVideos = videosData?.videos || [];
      const videosWithFlag = allVideos.map(v => ({ ...v, isShort: false }));
      combinedVideos = [...combinedVideos, ...videosWithFlag];
    }

    // 2. Apply filters
    let filtered = combinedVideos.filter((video) => {
      // Subscriber count filter
      if (filters.minSubscribers !== undefined) {
        const subscriberCount = video.channel?.subscriberCount || 0;
        if (subscriberCount < filters.minSubscribers) return false;
      }
      if (filters.maxSubscribers !== undefined) {
        const subscriberCount = video.channel?.subscriberCount || 0;
        if (subscriberCount > filters.maxSubscribers) return false;
      }

      // View count filter
      if (filters.minViews !== undefined) {
        if (video.viewCount < filters.minViews) return false;
      }
      if (filters.maxViews !== undefined) {
        if (video.viewCount > filters.maxViews) return false;
      }

      // Views per subscriber ratio filter
      if (filters.minViewsPerSubscriber !== undefined || filters.maxViewsPerSubscriber !== undefined) {
        const subscriberCount = video.channel?.subscriberCount || 0;
        if (subscriberCount === 0) return false;

        const ratio = video.viewCount / subscriberCount;

        if (filters.minViewsPerSubscriber !== undefined && ratio < filters.minViewsPerSubscriber) {
          return false;
        }
        if (filters.maxViewsPerSubscriber !== undefined && ratio > filters.maxViewsPerSubscriber) {
          return false;
        }
      }

      // Like count filter
      if (filters.minLikes !== undefined) {
        if (video.likeCount < filters.minLikes) return false;
      }
      if (filters.maxLikes !== undefined) {
        if (video.likeCount > filters.maxLikes) return false;
      }

      // Comment count filter
      if (filters.minComments !== undefined) {
        if (video.commentCount < filters.minComments) return false;
      }
      if (filters.maxComments !== undefined) {
        if (video.commentCount > filters.maxComments) return false;
      }

      // Engagement rate filter
      if (filters.minEngagementRate !== undefined) {
        if (video.engagementRate < filters.minEngagementRate) return false;
      }
      if (filters.maxEngagementRate !== undefined) {
        if (video.engagementRate > filters.maxEngagementRate) return false;
      }

      return true;
    });

    // 3. Apply sorting
    const sortBy = filters.sortBy || 'views';
    const sortOrder = filters.sortOrder || 'desc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'views':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'likes':
          comparison = a.likeCount - b.likeCount;
          break;
        case 'comments':
          comparison = a.commentCount - b.commentCount;
          break;
        case 'engagement':
          comparison = a.engagementRate - b.engagementRate;
          break;
        case 'recent':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        default:
          comparison = a.viewCount - b.viewCount;
      }

      return comparison * multiplier;
    });

    return filtered;
  }, [shortsData, videosData, videoType, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t('pageTitle')}
                </h1>
                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title={t('info.title')}
                >
                  <Info className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {t('pageDescription')}
              </p>
            </div>
            <RegionSelector value={regionCode} onChange={setRegionCode} />
          </div>

          {/* Video Type Toggle */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('videoType')}:</span>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
              <button
                onClick={() => setVideoType('shorts')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  videoType === 'shorts'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('showShorts')}
              </button>
              <button
                onClick={() => setVideoType('videos')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  videoType === 'videos'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('showVideos')}
              </button>
              <button
                onClick={() => setVideoType('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  videoType === 'all'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('showAll')}
              </button>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{t('filters.sortBy')}:</span>
            <select
              value={filters.sortBy || 'views'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="views">{t('filters.sortByViews')}</option>
              <option value="likes">{t('filters.sortByLikes')}</option>
              <option value="comments">{t('filters.sortByComments')}</option>
              <option value="engagement">{t('filters.sortByEngagement')}</option>
              <option value="recent">{t('filters.sortByRecent')}</option>
            </select>
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">{t('filters.sortOrderDesc')}</option>
              <option value="asc">{t('filters.sortOrderAsc')}</option>
            </select>
          </div>

          {/* Stats */}
          {!isLoading && (shortsData || videosData) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">{filteredAndSortedVideos.length}</span>
              <span>{t('trendingTitle')}</span>
              <span className="text-gray-400">•</span>
              <span>{shortsData?.region || videosData?.region || regionCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <ShortsFilters filters={filters} onFiltersChange={setFilters} />

          {/* Shorts Grid */}
          <ShortsGrid
            shorts={filteredAndSortedVideos}
            isLoading={isLoading}
            error={error || undefined}
          />
        </div>
      </div>

      {/* Info Modal */}
      <TrendingInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
