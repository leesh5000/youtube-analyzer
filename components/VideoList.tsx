'use client';

import { Eye, ThumbsUp, MessageCircle, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';

interface TopVideo {
  id: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  publishedAt: string;
}

interface HiddenGem {
  id: string;
  title: string;
  viewCount: number;
  viewsToSubscriberRatio: number;
  publishedAt: string;
}

interface VideoListProps {
  topVideos?: TopVideo[];
  hiddenGems?: HiddenGem[];
  type: 'top' | 'hidden';
}

export function VideoList({ topVideos, hiddenGems, type }: VideoListProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    const dateLocale = locale === 'ko' ? ko : enUS;
    const dateFormat = t('videos.dateFormat');
    return format(new Date(dateString), dateFormat, { locale: dateLocale });
  };

  if (type === 'top' && topVideos) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {t('videos.topVideos')}
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {topVideos.map((video, index) => (
            <a
              key={video.id}
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-blue-600">
                    {video.title}
                  </h4>

                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.viewCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.likeCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.commentCount)}</span>
                    </div>
                    <div className="text-purple-600 font-semibold whitespace-nowrap">
                      {t('videos.engagement')}: {video.engagementRate.toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                    {formatDate(video.publishedAt)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'hidden' && hiddenGems) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {t('videos.hiddenGems')}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          {t('videos.hiddenGemsDesc')}
        </p>

        {hiddenGems.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
            {t('videos.noHiddenGems')}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {hiddenGems.map((video, index) => (
              <a
                key={video.id}
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition-all bg-gradient-to-r from-yellow-50 to-transparent"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-yellow-600">
                      {video.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{formatNumber(video.viewCount)}</span>
                      </div>
                      <div className="text-yellow-600 font-semibold whitespace-nowrap">
                        {t('videos.subscriberRatio')}: {video.viewsToSubscriberRatio.toFixed(2)}x
                      </div>
                    </div>

                    <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                      {formatDate(video.publishedAt)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
