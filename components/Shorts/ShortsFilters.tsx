'use client';

import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterOptions {
  minSubscribers?: number;
  maxSubscribers?: number;
  minViews?: number;
  maxViews?: number;
  minViewsPerSubscriber?: number;
  maxViewsPerSubscriber?: number;
  minLikes?: number;
  maxLikes?: number;
  minComments?: number;
  maxComments?: number;
  minEngagementRate?: number;
  maxEngagementRate?: number;
  sortBy?: 'views' | 'likes' | 'comments' | 'engagement' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

interface ShortsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const PRESET_SUBSCRIBER_RANGES = [
  { label: '1K+', value: 1000 },
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
  { label: '1M+', value: 1000000 },
];

const PRESET_VIEW_RANGES = [
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
  { label: '1M+', value: 1000000 },
  { label: '10M+', value: 10000000 },
];

const PRESET_RATIO_RANGES = [
  { label: '0.5x+', value: 0.5 },
  { label: '1.0x+', value: 1.0 },
  { label: '2.0x+', value: 2.0 },
  { label: '5.0x+', value: 5.0 },
];

const PRESET_LIKE_RANGES = [
  { label: '100+', value: 100 },
  { label: '1K+', value: 1000 },
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
];

const PRESET_COMMENT_RANGES = [
  { label: '50+', value: 50 },
  { label: '500+', value: 500 },
  { label: '5K+', value: 5000 },
  { label: '50K+', value: 50000 },
];

const PRESET_ENGAGEMENT_RANGES = [
  { label: '0.5%+', value: 0.5 },
  { label: '1%+', value: 1.0 },
  { label: '2%+', value: 2.0 },
  { label: '5%+', value: 5.0 },
];

export function ShortsFilters({ filters, onFiltersChange }: ShortsFiltersProps) {
  const t = useTranslations('shorts.filters');
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1"
        >
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{t('title')}</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              {Object.values(filters).filter(v => v !== undefined).length}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              {t('clear')}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-gray-200 pt-4">
          {/* Subscriber Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('subscribers')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_SUBSCRIBER_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minSubscribers', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minSubscribers === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minSubscribers && (
                <button
                  onClick={() => updateFilter('minSubscribers', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('min')}
                value={filters.minSubscribers || ''}
                onChange={(e) =>
                  updateFilter('minSubscribers', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t('max')}
                value={filters.maxSubscribers || ''}
                onChange={(e) =>
                  updateFilter('maxSubscribers', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Views Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('views')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_VIEW_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minViews', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minViews === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minViews && (
                <button
                  onClick={() => updateFilter('minViews', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('min')}
                value={filters.minViews || ''}
                onChange={(e) =>
                  updateFilter('minViews', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t('max')}
                value={filters.maxViews || ''}
                onChange={(e) =>
                  updateFilter('maxViews', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Views per Subscriber Ratio Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('viewsPerSubscriber')}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t('viewsPerSubscriberDesc')}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_RATIO_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minViewsPerSubscriber', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minViewsPerSubscriber === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minViewsPerSubscriber && (
                <button
                  onClick={() => updateFilter('minViewsPerSubscriber', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                placeholder={t('min')}
                value={filters.minViewsPerSubscriber || ''}
                onChange={(e) =>
                  updateFilter('minViewsPerSubscriber', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.1"
                placeholder={t('max')}
                value={filters.maxViewsPerSubscriber || ''}
                onChange={(e) =>
                  updateFilter('maxViewsPerSubscriber', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Likes Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('likes')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_LIKE_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minLikes', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minLikes === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minLikes && (
                <button
                  onClick={() => updateFilter('minLikes', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('min')}
                value={filters.minLikes || ''}
                onChange={(e) =>
                  updateFilter('minLikes', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t('max')}
                value={filters.maxLikes || ''}
                onChange={(e) =>
                  updateFilter('maxLikes', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Comments Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('comments')}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COMMENT_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minComments', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minComments === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minComments && (
                <button
                  onClick={() => updateFilter('minComments', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('min')}
                value={filters.minComments || ''}
                onChange={(e) =>
                  updateFilter('minComments', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t('max')}
                value={filters.maxComments || ''}
                onChange={(e) =>
                  updateFilter('maxComments', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Engagement Rate Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('engagementRate')}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t('engagementRateDesc')}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_ENGAGEMENT_RANGES.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('minEngagementRate', preset.value)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    filters.minEngagementRate === preset.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              {filters.minEngagementRate && (
                <button
                  onClick={() => updateFilter('minEngagementRate', undefined)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                placeholder={t('min')}
                value={filters.minEngagementRate || ''}
                onChange={(e) =>
                  updateFilter('minEngagementRate', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.1"
                placeholder={t('max')}
                value={filters.maxEngagementRate || ''}
                onChange={(e) =>
                  updateFilter('maxEngagementRate', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
