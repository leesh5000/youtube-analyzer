'use client';

import { Users, Eye, Video, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

interface ChannelInfoProps {
  channel: {
    id: string;
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: string;
      medium?: string;
      high?: string;
    };
    statistics: {
      subscriberCount: number;
      viewCount: number;
      videoCount: number;
    };
  };
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    const dateLocale = locale === 'ko' ? ko : enUS;
    const dateFormat = t('channel.createdDateFormat');
    return format(new Date(dateString), dateFormat, { locale: dateLocale });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {channel.thumbnails.high && (
          <img
            src={channel.thumbnails.high}
            alt={channel.title}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto md:mx-0 flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">
            {channel.title}
          </h2>

          {channel.customUrl && (
            <a
              href={`https://youtube.com/${channel.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs sm:text-sm mb-3 inline-block break-all"
            >
              {channel.customUrl}
            </a>
          )}

          <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
            {channel.description}
          </p>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 justify-center md:justify-start">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{t('channel.createdDate')}: {formatDate(channel.publishedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
          <div className="p-2 sm:p-3 bg-red-500 rounded-full flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">{t('channel.subscribers')}</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {formatNumber(channel.statistics.subscriberCount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="p-2 sm:p-3 bg-blue-500 rounded-full flex-shrink-0">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">{t('channel.totalViews')}</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {formatNumber(channel.statistics.viewCount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="p-2 sm:p-3 bg-green-500 rounded-full flex-shrink-0">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">{t('channel.videos')}</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {formatNumber(channel.statistics.videoCount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
