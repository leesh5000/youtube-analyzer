'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useHomeRankings } from '@/hooks/useHomeRankings';
import { VideoRankingCard } from '@/components/Home/VideoRankingCard';
import { ChannelRankingCard } from '@/components/Home/ChannelRankingCard';
import { HorizontalVideoScroll } from '@/components/Home/HorizontalVideoScroll';

type VideoType = 'shorts' | 'videos';
type Period = 'daily' | 'weekly' | 'monthly' | 'all';

export default function Home() {
  const t = useTranslations();
  const [videoType, setVideoType] = useState<VideoType>('shorts');
  const [period, setPeriod] = useState<Period>('all');

  // Fetch ranking data
  const { data, isLoading } = useHomeRankings(videoType, period);

  const rankings = data?.rankings;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('home.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('home.subtitle')}
              </p>
            </div>

            {/* Video Type Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setVideoType('shorts')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    videoType === 'shorts'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('home.topShorts')}
                </button>
                <button
                  onClick={() => setVideoType('videos')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    videoType === 'videos'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('home.topVideos')}
                </button>
              </nav>
            </div>

            {/* Period Filter */}
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly', 'all'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`home.periods.${p}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - 3x2 Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Row 1: Video Rankings */}
          <VideoRankingCard
            title={t('home.rankings.topVideos')}
            videos={rankings?.topVideos || []}
            metricKey="views"
            isLoading={isLoading}
          />
          <VideoRankingCard
            title={t('home.rankings.risingVideos')}
            videos={rankings?.risingVideos || []}
            metricKey="ratio"
            isLoading={isLoading}
          />
          <VideoRankingCard
            title={t('home.rankings.highEngagement')}
            videos={rankings?.highEngagement || []}
            metricKey="engagement"
            isLoading={isLoading}
          />

          {/* Row 2: Channel Rankings */}
          <ChannelRankingCard
            title={t('home.rankings.topChannels')}
            channels={rankings?.topChannels || []}
            metricKey="subscribers"
            isLoading={isLoading}
          />
          <ChannelRankingCard
            title={t('home.rankings.activeChannels')}
            channels={rankings?.activeChannels || []}
            metricKey="trendingCount"
            isLoading={isLoading}
          />
          <ChannelRankingCard
            title={t('home.rankings.subscriberSurge')}
            channels={rankings?.subscriberSurge || []}
            metricKey="growth"
            isLoading={isLoading}
          />
        </div>

        {/* Horizontal Scroll Section */}
        <HorizontalVideoScroll
          title={t('home.rankings.latestTrending')}
          videos={rankings?.latestTrending || []}
          isLoading={isLoading}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            {t('home.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
