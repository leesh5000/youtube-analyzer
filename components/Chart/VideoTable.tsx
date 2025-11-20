'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ShortData } from '@/hooks/useTrendingShorts';
import { VideoTableRow } from './VideoTableRow';

interface VideoTableProps {
  videos: (ShortData & { isShort?: boolean })[];
  isLoading?: boolean;
  error?: string | null;
}

type SortField = 'rank' | 'views' | 'subscribers' | 'ratio' | 'likes' | 'comments' | 'publishedAt';
type SortOrder = 'asc' | 'desc';

export function VideoTable({ videos, isLoading, error }: VideoTableProps) {
  const t = useTranslations('chart');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' || field === 'publishedAt' ? 'asc' : 'desc');
    }
  };

  const sortedVideos = useMemo(() => {
    const sorted = [...videos];

    sorted.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case 'rank':
          // Rank is based on original order
          aValue = videos.indexOf(a);
          bValue = videos.indexOf(b);
          break;
        case 'views':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        case 'subscribers':
          aValue = a.channel?.subscriberCount || 0;
          bValue = b.channel?.subscriberCount || 0;
          break;
        case 'ratio':
          aValue = (a.channel?.subscriberCount || 0) > 0
            ? a.viewCount / (a.channel?.subscriberCount || 1)
            : 0;
          bValue = (b.channel?.subscriberCount || 0) > 0
            ? b.viewCount / (b.channel?.subscriberCount || 1)
            : 0;
          break;
        case 'likes':
          aValue = a.likeCount;
          bValue = b.likeCount;
          break;
        case 'comments':
          aValue = a.commentCount;
          bValue = b.commentCount;
          break;
        case 'publishedAt':
          aValue = new Date(a.publishedAt).getTime();
          bValue = new Date(b.publishedAt).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [videos, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-2">{t('error')}</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 mb-2">{t('noVideos')}</p>
        <p className="text-sm text-gray-500">{t('noVideosDescription')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50 border-b">
          <tr>
            {/* Rank */}
            <th
              className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('rank')}
            >
              {t('table.rank')}
              <SortIcon field="rank" />
            </th>

            {/* Video */}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              {t('table.video')}
            </th>

            {/* Views - Hidden on mobile */}
            <th
              className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('views')}
            >
              {t('table.views')}
              <SortIcon field="views" />
            </th>

            {/* Subscribers - Hidden on mobile */}
            <th
              className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('subscribers')}
            >
              {t('table.subscribers')}
              <SortIcon field="subscribers" />
            </th>

            {/* Ratio - Always visible */}
            <th
              className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('ratio')}
            >
              {t('table.ratio')}
              <SortIcon field="ratio" />
            </th>

            {/* Likes - Hidden on mobile */}
            <th
              className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('likes')}
            >
              {t('table.likes')}
              <SortIcon field="likes" />
            </th>

            {/* Comments - Hidden on mobile */}
            <th
              className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('comments')}
            >
              {t('table.comments')}
              <SortIcon field="comments" />
            </th>

            {/* Published Date - Hidden on mobile */}
            <th
              className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('publishedAt')}
            >
              {t('table.publishedAt')}
              <SortIcon field="publishedAt" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVideos.map((video, index) => (
            <VideoTableRow
              key={video.id}
              video={video}
              rank={index + 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
