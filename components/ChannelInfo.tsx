'use client';

import { Users, Eye, Video, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChannelInfoProps {
  channel: {
    id: string;
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: string;
      medium?: string;
      high?: string;
    };
    statistics: {
      subscriberCount: number;
      viewCount: number;
      videoCount: number;
    };
  };
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {channel.thumbnails.high && (
          <img
            src={channel.thumbnails.high}
            alt={channel.title}
            className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
          />
        )}

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {channel.title}
          </h2>

          {channel.customUrl && (
            <a
              href={`https://youtube.com/${channel.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mb-3 inline-block"
            >
              {channel.customUrl}
            </a>
          )}

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {channel.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>개설일: {formatDate(channel.publishedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
          <div className="p-3 bg-red-500 rounded-full">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">구독자</p>
            <p className="text-xl font-bold text-gray-900">
              {formatNumber(channel.statistics.subscriberCount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="p-3 bg-blue-500 rounded-full">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">총 조회수</p>
            <p className="text-xl font-bold text-gray-900">
              {formatNumber(channel.statistics.viewCount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="p-3 bg-green-500 rounded-full">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">영상 수</p>
            <p className="text-xl font-bold text-gray-900">
              {formatNumber(channel.statistics.videoCount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
