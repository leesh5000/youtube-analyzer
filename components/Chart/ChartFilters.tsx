'use client';

import {useLocale, useTranslations} from 'next-intl';

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

  // Generate date list based on selected period
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = locale === 'ko'
      ? ['일', '월', '화', '수', '목', '금', '토']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    switch (period) {
      case 'daily': {
        // Show last 14 days
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}.${month}.${day}`;
          const dayOfWeek = dayNames[date.getDay()];

          dates.push({
            value: dateStr,
            label: `${dateStr}(${dayOfWeek})`,
          });
        }
        break;
      }

      case 'weekly': {
        // Show last 12 weeks (starting from Monday of each week)
        for (let i = 0; i < 12; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - (i * 7));

          // Get Monday of this week
          const dayOfWeek = date.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
          date.setDate(date.getDate() - diff);

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}.${month}.${day}`;

          // Calculate week number
          const weekNum = 12 - i;
          const label = locale === 'ko'
            ? `${dateStr} (${weekNum}주차)`
            : `${dateStr} (Week ${weekNum})`;

          dates.push({
            value: dateStr,
            label,
          });
        }
        break;
      }

      case 'monthly': {
        // Show last 12 months
        for (let i = 0; i < 12; i++) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          date.setDate(1); // First day of month

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dateStr = `${year}.${month}`;

          const monthNames = locale === 'ko'
            ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthName = monthNames[date.getMonth()];

          dates.push({
            value: dateStr,
            label: `${year}.${monthName}`,
          });
        }
        break;
      }

      case 'yearly': {
        // Show last 5 years
        for (let i = 0; i < 5; i++) {
          const year = today.getFullYear() - i;
          const dateStr = `${year}`;

          dates.push({
            value: dateStr,
            label: locale === 'ko' ? `${year}년` : `${year}`,
          });
        }
        break;
      }

      case 'yearEnd': {
        // Show last 5 year-ends (December)
        for (let i = 0; i < 5; i++) {
          const year = today.getFullYear() - i;
          const dateStr = `${year}.12`;

          dates.push({
            value: dateStr,
            label: locale === 'ko' ? `${year}년 12월` : `${year} Dec`,
          });
        }
        break;
      }

      case 'all':
      default:
        // No date filter needed for 'all'
        break;
    }

    return dates;
  };

  const dates = generateDates();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
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
            <div className="flex-1 min-w-[110px] border-r border-gray-200 px-3">
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

            {/* Date Selection Column */}
            {period !== 'all' && (
              <div className="flex-1 min-w-[140px] pl-3">
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-700">
                    {t('date')}
                  </h3>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-2">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => onDateChange(date.value)}
                      className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                        selectedDate === date.value
                          ? 'bg-red-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {date.label}
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
