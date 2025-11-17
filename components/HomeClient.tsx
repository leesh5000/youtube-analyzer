'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function HomeClient() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-4">{t('subtitle')}</p>
        </div>
      </main>
    </div>
  );
}
