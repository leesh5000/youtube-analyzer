"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the current path
    const segments = pathname.split("/")
    segments[1] = newLocale
    router.push(segments.join("/"))
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700 uppercase">
          {locale}
        </span>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <button
            onClick={() => switchLocale("ko")}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              locale === "ko"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => switchLocale("en")}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              locale === "en"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  )
}
