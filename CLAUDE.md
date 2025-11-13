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

### Environment Setup
**CRITICAL**: This application requires multiple environment variables to function.

1. Copy `.env.example` to `.env.local`
2. **Required for core functionality:**
   - `YOUTUBE_API_KEY`: Get from [Google Cloud Console](https://console.developers.google.com/)
   - `DATABASE_URL`: MongoDB connection string (local or Atlas)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Set to `http://localhost:3000` for local development

3. **Optional for OAuth providers:**
   - Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Kakao: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
   - Naver: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for credential-based admin login)

The YouTube API key is accessed server-side via `process.env.YOUTUBE_API_KEY` and should never be exposed to the client.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js 5 (beta) with multiple providers
- **State Management**: TanStack Query for server state, no global client state
- **API Integration**: YouTube Data API v3 via googleapis
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
- Located in `lib/generated/prisma/` (custom output)
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

### State Management

- **Server State**: TanStack Query handles all API data caching and synchronization
- **Client State**: No global client state (Zustand installed but unused)
- **Form State**: Local component state with React hooks
- Components are wrapped in `QueryClientProvider` via `providers.tsx`

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
- Prisma generates types automatically in `lib/generated/prisma/`

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
- Protected routes redirect to `/auth/signin` if not authenticated

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

export default async function ProtectedPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }
  // ... protected content
}
```

### Custom Hooks Pattern
Data fetching hooks follow this structure:
- Use TanStack Query's `useQuery` or `useMutation`
- Handle loading, error, and success states
- Export typed return values
- Examples: `useChannelAnalysis()`, `useSavedChannels()`, `useAnalysisHistory()`

## Testing Notes

There are currently no automated tests. When adding tests:
- Mock the googleapis YouTube client, not the API routes
- Test analytics functions independently (they're pure functions)
- Use test API keys with quota limits for integration tests
- Mock Prisma client for database tests
- Test protected routes with mocked sessions
