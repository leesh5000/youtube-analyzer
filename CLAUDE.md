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

### Testing Commands
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
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
- `TrendingVideo`: Stores trending video snapshots collected via batch jobs

**Key Patterns**:
- All IDs are MongoDB ObjectIds (`@db.ObjectId`)
- Relations use `@relation` with cascade deletes
- `SavedChannel` has unique constraint on `[userId, channelId]`
- `metadata` fields store JSON data for flexible storage
- `TrendingVideo` has composite indexes on `[regionCode, categoryId, videoType, collectedAt]` for efficient chart queries

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

**Trending Videos** (DB-based, no pagination):
- `GET /api/youtube/shorts/trending?regionCode={code}&videoCategoryId={id}&period={period}`: Fetch trending Shorts from DB
- `GET /api/youtube/trending?regionCode={code}&videoCategoryId={id}&period={period}`: Fetch trending videos from DB
- Both endpoints:
  - Query MongoDB `TrendingVideo` collection (not YouTube API directly)
  - Support `regionCode`: GLOBAL, KR, US, JP, TW, VN
  - Support `videoCategoryId`: Optional category filter (null = all)
  - Support `period`: daily, weekly, monthly, yearly, yearEnd, all (filters by publishedAt)
  - Return up to 50 videos per region/category/type combination
  - Cached in Redis for 5 minutes

**Batch Jobs**:
- `POST /api/batch/collect-trending`: Collect trending data from YouTube API and store in DB
  - Runs automatically every 3 hours via Vercel Cron (see `vercel.json`)
  - Collects 180 combinations: 6 regions × 15 categories × 2 video types
  - Deletes old data and inserts fresh trending snapshots
  - Returns summary: `{ totalCollected, totalErrors, collectedAt, durationMs }`

**Home Rankings**:
- `GET /api/home/rankings?videoType={shorts|videos}&period={daily|weekly|monthly|all}`: Fetch aggregated rankings for home page
  - Returns 7 ranking categories in a single response
  - Cached in Redis for 5 minutes
  - Rankings include: topVideos, risingVideos, highEngagement, topChannels, activeChannels, subscriberSurge, latestTrending

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
- Array of videos/shorts from DB with full metadata (title, description, thumbnails, statistics)
- Enriched channel info (subscriber count, video count) stored during batch collection
- Pre-calculated engagement rate for each video
- Region code and total count
- No pagination (returns all matching videos up to 50 per combination)

### Data Flow Pattern

**YouTube Analysis Flow** (Channel analysis):
1. User interacts with component (e.g., `ChannelSearch.tsx`)
2. Component uses hook (e.g., `useChannelAnalysis()` from `hooks/`)
3. Hook uses TanStack Query to fetch from API route
4. API route uses `getYouTubeClient()` singleton
5. Client calls YouTube Data API v3 via googleapis
6. Analytics functions process raw YouTube data
7. Structured response flows back through the stack

**Trending Videos Flow** (Chart page):
1. Batch job (`POST /api/batch/collect-trending`) runs every 3 hours via Vercel Cron
2. Job calls YouTube API v3 to fetch trending videos for all 180 combinations
3. Data stored in MongoDB `TrendingVideo` collection (replaces old data per combination)
4. User visits chart page → hooks call trending API endpoints
5. API endpoints query MongoDB (not YouTube API)
6. Results cached in Redis for 5 minutes
7. Client applies additional date filtering if needed

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
YouTube Data API has quota limits (10,000 units/day by default). Current implementation drastically reduces quota usage:

**Batch Job Strategy**:
- Trending data collected every 3 hours via batch job (not per-user request)
- Single batch collects ~360 API units (180 combinations × ~2 units each)
- 8 batches/day = ~2,880 units/day total for all trending data
- All users share the same trending dataset from DB (zero additional quota)

**Traditional Endpoints** (still use quota):
- Channel analysis: ~50 units per analysis (fetches 50 videos)
- Channel search: ~100 units per search
- **Server-side Redis caching**:
  - Channel analysis cached for 10 minutes
  - Search results cached for 15 minutes
  - Reduces duplicate requests by 80-90%
