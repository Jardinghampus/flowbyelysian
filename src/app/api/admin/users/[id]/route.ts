import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient, DEMO_USER } from "@/lib/demo-auth"

// GET /api/admin/users/:id - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Demo mode: return demo user
    const { id } = await params
    const user = DEMO_USER

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress || "",
        role: (user.publicMetadata?.role as string) || "agent",
        area: (user.publicMetadata?.area as string) || null,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        imageUrl: user.imageUrl,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/:id - Update user role/metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { role, area, firstName, lastName } = body

    // Demo mode: simulate update
    console.log("Demo mode: User update simulated", { id, role, area, firstName, lastName })

    return NextResponse.json({
      user: {
        id,
        name: `${firstName || DEMO_USER.firstName} ${lastName || DEMO_USER.lastName}`.trim(),
        email: DEMO_USER.emailAddresses[0]?.emailAddress || "",
        role: role || "agent",
        area: area || null,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/:id - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Demo mode: simulate deletion
    console.log("Demo mode: User deletion simulated", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
