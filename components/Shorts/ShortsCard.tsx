'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ThumbsUp, MessageCircle, Eye, TrendingUp } from 'lucide-react';
import { ShortData } from '@/hooks/useTrendingShorts';
import { formatDuration } from '@/lib/youtube/utils';
import { parseDuration } from '@/lib/youtube/utils';

interface ShortsCardProps {
  short: ShortData & { isShort?: boolean };
}

export function ShortsCard({ short }: ShortsCardProps) {
  const t = useTranslations('shorts');
  const locale = useLocale();
  const isShort = short.isShort !== false; // Default to true for backwards compatibility

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const formatFullNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(num);
  };

  const durationSeconds = parseDuration(short.duration);
  const formattedDuration = formatDuration(durationSeconds);

  const videoUrl = isShort
    ? `https://www.youtube.com/shorts/${short.id}`
    : `https://www.youtube.com/watch?v=${short.id}`;

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* 썸네일 - 모든 동영상 동일한 비율 (3:4) */}
        <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            src={short.thumbnailUrl}
            alt={short.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
            {formattedDuration}
          </div>
          {/* Shorts icon - only for shorts */}
          {isShort && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              Shorts
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 제목 */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {short.title}
          </h3>

          {/* 채널 정보 */}
          {short.channel && (
            <div className="flex items-center gap-2 mb-3">
              {short.channel.thumbnailUrl && (
                <img
                  src={short.channel.thumbnailUrl}
                  alt={short.channel.title}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">
                  {short.channel.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(short.channel.subscriberCount)} {t('subscribers')}
                </p>
              </div>
            </div>
          )}

          {/* 통계 정보 */}
          <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
            <div className="flex items-center gap-1 text-gray-600" title={formatFullNumber(short.viewCount)}>
              <Eye className="w-4 h-4" />
              <span>{formatNumber(short.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600" title={formatFullNumber(short.likeCount)}>
              <ThumbsUp className="w-4 h-4" />
              <span>{formatNumber(short.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600" title={formatFullNumber(short.commentCount)}>
              <MessageCircle className="w-4 h-4" />
              <span>{formatNumber(short.commentCount)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600" title={`${short.engagementRate.toFixed(2)}%`}>
              <TrendingUp className="w-4 h-4" />
              <span>{short.engagementRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
