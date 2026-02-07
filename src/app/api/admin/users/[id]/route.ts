import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

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

    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const isAdmin = currentUser.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const user = await clerk.users.getUser(id)

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

    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const isAdmin = currentUser.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { role, area, firstName, lastName } = body

    // Build update object
    const updateData: {
      firstName?: string
      lastName?: string
      publicMetadata?: Record<string, unknown>
    } = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName

    // Update publicMetadata
    const targetUser = await clerk.users.getUser(id)
    const currentMetadata = (targetUser.publicMetadata || {}) as Record<string, unknown>

    updateData.publicMetadata = {
      ...currentMetadata,
      ...(role !== undefined && { role }),
      ...(area !== undefined && { area }),
    }

    const updatedUser = await clerk.users.updateUser(id, updateData)

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || "Unknown",
        email: updatedUser.emailAddresses[0]?.emailAddress || "",
        role: (updatedUser.publicMetadata?.role as string) || "agent",
        area: (updatedUser.publicMetadata?.area as string) || null,
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

    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const isAdmin = currentUser.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    await clerk.users.deleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
