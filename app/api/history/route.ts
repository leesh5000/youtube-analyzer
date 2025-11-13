import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/history - Get analysis history for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const analysisType = searchParams.get("type") // "channel" | "search" | null (all)

    const where: any = {
      userId: session.user.id,
    }

    if (analysisType) {
      where.analysisType = analysisType
    }

    const [history, total] = await Promise.all([
      prisma.analysisHistory.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.analysisHistory.count({ where }),
    ])

    return NextResponse.json({
      history,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching analysis history:", error)
    return NextResponse.json(
      { error: "Failed to fetch analysis history" },
      { status: 500 }
    )
  }
}

// POST /api/history - Add a new history entry
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
    const { channelId, channelName, searchQuery, analysisType, metadata } = body

    if (!analysisType || !["channel", "search"].includes(analysisType)) {
      return NextResponse.json(
        { error: "Invalid analysisType. Must be 'channel' or 'search'" },
        { status: 400 }
      )
    }

    const historyEntry = await prisma.analysisHistory.create({
      data: {
        userId: session.user.id,
        channelId,
        channelName,
        searchQuery,
        analysisType,
        metadata,
      },
    })

    return NextResponse.json({ historyEntry }, { status: 201 })
  } catch (error) {
    console.error("Error creating history entry:", error)
    return NextResponse.json(
      { error: "Failed to create history entry" },
      { status: 500 }
    )
  }
}
