'use client';

import { useTranslations } from 'next-intl';
import { Info, X, TrendingUp, Eye, Users, BarChart3 } from 'lucide-react';

interface TrendingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrendingInfoModal({ isOpen, onClose }: TrendingInfoModalProps) {
  const t = useTranslations('shorts.info');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Introduction */}
          <div>
            <p className="text-gray-700 leading-relaxed">{t('intro')}</p>
          </div>

          {/* Criteria Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {t('criteriaTitle')}
            </h3>
            <div className="space-y-4">
              {/* YouTube Popularity */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('criteria1Title')}</h4>
                    <p className="text-sm text-gray-700">{t('criteria1Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Duration Filter */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('criteria2Title')}</h4>
                    <p className="text-sm text-gray-700">{t('criteria2Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Regional Popularity */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('criteria3Title')}</h4>
                    <p className="text-sm text-gray-700">{t('criteria3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('filtersTitle')}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{t('filter1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{t('filter2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{t('filter3')}</span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('tipsTitle')}</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span>{t('tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span>{t('tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span>{t('tip3')}</span>
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p>{t('note')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
