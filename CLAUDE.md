# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Analyzer is a web service that analyzes YouTube channels and videos using the YouTube Data API v3. It provides performance metrics, engagement analytics, and identifies "hidden gems" (videos with high views relative to subscriber count). The application includes user authentication, channel bookmarking, and analysis history tracking.

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Run ESLint (no fix option available)
```

### Database Commands
```bash
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db push   # Push schema changes to MongoDB (no migrations needed for MongoDB)
npx prisma studio    # Open Prisma Studio GUI to view/edit database
```

### Infrastructure Commands (Docker)
```bash
# Start all infrastructure services (MongoDB + Redis)
docker compose -f docker-compose.infra.yml up -d

# Start specific services
docker compose -f docker-compose.infra.yml up -d mongodb
docker compose -f docker-compose.infra.yml up -d redis

# Stop all services
docker compose -f docker-compose.infra.yml down

# View logs
docker compose -f docker-compose.infra.yml logs -f

# Check service status
docker compose -f docker-compose.infra.yml ps
```

**Infrastructure Components**:
- **MongoDB 7.0**: Primary database with replica set configured
  - Port: 27017
  - Volumes: `mongodb_data`, `mongodb_config`
  - Healthcheck: mongosh ping every 10s
- **Redis 7-alpine**: Server-side caching layer
  - Port: 6379
  - Persistence: AOF (Append Only File) enabled
  - Volume: `redis_data`
  - Healthcheck: redis-cli ping every 10s

### Environment Setup
**CRITICAL**: This application requires multiple environment variables to function.

1. Copy `.env.example` to `.env.local`
2. **Required for core functionality:**
   - `YOUTUBE_API_KEY`: Get from [Google Cloud Console](https://console.developers.google.com/)
   - `DATABASE_URL`: MongoDB connection string (local or Atlas)
   - `REDIS_URL`: Redis connection string (local: `redis://localhost:6379`)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Set to `http://localhost:3000` for local development

3. **Optional for OAuth providers:**
   - Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Kakao: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
   - Naver: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for credential-based admin login)

The YouTube API key is accessed server-side via `process.env.YOUTUBE_API_KEY` and should never be exposed to the client.

**Redis Setup**:
- Start Redis using Docker Compose: `docker compose -f docker-compose.infra.yml up -d redis`
- Redis is optional - if `REDIS_URL` is not set, the application falls back to direct YouTube API calls without caching

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Cache**: Redis 7 (ioredis client) for server-side caching
- **Authentication**: NextAuth.js 5 (beta) with multiple providers
- **State Management**: TanStack Query for server state, no global client state
- **API Integration**: YouTube Data API v3 via googleapis
- **Internationalization**: next-intl with locale routing (/ko, /en)
- **UI Components**: Lucide React icons, custom responsive components

### Three-Tier Architecture

1. **Client Layer**: React components use TanStack Query (React Query) hooks for data fetching
2. **API Routes Layer**: Next.js API routes (`app/api/`) handle HTTP requests
3. **Service Layer**: YouTube client (`lib/youtube/client.ts`) interfaces with Google's YouTube Data API

### Authentication System

**NextAuth.js Configuration** (`lib/auth.ts`):
- **Session Strategy**: JWT-based (not database sessions)
- **Providers**:
  - Credentials (Admin): Simple email/password for admin access
  - Google OAuth
  - Kakao OAuth (Korean social login)
  - Naver OAuth (Korean social login)

**Important Auth Patterns**:
- User data is stored in MongoDB via Prisma after OAuth authentication
- Admin users are identified by `isAdmin` flag in session
- Protected routes use `auth()` helper to check session server-side
- Client components use `useSession()` from next-auth/react

**Session Extension**:
```typescript
// Session includes custom fields
session.user.id          // MongoDB ObjectId
session.user.isAdmin     // Boolean flag for admin users
```

### Internationalization (i18n)

