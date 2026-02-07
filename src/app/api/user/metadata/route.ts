import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/user/metadata - Get current user metadata
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)

    return NextResponse.json({
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
    })
  } catch (error) {
    console.error("Error fetching user metadata:", error)
    return NextResponse.json(
      { error: "Failed to fetch user metadata" },
      { status: 500 }
    )
  }
}

// PATCH /api/user/metadata - Update current user metadata
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { phone, area, ...otherMetadata } = body

    const clerk = await clerkClient()

    // Get current user metadata
    const user = await clerk.users.getUser(userId)
    const currentMetadata = (user.publicMetadata || {}) as Record<string, unknown>

    // Merge with new metadata
    const updatedMetadata = {
      ...currentMetadata,
      ...(phone !== undefined && { phone }),
      ...(area !== undefined && { area }),
      ...otherMetadata,
    }

    // Update user metadata
    await clerk.users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    })

    return NextResponse.json({
      success: true,
      publicMetadata: updatedMetadata,
    })
  } catch (error) {
    console.error("Error updating user metadata:", error)
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 }
    )
  }
}
