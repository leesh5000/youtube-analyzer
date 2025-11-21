'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { LatestTrendingVideo } from '@/hooks/useHomeRankings';

interface HorizontalVideoScrollProps {
  title: string;
  videos: LatestTrendingVideo[];
  isLoading?: boolean;
}

export function HorizontalVideoScroll({
  title,
  videos,
  isLoading,
}: HorizontalVideoScrollProps) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="p-4">
          <div className="flex gap-3 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-32 animate-pulse">
                <div className="relative">
                  <div className="w-32 h-18 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
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
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>

      {/* Horizontal Scroll */}
      <div className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {videos.map((video, index) => (
            <Link
              key={`latest-${video.id}-${index}`}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-32 sm:w-40 group"
            >
              {/* Thumbnail with rank badge */}
              <div className="relative">
                <div className="relative aspect-video rounded overflow-hidden bg-gray-100">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                {/* Rank Badge */}
                <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-2">
                <h4 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {video.channelTitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
