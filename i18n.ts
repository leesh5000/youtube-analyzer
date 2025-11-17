import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

// Supported locales for the application
export const locales = ["ko", "en"] as const
export type Locale = (typeof locales)[number]

// Default locale (Korean)
export const defaultLocale: Locale = "ko"

// next-intl configuration
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale

  // Validate and fallback to default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  // Load messages for the locale
  const messages = (await import(`./messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