- **Client-side TanStack Query caching**:
  - 30-second cache prevents rapid re-requests
  - Defers to server Redis cache

**Quota Calculation Example**:
- Before: 1,000 users viewing trending page = 1,000 × 2 units = 2,000 units
- After: 1,000 users viewing trending page = 0 units (served from DB)
- Batch overhead: ~2,880 units/day regardless of traffic

Monitor quota usage in Google Cloud Console. Cache can be disabled by not setting `REDIS_URL`.

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
- Use TanStack Query's `useQuery` or `useMutation`
- Handle loading, error, and success states
- Export typed return values
- Examples:
  - `useChannelAnalysis()`: Single query for channel data
  - `useSavedChannels()`, `useAnalysisHistory()`: List queries
  - `useTrendingShorts()`, `useTrendingVideos()`: Simple queries (no pagination)
    - Changed from `useInfiniteQuery` to `useQuery` after DB migration
    - Cache duration: `staleTime: 30 * 1000` (30 seconds), `gcTime: 10 * 60 * 1000` (10 minutes)
    - Access data directly: `data.shorts` or `data.videos` (not `data.pages`)
    - No pagination - all matching videos returned at once (up to 50 per combination)

### React Key Uniqueness Pattern
When rendering lists where the same item may appear in multiple contexts, ensure keys are unique across all lists:

```typescript
// ❌ BAD - Same video can appear in multiple ranking categories
{videos.map((video) => (
  <div key={video.id}>...</div>
))}

// ✅ GOOD - Prefix with context identifier
{videos.map((video, index) => (
  <div key={`${metricKey}-${video.id}-${index}`}>...</div>
))}
```

This pattern is used in:
- `VideoRankingCard.tsx`: Prefixes with metric type (views/ratio/engagement)
- `ChannelRankingCard.tsx`: Prefixes with metric type (subscribers/trendingCount/growth)
- `HorizontalVideoScroll.tsx`: Prefixes with 'latest-' to distinguish from ranking cards

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
- **Server-side filtering** (API endpoints): Period parameter filters videos by `publishedAt` date
  - Queries MongoDB with date range filters based on period
  - Returns videos published within the specified period
- **Client-side filtering** (Chart page): Date parameter filters results from API
  - Daily: Exact day match (e.g., "오늘" filters to videos published on 2025-11-21)
  - Weekly: 7-day range starting from selected Monday
  - Monthly: Specific month match
  - Yearly: Specific year match
  - YearEnd: December of specific year
- **Important**: Date filtering is by video **publish date**, not trending collection date
  - Most trending videos were published days/weeks ago (not today)
  - Initial filter of "daily + today" may return very few results
  - Users should select "all" period to see all trending videos
- Hidden gems: Separate filter for videos with `viewCount / subscriberCount >= 2.0`
- Multiple filters can be combined (period + date + hidden gems + category + region)

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

## Batch Jobs and Deployment

### Vercel Cron Configuration
The batch job is configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/batch/collect-trending",
      "schedule": "0 */3 * * *"
    }
  ]
}
```

**Schedule**: Runs every 3 hours (0:00, 3:00, 6:00, 9:00, 12:00, 15:00, 18:00, 21:00 UTC)

### Manual Batch Execution (Development)
To manually trigger the batch job locally:
```bash
curl -X POST http://localhost:3000/api/batch/collect-trending
```

Expected response after ~1-2 minutes:
```json
{
  "success": true,
  "totalCollected": 5681,
  "totalErrors": 24,
  "errors": ["Failed to collect shorts for GLOBAL/27", ...],
  "collectedAt": "2025-11-21T01:40:54.794Z",
  "durationMs": 108329
}
```

**Note**: Some errors are expected for certain category/region combinations where YouTube doesn't provide trending data.

### Database Seeding
After deploying or resetting the database:
1. Ensure MongoDB and Redis are running: `docker compose -f docker-compose.infra.yml up -d`
2. Run Prisma sync: `npx prisma db push`
3. Run initial batch job: `curl -X POST http://localhost:3000/api/batch/collect-trending`
4. Verify data in Prisma Studio: `npx prisma studio`

The batch job will automatically run every 3 hours on Vercel after deployment.
