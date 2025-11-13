import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/channels/saved - Get all saved channels for the current user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const savedChannels = await prisma.savedChannel.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ savedChannels })
  } catch (error) {
    console.error("Error fetching saved channels:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved channels" },
      { status: 500 }
    )
  }
}

// POST /api/channels/saved - Save a new channel
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { channelId, channelName, channelThumbnail, subscriberCount, metadata, notes, tags } = body

    if (!channelId || !channelName) {
      return NextResponse.json(
        { error: "channelId and channelName are required" },
        { status: 400 }
      )
    }

    // Check if channel is already saved
    const existing = await prisma.savedChannel.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Channel already saved" },
        { status: 409 }
      )
    }

    const savedChannel = await prisma.savedChannel.create({
      data: {
        userId: session.user.id,
        channelId,
        channelName,
        channelThumbnail,
        subscriberCount,
        metadata,
        notes,
        tags: tags || [],
      },
    })

    return NextResponse.json({ savedChannel }, { status: 201 })
  } catch (error) {
    console.error("Error saving channel:", error)
    return NextResponse.json(
      { error: "Failed to save channel" },
      { status: 500 }
    )
  }
}
