'use client';

import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ShortData } from '@/hooks/useTrendingShorts';

interface VideoTableRowProps {
  video: ShortData & { isShort?: boolean };
  rank: number;
}

export function VideoTableRow({ video, rank }: VideoTableRowProps) {
  const t = useTranslations('chart');
  const locale = useLocale();
  const isShort = video.isShort !== false;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(num);
  };

  const formatCompactNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const subscriberCount = video.channel?.subscriberCount || 0;
  const viewsToSubscriberRatio = subscriberCount > 0 ? video.viewCount / subscriberCount : 0;
  const isHiddenGem = viewsToSubscriberRatio >= 2.0;

  const videoUrl = isShort
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;

  const dateLocale = locale === 'ko' ? ko : enUS;
  const formattedDate = format(new Date(video.publishedAt), 'yyyy.MM.dd', { locale: dateLocale });

  return (
    <tr
      className={`border-b hover:bg-gray-50 transition-colors ${
        isHiddenGem ? 'bg-yellow-50' : ''
      }`}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center font-semibold text-gray-700">
        {rank}
      </td>

      {/* Video (Thumbnail + Title + Channel) */}
      <td className="px-4 py-3">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 hover:opacity-80 transition-opacity"
        >
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-32 h-18 rounded overflow-hidden bg-gray-200">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            {isShort && (
              <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                Shorts
              </div>
            )}
            {isHiddenGem && (
              <div className="absolute top-1 right-1 bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                {t('hiddenGemBadge')}
              </div>
            )}
          </div>

          {/* Title and Channel */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
              {video.title}
            </h3>
            {video.channel && (
              <div className="flex items-center gap-2">
                {video.channel.thumbnailUrl && (
                  <img
                    src={video.channel.thumbnailUrl}
                    alt={video.channel.title}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <p className="text-xs text-gray-600 truncate">
                  {video.channel.title}
                </p>
              </div>
            )}
          </div>
        </a>
      </td>

      {/* Views - Hidden on mobile */}
      <td className="hidden md:table-cell px-4 py-3 text-right text-sm text-gray-900">
        {formatCompactNumber(video.viewCount)}
      </td>

      {/* Subscribers - Hidden on mobile */}
      <td className="hidden md:table-cell px-4 py-3 text-right text-sm text-gray-900">
        {video.channel ? formatCompactNumber(video.channel.subscriberCount) : '-'}
      </td>

      {/* Ratio - Always visible, highlighted for hidden gems */}
      <td className="px-4 py-3 text-right text-sm">
        <span
          className={`font-semibold ${
            isHiddenGem ? 'text-yellow-700' : 'text-gray-900'
          }`}
          title={t('ratioTooltip')}
        >
          {viewsToSubscriberRatio >= 0.1 ? viewsToSubscriberRatio.toFixed(1) : '0.0'}x
        </span>
      </td>

      {/* Likes - Hidden on mobile */}
      <td className="hidden lg:table-cell px-4 py-3 text-right text-sm text-gray-900">
        {formatCompactNumber(video.likeCount)}
      </td>

      {/* Comments - Hidden on mobile */}
      <td className="hidden lg:table-cell px-4 py-3 text-right text-sm text-gray-900">
        {formatCompactNumber(video.commentCount)}
      </td>

      {/* Published Date - Hidden on mobile */}
      <td className="hidden lg:table-cell px-4 py-3 text-right text-sm text-gray-600">
        {formattedDate}
      </td>
    </tr>
  );
}
