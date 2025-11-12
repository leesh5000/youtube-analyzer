# YouTube Analyzer

YouTube 채널과 비디오를 분석하는 웹 서비스입니다. YouTube Data API를 활용하여 채널의 성과 지표를 조회하고 다양한 분석을 제공합니다.

## 주요 기능

- **채널 분석**: 특정 YouTube 채널의 구독자 수, 조회수, 영상 수 등 기본 통계 조회
- **성과 지표**: 구독자 대비 조회수, 비디오당 평균 조회수 등 비율 분석
- **참여율 분석**: 조회수 대비 좋아요+댓글 비율 계산
- **히든 영상 발굴**: 구독자 수 대비 조회수가 높은 영상 탐색
- **채널 성과 평가**: 종합적인 채널 성과 점수 및 인사이트 제공

## 기술 스택

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **API**: YouTube Data API v3 (googleapis)
- **상태 관리**: Zustand
- **데이터 페칭**: TanStack Query (React Query)
- **차트**: Recharts
- **유틸리티**: date-fns, axios

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 YouTube API 키를 설정합니다:

```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

YouTube API 키는 [Google Cloud Console](https://console.developers.google.com/)에서 발급받을 수 있습니다.

#### YouTube API 키 발급 방법:

1. [Google Cloud Console](https://console.developers.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"로 이동
4. "YouTube Data API v3" 검색 및 활성화
5. "사용자 인증 정보" 탭에서 "사용자 인증 정보 만들기" > "API 키" 선택
6. 생성된 API 키를 `.env.local` 파일에 복사

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
youtube-analyzer/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── youtube/          # YouTube API 엔드포인트
│   │       ├── channel/      # 채널 분석 API
│   │       └── search/       # 채널 검색 API
│   ├── page.tsx              # 메인 페이지
│   └── layout.tsx            # 레이아웃
├── components/               # React 컴포넌트
├── lib/                      # 유틸리티 및 라이브러리
│   └── youtube/              # YouTube API 클라이언트 및 분석 로직
│       ├── client.ts         # YouTube API 클라이언트
│       └── analytics.ts      # 분석 알고리즘
├── types/                    # TypeScript 타입 정의
├── hooks/                    # 커스텀 React Hooks
└── store/                    # 상태 관리 (Zustand)
```

## API 엔드포인트

### 채널 분석

```
GET /api/youtube/channel?channelId={channelId}
```

채널의 상세 분석 정보를 반환합니다.

**Response:**
```json
{
  "channel": {
    "id": "string",
    "title": "string",
    "statistics": {
      "subscriberCount": number,
      "viewCount": number,
      "videoCount": number
    }
  },
  "analytics": {
    "viewsPerSubscriber": number,
    "avgViewsPerVideo": number,
    "engagementRate": number
  },
  "topVideos": [...],
  "hiddenGems": [...],
  "performance": {
    "score": number,
    "insights": string[]
  }
}
```

### 채널 검색

```
GET /api/youtube/search?q={query}
```

채널을 검색합니다.

**Response:**
```json
{
  "channels": [
    {
      "id": "string",
      "title": "string",
      "description": "string"
    }
  ]
}
```

## 개발

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

### 린트

```bash
npm run lint
```

## 배포

이 프로젝트는 [Vercel Platform](https://vercel.com)에 쉽게 배포할 수 있습니다.

자세한 내용은 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)을 참조하세요.

## 라이선스

MIT
