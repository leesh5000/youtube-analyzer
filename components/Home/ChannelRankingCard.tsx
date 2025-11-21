'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import type { ChannelRanking } from '@/hooks/useHomeRankings';

interface ChannelRankingCardProps {
  title: string;
  channels: ChannelRanking[];
  metricKey: 'subscribers' | 'trendingCount' | 'growth';
  isLoading?: boolean;
}

export function ChannelRankingCard({
  title,
  channels,
  metricKey,
  isLoading,
}: ChannelRankingCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatMetric = (channel: ChannelRanking) => {
    switch (metricKey) {
      case 'subscribers':
        return formatNumber(channel.subscriberCount);
      case 'trendingCount':
        return `${channel.trendingCount || 0}${t('home.metrics.trendingCount')}`;
      case 'growth':
        return channel.growth ? `+${formatNumber(channel.growth)}` : '-';
    }
  };

  const getMetricColor = () => {
    switch (metricKey) {
      case 'subscribers':
        return 'text-blue-600';
      case 'trendingCount':
        return 'text-purple-600';
      case 'growth':
        return 'text-green-600';
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-red-500 font-bold';
    if (index === 1) return 'text-orange-500 font-bold';
    if (index === 2) return 'text-yellow-600 font-bold';
    return 'text-gray-600 font-semibold';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 flex gap-3 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-8">
          <p className="text-xs text-gray-400 text-center">
            {t('home.noVideos')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{t('home.viewAll')}</span>
      </div>

      {/* Channel List */}
      <div className="divide-y divide-gray-50">
        {channels.slice(0, 5).map((channel, index) => (
          <Link
            key={`${metricKey}-${channel.id}-${index}`}
            href={`https://www.youtube.com/channel/${channel.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group items-center"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              <span className={`text-sm ${getRankColor(index)}`}>
                {index + 1}
              </span>
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {channel.title}
              </h4>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className={`font-semibold ${getMetricColor()}`}>
                  {formatMetric(channel)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">•••</p>
      </div>
    </div>
  );
}
