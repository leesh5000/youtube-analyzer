import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeClient } from '@/lib/youtube/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const youtube = getYouTubeClient();
    const results = await youtube.searchChannels(query, 10);

    return NextResponse.json({
      channels: results.map((result) => ({
        id: result.snippet?.channelId,
        title: result.snippet?.title,
        description: result.snippet?.description,
        thumbnails: {
          default: result.snippet?.thumbnails?.default?.url,
          medium: result.snippet?.thumbnails?.medium?.url,
          high: result.snippet?.thumbnails?.high?.url,
        },
      })),
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
