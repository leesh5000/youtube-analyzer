'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { CategoryId } from '@/components/Chart/ChartFilters';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  channelTitle: string;
  channel?: {
    subscriberCount: number;
  };
}

interface CategoryRankingSectionProps {
  categoryId: CategoryId;
  categoryName: string;
  videos: Video[];
  videoType: 'shorts' | 'videos';
  isLoading?: boolean;
}

export function CategoryRankingSection({
  categoryId,
  categoryName,
  videos,
  videoType,
  isLoading,
}: CategoryRankingSectionProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 flex gap-3 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 flex gap-3">
                <div className="w-20 h-14 bg-gray-200 rounded flex-shrink-0"></div>
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

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">{categoryName}</h3>
        </div>
        <div className="p-8">
          <p className="text-xs text-gray-400 text-center">
            {t('home.noVideos')}
          </p>
        </div>
      </div>
    );
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-red-500 font-bold';
    if (index === 1) return 'text-orange-500 font-bold';
    if (index === 2) return 'text-yellow-600 font-bold';
    return 'text-gray-600 font-semibold';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{categoryName}</h3>
        <Link
          href={`/${locale}/chart?category=${categoryId}&videoType=${videoType}`}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {t('home.viewAll')}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Video List */}
      <div className="divide-y divide-gray-50">
        {videos.slice(0, 5).map((video, index) => (
          <Link
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              <span className={`text-sm ${getRankColor(index)}`}>
                {index + 1}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 flex gap-3 min-w-0">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-20 sm:w-24">
                <div className="relative aspect-video rounded overflow-hidden bg-gray-100">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{video.channelTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{formatNumber(video.viewCount)}</span>
                  {video.channel?.subscriberCount && (
                    <>
                      <span>•</span>
                      <span>{formatNumber(video.channel.subscriberCount)}</span>
                    </>
                  )}
                </div>
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