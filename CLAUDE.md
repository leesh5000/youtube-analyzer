# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Analyzer is a web service that analyzes YouTube channels and videos using the YouTube Data API v3. It provides performance metrics, engagement analytics, and identifies "hidden gems" (videos with high views relative to subscriber count).

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Run ESLint
```

### Environment Setup
**CRITICAL**: This application requires a YouTube API key to function.

1. Copy `.env.example` to `.env.local`
2. Set `YOUTUBE_API_KEY` to your actual API key from [Google Cloud Console](https://console.developers.google.com/)
3. Ensure YouTube Data API v3 is enabled in your Google Cloud project

The API key is accessed server-side via `process.env.YOUTUBE_API_KEY` and should never be exposed to the client.

## Architecture

### API Flow
The application follows a three-tier architecture:

1. **Client Layer**: React components use TanStack Query (React Query) hooks for data fetching
2. **API Routes Layer**: Next.js API routes (`app/api/youtube/`) handle HTTP requests
3. **Service Layer**: YouTube client (`lib/youtube/client.ts`) interfaces with Google's YouTube Data API

### Core Components

#### YouTube Client (`lib/youtube/client.ts`)
- Singleton pattern via `getYouTubeClient()` - always use this instead of creating new instances
- Wraps googleapis YouTube v3 client
- Methods:
  - `getChannelInfo(channelId)`: Fetches channel metadata and statistics
  - `getChannelVideos(channelId, maxResults)`: Gets videos via uploads playlist ID
  - `getVideoInfo(videoId)`: Fetches single video details
  - `searchChannels(query, maxResults)`: Searches for channels

#### Analytics Engine (`lib/youtube/analytics.ts`)
Contains pure calculation functions for metrics:

- `calculateChannelAnalytics()`: Computes views-per-subscriber, avg-views-per-video
- `calculateVideoAnalytics()`: Computes engagement rate (likes+comments)/views * 100
- `findHiddenGems()`: Identifies videos with views ≥ 2.0x subscriber count
- `evaluateChannelPerformance()`: Generates performance score (0-100) and insights

#### API Endpoints
- `GET /api/youtube/channel?channelId={id}`: Returns comprehensive channel analysis
- `GET /api/youtube/search?q={query}`: Searches for channels

Response from `/api/youtube/channel` includes:
- Channel metadata and statistics
- Analytics (viewsPerSubscriber, avgViewsPerVideo, engagementRate)
- Top 10 videos by view count
- Hidden gems (top 10 by views-to-subscriber ratio)
- Performance score and insights

### Data Flow Pattern

1. User interacts with component (e.g., `ChannelSearch.tsx`)
2. Component uses hook (e.g., `useChannelAnalysis()` from `hooks/`)
3. Hook uses TanStack Query to fetch from API route
4. API route uses `getYouTubeClient()` singleton
5. Client calls YouTube Data API v3 via googleapis
6. Analytics functions process raw YouTube data
7. Structured response flows back through the stack

### State Management

- **Server State**: TanStack Query handles all API data caching and synchronization
- **Client State**: Currently no global client state (no Zustand stores implemented despite package being installed)
- Components are wrapped in `QueryClientProvider` via `providers.tsx`

### Type System

TypeScript is configured with strict mode. Key patterns:

- Use `@/` path alias for imports (resolves to project root)
- YouTube API types from `googleapis` are re-exported in `types/index.ts`
- API response types are defined inline in hooks (see `useChannelAnalysis.ts`)
- Channel/video data transformation happens in API routes, not client-side

## Important Patterns

### YouTube API Quota Management
YouTube Data API has quota limits. Current implementation:
- Fetches max 50 videos per channel analysis (one quota unit per video)
- No caching beyond TanStack Query's default behavior
- Consider implementing server-side caching if quota becomes an issue

### Error Handling
- API routes catch errors and return appropriate HTTP status codes
- Client-side components should handle query states: `isLoading`, `isError`, `error`
- YouTube client logs errors to console before throwing

### Video Retrieval Pattern
To get channel videos, the YouTube API requires a two-step process (see `getChannelVideos()` in `lib/youtube/client.ts`):
1. Get channel's "uploads" playlist ID from contentDetails
2. Fetch playlist items to get video IDs
3. Fetch full video details using video IDs

This is the standard YouTube API pattern and should not be "optimized away".

## Testing Notes

There are currently no automated tests. When adding tests:
- Mock the googleapis YouTube client, not the API routes
- Test analytics functions independently (they're pure functions)
- Use test API keys with quota limits for integration tests