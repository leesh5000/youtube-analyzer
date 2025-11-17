'use client';

import { Award, BarChart3, Heart, TrendingUp } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface AnalyticsDashboardProps {
  analytics: {
    viewsPerSubscriber: number;
    avgViewsPerVideo: number;
    engagementRate: number;
  };
  performance: {
    score: number;
    insights: string[];
  };
}

export function AnalyticsDashboard({
  analytics,
  performance,
}: AnalyticsDashboardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return t('analytics.gradeS');
    if (score >= 80) return t('analytics.gradeA');
    if (score >= 70) return t('analytics.gradeB');
    if (score >= 60) return t('analytics.gradeC');
    return t('analytics.gradeD');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 핵심 지표 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('analytics.title')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                {t('analytics.viewsPerSubscriber')}
              </h4>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {formatNumber(analytics.viewsPerSubscriber)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('analytics.viewsPerSubscriberDesc')}
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                {t('analytics.avgViews')}
              </h4>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatNumber(analytics.avgViewsPerVideo)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('analytics.avgViewsDesc')}
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                {t('analytics.engagementRate')}
              </h4>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-pink-600">
              {formatNumber(analytics.engagementRate)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('analytics.engagementRateDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 성과 평가 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t('analytics.performanceTitle')}</h3>
          <div
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xl sm:text-2xl ${getScoreColor(
              performance.score
            )}`}
          >
            {getScoreGrade(performance.score)}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{t('analytics.overallScore')}</span>
            <span className="font-semibold text-gray-900">
              {performance.score} / 100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                performance.score >= 80
                  ? 'bg-green-500'
                  : performance.score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${performance.score}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('analytics.insightsTitle')}
              </h4>
              <ul className="space-y-2">
                {performance.insights.map((insight, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
