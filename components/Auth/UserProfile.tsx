"use client"

import { useSession } from "next-auth/react"
import { useTranslations, useLocale } from "next-intl"
import { SignOutButton } from "./SignOutButton"
import Link from "next/link"

export function UserProfile() {
  const t = useTranslations()
  const locale = useLocale()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <Link
        href={`/${locale}/auth/signin`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {t("common.signIn")}
      </Link>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${
            session.user.isAdmin ? "bg-purple-600" : "bg-blue-600"
          }`}>
            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className="hidden md:block text-left min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
            {session.user.isAdmin && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex-shrink-0">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
        </div>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1 gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
            {session.user.isAdmin && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex-shrink-0">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
        </div>
        <div className="py-2">
          <Link
            href={`/${locale}/saved`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("nav.savedChannels")}
          </Link>
          <Link
            href={`/${locale}/history`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("nav.history")}
          </Link>
        </div>
        <div className="p-2 border-t border-gray-200">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
