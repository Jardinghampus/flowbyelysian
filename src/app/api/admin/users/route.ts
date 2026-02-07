import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/admin/users - List all users (admin only)
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const isAdmin = currentUser.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all users from Clerk
    const { data: users } = await clerk.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    })

    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
      email: user.emailAddresses[0]?.emailAddress || "",
      role: (user.publicMetadata?.role as string) || "agent",
      area: (user.publicMetadata?.area as string) || null,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      imageUrl: user.imageUrl,
    }))

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Invite new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const isAdmin = currentUser.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName, role = "agent", area } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Create invitation in Clerk
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role,
        area,
        invitedBy: userId,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-up`,
    })

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.emailAddress,
        status: invitation.status,
        createdAt: invitation.createdAt,
      },
    }, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating invitation:", error)

    // Handle Clerk-specific errors
    const clerkError = error as { errors?: Array<{ code?: string; message?: string }> }
    if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
      return NextResponse.json(
        { error: "A user with this email already exists or has a pending invitation" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}
