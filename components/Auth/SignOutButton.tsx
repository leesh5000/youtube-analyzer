"use client"

import { signOut } from "next-auth/react"
import { useTranslations, useLocale } from "next-intl"

export function SignOutButton() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
    >
      {t("common.signOut")}
    </button>
  )
}