**next-intl Configuration**:
- **Supported Locales**: Korean (ko) and English (en)
- **Default Locale**: Korean (ko)
- **Routing**: Path-based with locale prefix (/ko, /en)
- **Translation Files**: `messages/ko.json` and `messages/en.json`

**Important i18n Patterns**:
- All routes are under `app/[locale]/` directory
- Middleware handles automatic locale detection and redirection
- Server components use `getTranslations()` from next-intl/server
- Client components use `useTranslations()` hook
- Locale-aware number/date formatting uses `Intl` APIs and date-fns
- Next.js 16 requires params to be awaited: `const { locale } = await params`
- **ALL user-facing text must be translated** - never hardcode English/Korean text in components
- Use translation keys from `messages/` files for all UI text including buttons, labels, page titles, and error messages

**i18n Configuration Files**:
- `i18n.ts`: Core configuration with locale list and message loading
- `middleware.ts`: Handles locale routing and redirection
- `types/i18n.d.ts`: TypeScript autocomplete for translation keys
- `next.config.ts`: Integrates next-intl plugin

**Translation File Structure**:
- `common`: Shared UI elements (buttons, actions)
- `nav`: Navigation menu items
- `home`, `saved`, `history`: Page-specific translations with `pageTitle` and `pageDescription`
- `auth`: Authentication-related text
- `videos`, `analytics`, `channel`: Feature-specific translations
- `meta`: SEO metadata (titles, descriptions)

### Database Schema (Prisma + MongoDB)

**Core Models**:
- `User`: Stores user accounts (OAuth and admin)
- `Account`: OAuth provider information
- `Session`: Not used (JWT strategy)
- `SavedChannel`: User's bookmarked channels with notes and tags
- `AnalysisHistory`: Tracks channel searches and analyses

**Key Patterns**:
- All IDs are MongoDB ObjectIds (`@db.ObjectId`)
- Relations use `@relation` with cascade deletes
- `SavedChannel` has unique constraint on `[userId, channelId]`
- `metadata` fields store JSON data for flexible storage

**Generated Prisma Client**:
- Located in `node_modules/.prisma/client/` (default output)
- Import via `@/lib/db` which exports singleton `prisma` instance
- Regenerate with `npx prisma generate` after schema changes

### Core Components

#### YouTube Client (`lib/youtube/client.ts`)
- Singleton pattern via `getYouTubeClient()` - always use this instead of creating new instances
- Wraps googleapis YouTube v3 client
- Methods:
  - `getChannelInfo(channelId)`: Fetches channel metadata and statistics
  - `getChannelVideos(channelId, maxResults)`: Gets videos via uploads playlist ID
  - `getVideoInfo(videoId)`: Fetches single video details
  - `searchChannels(query, maxResults)`: Searches for channels
  - `getTrendingShorts(regionCode, maxResults, categoryId, pageToken)`: Fetches trending Shorts (duration ≤60s)
  - `getTrendingVideos(regionCode, maxResults, categoryId, pageToken)`: Fetches trending regular videos (duration >60s)
  - `enrichWithChannelInfo(videos)`: Batch-fetches channel details for videos to add subscriber/video counts

#### Analytics Engine (`lib/youtube/analytics.ts`)
Contains pure calculation functions for metrics:
- `calculateChannelAnalytics()`: Computes views-per-subscriber, avg-views-per-video
- `calculateVideoAnalytics()`: Computes engagement rate (likes+comments)/views * 100
- `findHiddenGems()`: Identifies videos with views ≥ 2.0x subscriber count
- `evaluateChannelPerformance()`: Generates performance score (0-100) and insights

#### API Endpoints

**YouTube Analysis**:
- `GET /api/youtube/channel?channelId={id}`: Returns comprehensive channel analysis
- `GET /api/youtube/search?q={query}`: Searches for channels

