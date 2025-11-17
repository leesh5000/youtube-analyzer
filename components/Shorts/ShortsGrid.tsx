'use client';

import { useTranslations } from 'next-intl';
import { ShortData } from '@/hooks/useTrendingShorts';
import { ShortsCard } from './ShortsCard';

interface ShortsGridProps {
  shorts: ShortData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ShortsGrid({ shorts, isLoading, error }: ShortsGridProps) {
  const t = useTranslations('shorts');

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-semibold mb-2">
          {t('error')}
        </div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  // 빈 상태
  if (!shorts || shorts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg font-semibold mb-2">
          {t('noShorts')}
        </div>
        <p className="text-gray-400">{t('noShortsDescription')}</p>
      </div>
    );
  }

  // Shorts 그리드
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {shorts.map((short) => (
        <ShortsCard key={short.id} short={short} />
      ))}
    </div>
  );
}
