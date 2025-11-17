'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChannelSearch } from '@/hooks/useChannelSearch';
import { Search, Loader2 } from 'lucide-react';

interface ChannelSearchProps {
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSearch({ onChannelSelect }: ChannelSearchProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = useChannelSearch(debouncedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.inputPlaceholder')}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <button
          type="submit"
          className="mt-3 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('search.button')}
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {data && data.channels.length > 0 && (
        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4">
          {data.channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              {channel.thumbnails.medium && (
                <img
                  src={channel.thumbnails.medium}
                  alt={channel.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                  {channel.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {channel.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {data && data.channels.length === 0 && debouncedQuery && (
        <div className="mt-8 text-center text-gray-500">
          {t('search.noResults')}
        </div>
      )}
    </div>
  );
}
