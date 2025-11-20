import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH /api/channels/save/[id] - Update saved channel (notes, tags)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { notes, tags } = body

    // Verify ownership
    const savedChannel = await prisma.savedChannel.findUnique({
      where: {
        id,
      },
    })

    if (!savedChannel) {
      return NextResponse.json(
        { error: "Saved channel not found" },
        { status: 404 }
      )
    }

    if (savedChannel.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const updated = await prisma.savedChannel.update({
      where: {
        id,
      },
      data: {
        notes,
        tags,
      },
    })

    return NextResponse.json({ savedChannel: updated })
  } catch (error) {
    console.error("Error updating saved channel:", error)
    return NextResponse.json(
      { error: "Failed to update saved channel" },
      { status: 500 }
    )
  }
}

// DELETE /api/channels/save/[id] - Delete saved channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify ownership
    const savedChannel = await prisma.savedChannel.findUnique({
      where: {
        id,
      },
    })

    if (!savedChannel) {
      return NextResponse.json(
        { error: "Saved channel not found" },
        { status: 404 }
      )
    }

    if (savedChannel.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.savedChannel.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting saved channel:", error)
    return NextResponse.json(
      { error: "Failed to delete saved channel" },
      { status: 500 }
    )
  }
}
