import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "YouTube Analyzer - 채널 분석 서비스",
  description: "YouTube 채널의 성과를 분석하고 인사이트를 제공하는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />

            {/* Main content */}
            <main className="flex-1">
              {children}
            </main>

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
      </body>
    </html>
  );
}
