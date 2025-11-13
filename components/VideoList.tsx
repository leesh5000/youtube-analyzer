'use client';

import { Eye, ThumbsUp, MessageCircle, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TopVideo {
  id: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  publishedAt: string;
}

interface HiddenGem {
  id: string;
  title: string;
  viewCount: number;
  viewsToSubscriberRatio: number;
  publishedAt: string;
}

interface VideoListProps {
  topVideos?: TopVideo[];
  hiddenGems?: HiddenGem[];
  type: 'top' | 'hidden';
}

export function VideoList({ topVideos, hiddenGems, type }: VideoListProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
  };

  if (type === 'top' && topVideos) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            인기 영상 Top 10
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {topVideos.map((video, index) => (
            <a
              key={video.id}
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-blue-600">
                    {video.title}
                  </h4>

                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.viewCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.likeCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.commentCount)}</span>
                    </div>
                    <div className="text-purple-600 font-semibold whitespace-nowrap">
                      참여율: {video.engagementRate.toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                    {formatDate(video.publishedAt)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'hidden' && hiddenGems) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            히든 영상 발굴
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          구독자 대비 조회수가 높은 영상들입니다
        </p>

        {hiddenGems.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
            히든 영상이 없습니다.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {hiddenGems.map((video, index) => (
              <a
                key={video.id}
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition-all bg-gradient-to-r from-yellow-50 to-transparent"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 hover:text-yellow-600">
                      {video.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{formatNumber(video.viewCount)}</span>
                      </div>
                      <div className="text-yellow-600 font-semibold whitespace-nowrap">
                        구독자 대비: {video.viewsToSubscriberRatio.toFixed(2)}배
                      </div>
                    </div>

                    <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                      {formatDate(video.publishedAt)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
