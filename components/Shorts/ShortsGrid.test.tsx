import { render, screen } from '@testing-library/react';
import { ShortsGrid } from './ShortsGrid';
import { ShortData } from '@/hooks/useTrendingShorts';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock ShortsCard component
jest.mock('./ShortsCard', () => ({
  ShortsCard: ({ short }: { short: ShortData }) => (
    <div data-testid={`short-card-${short.id}`}>{short.title}</div>
  ),
}));

describe('ShortsGrid', () => {
  const mockShorts: ShortData[] = [
    {
      id: '1',
      title: 'Short 1',
      description: 'Description 1',
      thumbnailUrl: 'https://example.com/1.jpg',
      publishedAt: '2025-01-01T00:00:00Z',
      channelId: 'channel-1',
      channelTitle: 'Channel 1',
      viewCount: 1000,
      likeCount: 100,
      commentCount: 10,
      duration: 'PT30S',
      engagementRate: 11,
    },
    {
      id: '2',
      title: 'Short 2',
      description: 'Description 2',
      thumbnailUrl: 'https://example.com/2.jpg',
      publishedAt: '2025-01-02T00:00:00Z',
      channelId: 'channel-2',
      channelTitle: 'Channel 2',
      viewCount: 2000,
      likeCount: 200,
      commentCount: 20,
      duration: 'PT45S',
      engagementRate: 11,
    },
  ];

  it('renders loading state', () => {
    render(<ShortsGrid shorts={[]} isLoading={true} />);

    // Should show skeleton loaders
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    const error = new Error('Failed to load');
    render(<ShortsGrid shorts={[]} error={error} />);

    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders empty state when no shorts', () => {
    render(<ShortsGrid shorts={[]} />);

    expect(screen.getByText('noShorts')).toBeInTheDocument();
    expect(screen.getByText('noShortsDescription')).toBeInTheDocument();
  });

  it('renders shorts grid', () => {
    render(<ShortsGrid shorts={mockShorts} />);

    expect(screen.getByTestId('short-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('short-card-2')).toBeInTheDocument();
    expect(screen.getByText('Short 1')).toBeInTheDocument();
    expect(screen.getByText('Short 2')).toBeInTheDocument();
  });

  it('renders correct number of shorts', () => {
    render(<ShortsGrid shorts={mockShorts} />);

    const shortCards = screen.getAllByTestId(/short-card-/);
    expect(shortCards).toHaveLength(2);
  });
});
