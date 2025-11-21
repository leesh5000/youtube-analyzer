'use client';

import {useLocale, useTranslations} from 'next-intl';
import { format, subDays, subWeeks, subMonths, subYears, startOfWeek } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

export type CategoryId =
  | 'all'
  | '10'  // Music
  | '20'  // Gaming
  | '25'  // News & Politics
  | '22'  // People & Blogs
  | '1'   // Film & Animation
  | '17'  // Sports
  | '27'  // Education
  | '28'  // Science & Technology
  | '24'  // Entertainment+
  | '26'  // Howto & Style
  | '23'  // Comedy
  | '19'  // Travel & Events
  | '15'  // Pets & Animals
  | '2';  // Autos & Vehicles

export type RegionCode = 'GLOBAL' | 'KR' | 'US' | 'JP' | 'TW' | 'VN';

export type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'yearEnd' | 'yearly' | 'all';

interface ChartFiltersProps {
  category: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
  region: RegionCode;
  onRegionChange: (region: RegionCode) => void;
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

export function ChartFilters({
  category,
  onCategoryChange,
  region,
  onRegionChange,
  period,
  onPeriodChange,
  selectedDate,
  onDateChange,
}: ChartFiltersProps) {
  const t = useTranslations('chart.filters');
  const locale = useLocale();
  const dateLocale = locale === 'ko' ? ko : enUS;

  const categories: { id: CategoryId; label: string }[] = [
    { id: 'all', label: t('allCategories') },
    { id: '10', label: t('music') },
    { id: '20', label: t('gaming') },
    { id: '25', label: t('news') },
    { id: '22', label: t('people') },
    { id: '1', label: t('film') },
    { id: '17', label: t('sports') },
    { id: '27', label: t('education') },
    { id: '28', label: t('science') },
    { id: '24', label: t('entertainment') },
    { id: '26', label: t('howto') },
    { id: '23', label: t('comedy') },
    { id: '19', label: t('travel') },
    { id: '15', label: t('pets') },
    { id: '2', label: t('autos') },
  ];

  const regions: { id: RegionCode; label: string }[] = [
    { id: 'GLOBAL', label: t('global') },
    { id: 'KR', label: t('korea') },
    { id: 'US', label: t('usa') },
    { id: 'JP', label: t('japan') },
    { id: 'TW', label: t('taiwan') },
    { id: 'VN', label: t('vietnam') },
  ];

  const periodFilters: { id: PeriodFilter; label: string }[] = [
    { id: 'daily', label: t('daily') },
    { id: 'weekly', label: t('weekly') },
    { id: 'monthly', label: t('monthly') },
    { id: 'yearEnd', label: t('yearEnd') },
    { id: 'yearly', label: t('yearly') },
    { id: 'all', label: t('allTime') },
  ];

  // Generate date options based on period
  const generateDates = (): { value: string; label: string }[] => {
    const now = new Date();
    const dates: { value: string; label: string }[] = [];

    switch (period) {
      case 'daily': {
        // Last 14 days
        for (let i = 0; i < 14; i++) {
          const date = subDays(now, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const label = format(date, 'yyyy.MM.dd(E)', { locale: dateLocale });
          dates.push({ value: dateStr, label });
        }
        break;
      }

      case 'weekly': {
        // Last 12 weeks (starting from Monday)
        for (let i = 0; i < 12; i++) {
          const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
          const dateStr = format(weekStart, 'yyyy-MM-dd');
          const weekNumber = 12 - i;
          const label = locale === 'ko'
            ? `${format(weekStart, 'yyyy.MM.dd', { locale: dateLocale })} (${weekNumber}주차)`
            : `${format(weekStart, 'yyyy.MM.dd', { locale: dateLocale })} (Week ${weekNumber})`;
          dates.push({ value: dateStr, label });
        }
        break;
      }

      case 'monthly': {
        // Last 12 months
        for (let i = 0; i < 12; i++) {
          const date = subMonths(now, i);
          const dateStr = format(date, 'yyyy-MM-01');
          const label = locale === 'ko'
            ? `${format(date, 'yyyy.MM', { locale: dateLocale })}월`
            : format(date, 'MMM yyyy', { locale: dateLocale });
          dates.push({ value: dateStr, label });
        }
        break;
      }

      case 'yearly': {
        // Last 5 years
        for (let i = 0; i < 5; i++) {
          const date = subYears(now, i);
          const dateStr = format(date, 'yyyy-01-01');
          const label = locale === 'ko'
            ? `${format(date, 'yyyy', { locale: dateLocale })}년`
            : format(date, 'yyyy', { locale: dateLocale });
          dates.push({ value: dateStr, label });
        }
        break;
      }

      case 'yearEnd': {
        // Last 5 Decembers
        for (let i = 0; i < 5; i++) {
          const year = now.getFullYear() - i;
          const date = new Date(year, 11, 1); // December 1st
          const dateStr = format(date, 'yyyy-12-01');
          const label = locale === 'ko'
            ? `${year}년 12월`
            : `Dec ${year}`;
          dates.push({ value: dateStr, label });
        }
        break;
      }

      case 'all':
      default:
        // No date filter for 'all'
        return [];
    }

    return dates;
  };

  const dateOptions = generateDates();
  const showDateColumn = period !== 'all' && dateOptions.length > 0;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Board-style filter layout */}
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full">
            {/* Category Column */}
            <div className="flex-1 min-w-[180px] border-r border-gray-200 pr-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-700">
                  {t('category')}
                </h3>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                      category === cat.id
                        ? 'bg-red-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Column */}
            <div className="flex-1 min-w-[130px] border-r border-gray-200 px-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-700">
                  {t('country')}
                </h3>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => onRegionChange(reg.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                      region === reg.id
                        ? 'bg-red-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Filter Column */}
            <div className={`flex-1 min-w-[110px] px-3 ${showDateColumn ? 'border-r border-gray-200' : ''}`}>
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-gray-700">
                  {t('period')}
                </h3>
              </div>
              <div className="space-y-0.5">
                {periodFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => onPeriodChange(filter.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                      period === filter.id
                        ? 'bg-red-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Column (conditional) */}
            {showDateColumn && (
              <div className="flex-1 min-w-[150px] px-3">
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-700">
                    {t('date')}
                  </h3>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-2">
                  {dateOptions.map((dateOption) => (
                    <button
                      key={dateOption.value}
                      onClick={() => onDateChange(dateOption.value)}
                      className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                        selectedDate === dateOption.value
                          ? 'bg-red-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {dateOption.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