**Trending Videos** (public endpoints with pagination):
- `GET /api/youtube/shorts/trending?regionCode={code}&pageToken={token}`: Fetch trending Shorts (≤60s)
- `GET /api/youtube/trending?regionCode={code}&pageToken={token}`: Fetch trending regular videos (>60s)
- Both endpoints support:
  - `regionCode`: Country code (KR, US, JP, GLOBAL, etc.)
  - `videoCategoryId`: Optional category filter
  - `pageToken`: For pagination (returned as `nextPageToken` in response)
  - Returns 50 videos per page with enriched channel information

**User Features** (require authentication):
- `POST /api/channels/save`: Save a channel to bookmarks
- `GET /api/channels/saved`: Get user's saved channels
- `PATCH /api/channels/save/[id]`: Update saved channel notes/tags
- `DELETE /api/channels/save/[id]`: Remove saved channel
- `GET /api/history`: Get user's analysis history

Response from `/api/youtube/channel` includes:
- Channel metadata and statistics
- Analytics (viewsPerSubscriber, avgViewsPerVideo, engagementRate)
- Top 10 videos by view count
- Hidden gems (top 10 by views-to-subscriber ratio)
- Performance score and insights

Response from trending endpoints includes:
- Array of videos/shorts with full metadata (title, description, thumbnails, statistics)
- Enriched channel info (subscriber count, video count) via `enrichWithChannelInfo()`
- Calculated engagement rate for each video
- Region code and total count
- `nextPageToken` for pagination

### Data Flow Pattern

**YouTube Analysis Flow**:
1. User interacts with component (e.g., `ChannelSearch.tsx`)
2. Component uses hook (e.g., `useChannelAnalysis()` from `hooks/`)
3. Hook uses TanStack Query to fetch from API route
4. API route uses `getYouTubeClient()` singleton
5. Client calls YouTube Data API v3 via googleapis
6. Analytics functions process raw YouTube data
7. Structured response flows back through the stack

**User Data Flow**:
1. User authenticates via NextAuth.js
2. Session JWT contains userId and isAdmin flag
3. Protected API routes validate session with `await auth()`
4. API routes query MongoDB via Prisma using userId
5. TanStack Query caches user data on client

### State Management and Caching

**Two-Tier Caching Architecture**:

1. **Server-Side Cache (Primary)** - Redis
   - Cache storage: **Redis 7** via `ioredis` client
   - Caches YouTube API responses to reduce quota usage
   - Shared across all users and server instances
   - TTL (Time To Live) configuration:
     - Trending videos/shorts: **5 minutes** (`CacheTTL.TRENDING`)
     - Channel analysis: **10 minutes** (`CacheTTL.CHANNEL`)
     - Search results: **15 minutes** (`CacheTTL.SEARCH`)
   - Graceful fallback: If Redis is unavailable, falls back to direct API calls
   - Cache utilities: `lib/redis/cache.ts` exports `withCache()`, `CacheKey`, `CacheTTL`
   - Singleton client: `lib/redis/client.ts` exports `getRedisClient()`

2. **Client-Side Cache (Secondary)** - TanStack Query
   - Cache storage: **Browser memory** (JavaScript heap)
   - Short-lived cache (30 seconds stale time) - defers to server cache
   - Cleared on page refresh
   - Each user maintains independent cache
   - Prevents redundant requests within 30-second window

**Cache Flow**:
1. Client requests data via TanStack Query hook
2. If client cache is fresh (<30s), return immediately
3. Otherwise, make API request to Next.js route
4. API route checks Redis cache (`withCache()`)
5. If Redis cache hit, return cached data (10-50ms response)
6. If Redis cache miss, call YouTube API and cache result
7. Response flows back to client and updates both caches

**State Management**:
- **Server State**: TanStack Query handles all API data synchronization
- **Client State**: No global client state (Zustand installed but unused)
- **Form State**: Local component state with React hooks
- Components are wrapped in `QueryClientProvider` via `providers.tsx`

