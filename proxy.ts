import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "./i18n"

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix (e.g., /ko, /en)
  localePrefix: "always",
})

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public files (e.g., images, robots.txt)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}