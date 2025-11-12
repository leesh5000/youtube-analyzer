'use client';

import { useState } from 'react';
import { useChannelSearch } from '@/hooks/useChannelSearch';
import { Search, Loader2 } from 'lucide-react';

interface ChannelSearchProps {
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSearch({ onChannelSelect }: ChannelSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = useChannelSearch(debouncedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="채널 이름을 검색하세요..."
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <button
          type="submit"
          className="mt-3 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {data && data.channels.length > 0 && (
        <div className="mt-6 grid gap-4">
          {data.channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              {channel.thumbnails.medium && (
                <img
                  src={channel.thumbnails.medium}
                  alt={channel.title}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {channel.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {channel.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {data && data.channels.length === 0 && debouncedQuery && (
        <div className="mt-8 text-center text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