**Cache Key Strategy** (defined in `lib/redis/cache.ts`):
- `youtube:trending:shorts:{regionCode}:{categoryId}:{pageToken}`
- `youtube:trending:videos:{regionCode}:{categoryId}:{pageToken}`
- `youtube:channel:{channelId}`
- `youtube:search:channels:{encodedQuery}`

### Responsive Design

All components use Tailwind CSS responsive classes:
- Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- Hamburger menu for mobile navigation (`components/Header.tsx`)
- Responsive grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Touch-friendly tap targets and spacing on mobile

Key responsive patterns:
- Text sizes: `text-sm sm:text-base lg:text-lg`
- Padding: `px-4 sm:px-6 lg:px-8`
- Hidden elements: `hidden md:flex` for desktop-only navigation
- Flexible containers: `min-w-0` to prevent overflow

### Type System

TypeScript is configured with strict mode. Key patterns:
- Use `@/` path alias for imports (resolves to project root)
- YouTube API types from `googleapis` are re-exported in `types/index.ts`
- API response types are defined inline in hooks (see `useChannelAnalysis.ts`)
- Channel/video data transformation happens in API routes, not client-side
- Prisma generates types automatically in `node_modules/.prisma/client/`

## Important Patterns

### Next.js 16 Breaking Changes
Next.js 16 changed `params` in pages and layouts to be Promises:

```typescript
// Correct pattern for Next.js 16
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params  // Must await
  // ...
}
```

This applies to:
- Page components in `app/[locale]/`
- Layout components
- `generateMetadata()` functions
- `generateStaticParams()` functions

### YouTube API Quota Management
YouTube Data API has quota limits. Current implementation:
- Channel analysis: Fetches max 50 videos per analysis (one quota unit per video)
- Trending videos: Returns 50 items per page with pagination support
- **Server-side Redis caching**:
  - Trending data cached for 5 minutes - reduces quota usage by 80-90%
  - Channel analysis cached for 10 minutes
  - Search results cached for 15 minutes
  - Shared cache across all users (not per-user)
- **Client-side TanStack Query caching**:
  - Short-lived 30-second cache to prevent rapid re-requests
  - Defers to server Redis cache as primary source
- **Expected quota reduction**: With Redis caching, same data requests consume near-zero quota for cache duration
- Monitor quota usage in Google Cloud Console
- Cache can be disabled by not setting `REDIS_URL` environment variable

### Error Handling
- API routes catch errors and return appropriate HTTP status codes
- Client-side components should handle query states: `isLoading`, `isError`, `error`
- YouTube client logs errors to console before throwing
- Protected routes redirect to `/[locale]/auth/signin` if not authenticated

### Video Retrieval Pattern
To get channel videos, the YouTube API requires a two-step process (see `getChannelVideos()` in `lib/youtube/client.ts`):
1. Get channel's "uploads" playlist ID from contentDetails
2. Fetch playlist items to get video IDs
3. Fetch full video details using video IDs

This is the standard YouTube API pattern and should not be "optimized away".

### Protected Routes
Pages requiring authentication use this pattern:
```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }
  // ... protected content
}
```

### Custom Hooks Pattern
Data fetching hooks follow this structure:
- Use TanStack Query's `useQuery`, `useInfiniteQuery`, or `useMutation`
- Handle loading, error, and success states
- Export typed return values
- Examples:
  - `useChannelAnalysis()`: Single query for channel data
  - `useSavedChannels()`, `useAnalysisHistory()`: List queries
  - `useTrendingShorts()`, `useTrendingVideos()`: Infinite queries with pagination
    - Use `useInfiniteQuery` for paginated data
    - Cache duration: `staleTime: 5 * 60 * 1000` (5 minutes), `gcTime: 10 * 60 * 1000` (10 minutes)
    - Access data via `data.pages` array (not `data.shorts` or `data.videos`)
    - Each page contains array of items and optional `nextPageToken`

