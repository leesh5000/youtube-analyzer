'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChannelSearch } from '@/components/ChannelSearch';
import { ChannelInfo } from '@/components/ChannelInfo';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { VideoList } from '@/components/VideoList';
import { useChannelAnalysis } from '@/hooks/useChannelAnalysis';
import { Loader2, Youtube } from 'lucide-react';

export default function Home() {
  const t = useTranslations();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );

  const { data, isLoading, error } = useChannelAnalysis(selectedChannelId);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleReset = () => {
    setSelectedChannelId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-red-600 rounded-lg flex-shrink-0">
                <Youtube className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {t('home.title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {t('home.subtitle')}
                </p>
              </div>
            </div>
            {selectedChannelId && (
              <button
                onClick={handleReset}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">{t('home.newSearch')}</span>
                <span className="sm:hidden">{t('home.newSearchShort')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedChannelId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {t('home.searchPlaceholder')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {t('home.searchDescription')}
              </p>
            </div>
            <ChannelSearch onChannelSelect={handleChannelSelect} />
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">{t('home.analyzing')}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-semibold mb-2">
                  {t('home.errorTitle')}
                </p>
                <p className="text-red-500 text-sm">
                  {t('home.errorMessage')}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('home.retryButton')}
                </button>
              </div>
            )}

            {data && (
              <div className="space-y-6">
                {/* 채널 정보 */}
                <ChannelInfo channel={data.channel} />

                {/* 분석 대시보드 */}
                <AnalyticsDashboard
                  analytics={data.analytics}
                  performance={data.performance}
                />

                {/* 비디오 리스트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <VideoList topVideos={data.topVideos} type="top" />
                  <VideoList hiddenGems={data.hiddenGems} type="hidden" />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            {t('home.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
