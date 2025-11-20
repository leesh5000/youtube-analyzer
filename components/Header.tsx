"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { UserProfile } from "@/components/Auth/UserProfile"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href={`/${locale}`} className="text-lg sm:text-xl font-bold text-blue-600 truncate">
              {t("common.appName")}
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/${locale}`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}`
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t("nav.analyze")}
              </Link>
              <Link
                href={`/${locale}/shorts`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}/shorts`
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t("nav.shorts")}
              </Link>
              <Link
                href={`/${locale}/chart`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}/chart`
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t("nav.chart")}
              </Link>
              <Link
                href={`/${locale}/saved`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}/saved`
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t("nav.saved")}
              </Link>
              <Link
                href={`/${locale}/history`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}/history`
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t("nav.history")}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserProfile />
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={t("nav.toggleMenu")}
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === `/${locale}`
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t("nav.analyze")}
              </Link>
              <Link
                href={`/${locale}/shorts`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === `/${locale}/shorts`
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t("nav.shorts")}
              </Link>
              <Link
                href={`/${locale}/chart`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === `/${locale}/chart`
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t("nav.chart")}
              </Link>
              <Link
                href={`/${locale}/saved`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === `/${locale}/saved`
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t("nav.saved")}
              </Link>
              <Link
                href={`/${locale}/history`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === `/${locale}/history`
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t("nav.history")}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
