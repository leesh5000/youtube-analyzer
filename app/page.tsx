'use client';

import { useState } from 'react';
import { ChannelSearch } from '@/components/ChannelSearch';
import { ChannelInfo } from '@/components/ChannelInfo';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { VideoList } from '@/components/VideoList';
import { useChannelAnalysis } from '@/hooks/useChannelAnalysis';
import { Loader2, Youtube } from 'lucide-react';

export default function Home() {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  YouTube Analyzer
                </h1>
                <p className="text-sm text-gray-600">
                  채널 성과를 분석하고 인사이트를 제공합니다
                </p>
              </div>
            </div>
            {selectedChannelId && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                새로운 검색
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedChannelId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                분석할 채널을 검색하세요
              </h2>
              <p className="text-gray-600">
                채널 이름을 검색하고 분석을 시작하세요
              </p>
            </div>
            <ChannelSearch onChannelSelect={handleChannelSelect} />
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">채널 데이터를 분석 중입니다...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-semibold mb-2">
                  오류가 발생했습니다
                </p>
                <p className="text-red-500 text-sm">
                  채널 정보를 불러올 수 없습니다. 다시 시도해주세요.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 검색하기
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            YouTube Analyzer - Powered by YouTube Data API v3
          </p>
        </div>
      </footer>
    </div>
  );
}
