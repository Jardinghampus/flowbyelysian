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

    const { id } = await params
    const client = await clerkClient()
    const user = await client.users.getUser(id)

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

    const client = await clerkClient()

    // Update name if provided
    if (firstName !== undefined || lastName !== undefined) {
      await client.users.updateUser(id, { firstName, lastName })
    }

    // Update publicMetadata role/area
    const currentUser = await client.users.getUser(id)
    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        ...currentUser.publicMetadata,
        ...(role !== undefined && { role }),
        ...(area !== undefined && { area }),
      },
    })

    const updatedUser = await client.users.getUser(id)

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
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

    const { id } = await params

    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    const client = await clerkClient()
    await client.users.deleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
