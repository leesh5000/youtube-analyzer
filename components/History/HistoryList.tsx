"use client"

import { useAnalysisHistory } from "@/hooks/useAnalysisHistory"
import Link from "next/link"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"

export function HistoryList() {
  const t = useTranslations()
  const locale = useLocale()
  const [filter, setFilter] = useState<"all" | "channel" | "search">("all")
  const { data, isLoading, error } = useAnalysisHistory({
    type: filter === "all" ? undefined : filter,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('history.error')}</p>
      </div>
    )
  }

  const history = data?.history || []

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
          <button
            onClick={() => setFilter("all")}
            className={`${
              filter === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors`}
          >
            {t('history.all')}
          </button>
          <button
            onClick={() => setFilter("channel")}
            className={`${
              filter === "channel"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors`}
          >
            {t('history.channelAnalyses')}
          </button>
          <button
            onClick={() => setFilter("search")}
            className={`${
              filter === "search"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors`}
          >
            {t('history.searches')}
          </button>
        </nav>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('history.noHistory')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('history.noHistoryDescription')}
          </p>
          <div className="mt-6">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('history.startAnalyzing')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full w-fit ${
                        item.analysisType === "channel"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.analysisType === "channel" ? t('history.channelAnalysis') : t('history.search')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                  </div>

                  {item.analysisType === "channel" ? (
                    <>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {item.channelName || t('history.unknownChannel')}
                      </h3>
                      {item.channelId && (
                        <Link
                          href={`/${locale}?channelId=${item.channelId}`}
                          className="inline-flex items-center gap-1 mt-1.5 sm:mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                        >
                          {t('history.viewAnalysis')}
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {t('history.search')}: "{item.searchQuery}"
                      </h3>
                      <Link
                        href={`/${locale}?q=${encodeURIComponent(item.searchQuery || "")}`}
                        className="inline-flex items-center gap-1 mt-1.5 sm:mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                      >
                        {t('history.repeatSearch')}
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data?.pagination.hasMore && (
            <div className="text-center py-3 sm:py-4">
              <button className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium">
                {t('history.loadMore')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