### Chart Page Filtering Pattern
The chart page (`app/[locale]/chart/page.tsx`) implements multi-dimensional filtering with dynamic date generation:

**Filter Architecture**:
- Filter state managed with React `useState` hooks: `regionCode`, `videoType`, `category`, `period`, `selectedDate`, `showHiddenGemsOnly`
- Filters are applied via `useMemo` to prevent unnecessary recalculations
- ChartFilters component displays board-style layout with columns: Category, Country, Period, Date

**Dynamic Date Generation**:
- Date options change based on selected period filter (daily/weekly/monthly/yearly/yearEnd/all)
- Locale-aware date formatting using day/month names from translations
- Date column hidden when "all" period is selected

**Period Filter Behavior**:
- `daily`: Shows last 14 days with day of week (e.g., "2025.11.20(수)")
- `weekly`: Shows last 12 weeks starting from Monday (e.g., "2025.11.18 (12주차)")
- `monthly`: Shows last 12 months with month names (e.g., "2025.11월")
- `yearly`: Shows last 5 years (e.g., "2025년")
- `yearEnd`: Shows last 5 Decembers (e.g., "2025년 12월")
- `all`: No date filter, shows all videos

**Video Filtering Logic**:
- Period + date combination: When both are selected, filter by specific date range
  - Daily: Exact day match
  - Weekly: 7-day range starting from selected Monday
  - Monthly: Specific month match
  - Yearly: Specific year match
  - YearEnd: December of specific year
- Period only: When no specific date selected, filter by relative time from now
- Hidden gems: Separate filter for videos with `viewCount / subscriberCount >= 2.0`
- Multiple filters can be combined (period + hidden gems + category + region)

### Locale-Aware Navigation
All internal links must include the current locale:
```typescript
import { useLocale } from "next-intl"
import Link from "next/link"

const locale = useLocale()
<Link href={`/${locale}/saved`}>Saved Channels</Link>
```

OAuth callback URLs and redirects should also preserve locale:
```typescript
// Client components
signIn("google", { callbackUrl: `/${locale}` })

// Server components
redirect(`/${locale}/auth/signin`)
```

**Active Navigation Link Styling**:
Use `usePathname()` to highlight the current page in navigation:
```typescript
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"

const pathname = usePathname()
const locale = useLocale()

// Desktop navigation - active link in blue
<Link
  href={`/${locale}/saved`}
  className={`text-sm font-medium transition-colors ${
    pathname === `/${locale}/saved`
      ? 'text-blue-600'
      : 'text-gray-700 hover:text-blue-600'
  }`}
>

// Mobile navigation - active link with blue text and background
<Link
  href={`/${locale}/saved`}
  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    pathname === `/${locale}/saved`
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
```

**Date and Number Formatting**:
All dates and numbers should be formatted according to the current locale:
```typescript
// Date formatting
const dateLocale = locale === 'ko' ? ko : enUS
const dateFormat = t('videos.dateFormat')  // Get format from translations
format(new Date(dateString), dateFormat, { locale: dateLocale })

// Number formatting
new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(number)

// Date display in lists
new Date(item.createdAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')
```

## Testing

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Configuration
- **Framework**: Jest with React Testing Library
- **Environment**: jsdom (browser environment simulation)
- **Setup**: `jest.config.ts` and `jest.setup.ts`
- **Coverage**: Configured to collect from `lib/`, `components/`, `hooks/`, and `app/` directories

### Testing Patterns
- Mock the googleapis YouTube client, not the API routes
- Test analytics functions independently (they're pure functions)
- Use test API keys with quota limits for integration tests
- Mock Prisma client for database tests
- Test protected routes with mocked sessions
- Component tests: Use `@testing-library/react` and `@testing-library/jest-dom`
- Existing test files:
  - `components/Shorts/ShortsGrid.test.tsx`
  - `components/Shorts/ShortsCard.test.tsx`
  - `lib/youtube/utils.test.ts`
