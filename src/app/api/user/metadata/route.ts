import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient, DEMO_USER } from "@/lib/demo-auth"

// GET /api/user/metadata - Get current user metadata
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Demo mode: return demo user metadata
    return NextResponse.json({
      publicMetadata: DEMO_USER.publicMetadata,
      privateMetadata: DEMO_USER.privateMetadata,
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

    // Demo mode: simulate metadata update
    const updatedMetadata = {
      ...DEMO_USER.publicMetadata,
      ...(phone !== undefined && { phone }),
      ...(area !== undefined && { area }),
      ...otherMetadata,
    }

    console.log("Demo mode: Metadata update simulated", updatedMetadata)

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
