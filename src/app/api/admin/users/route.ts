import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/admin/users - List all users (admin only)
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({ limit: 100 })

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

    const body = await request.json()
    const { email, firstName, lastName, role = "agent", area } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
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
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}
