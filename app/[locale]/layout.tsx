import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/i18n"
import { Providers } from "@/components/providers"
import { Header } from "@/components/Header"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  return {
    title: "YouTube Analyzer",
    description: "YouTube channel analysis service",
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Header />

              {/* Main content */}
              <main className="flex-1">{children}</main>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  <p className="text-center text-xs sm:text-sm text-gray-500">
                    © 2024 YouTube Analyzer. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
