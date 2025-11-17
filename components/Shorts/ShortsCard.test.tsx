import { render, screen } from '@testing-library/react';
import { ShortsCard } from './ShortsCard';
import { ShortData } from '@/hooks/useTrendingShorts';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('ShortsCard', () => {
  const mockShort: ShortData = {
    id: 'test-video-id',
    title: 'Test Short Video',
    description: 'Test description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    publishedAt: '2025-01-01T00:00:00Z',
    channelId: 'test-channel-id',
    channelTitle: 'Test Channel',
    viewCount: 1000000,
    likeCount: 50000,
    commentCount: 1000,
    duration: 'PT59S',
    engagementRate: 5.1,
    channel: {
      id: 'test-channel-id',
      title: 'Test Channel',
      thumbnailUrl: 'https://example.com/channel.jpg',
      subscriberCount: 100000,
      videoCount: 100,
    },
  };

  it('renders short video information correctly', () => {
    render(<ShortsCard short={mockShort} />);

    expect(screen.getByText('Test Short Video')).toBeInTheDocument();
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
  });

  it('renders video statistics', () => {
    render(<ShortsCard short={mockShort} />);

    // Check if view count is formatted
    expect(screen.getByText(/1M/i)).toBeInTheDocument();
  });

  it('renders channel thumbnail when available', () => {
    render(<ShortsCard short={mockShort} />);

    const channelImage = screen.getAllByRole('img')[1]; // Second image is channel thumbnail
    expect(channelImage).toHaveAttribute('alt', 'Test Channel');
  });

  it('links to YouTube video correctly', () => {
    render(<ShortsCard short={mockShort} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/shorts/test-video-id'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays Shorts badge', () => {
    render(<ShortsCard short={mockShort} />);

    expect(screen.getByText('Shorts')).toBeInTheDocument();
  });
});
