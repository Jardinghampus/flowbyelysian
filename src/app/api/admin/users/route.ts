import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@/lib/demo-auth"
import { isLocalAuthEnabled } from "@/lib/auth-mode"
import { requireApiUser } from "@/lib/api/guards"
import {
  createAppUser,
  listAppUsers,
  type LocalRole,
} from "@/lib/local-auth"

export async function GET() {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    if (isLocalAuthEnabled) {
      const users = await listAppUsers()
      return NextResponse.json({
        users: users.map((user) => ({
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
          canAccessSocial: user.can_access_social,
          status: user.status,
          area: null,
          createdAt: new Date(user.created_at).getTime(),
          lastActiveAt: null,
          imageUrl: null,
        })),
      })
    }

    const clerk = await clerkClient()
    const { data: users } = await clerk.users.getUserList()

    const transformedUsers = users.map((user) => {
      const meta = (user.publicMetadata || {}) as {
        role?: string
        area?: string | null
        canAccessSocial?: boolean
      }
      return {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        email: user.emailAddresses[0]?.emailAddress || "",
        role: meta.role || "agent",
        canAccessSocial: Boolean(meta.canAccessSocial),
        area: meta.area || null,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        imageUrl: user.imageUrl,
      }
    })

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const firstName = String(body.firstName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const password = String(body.password || "")
    const role = (body.role === "admin" ? "admin" : "agent") as LocalRole
    const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "Agent"

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (isLocalAuthEnabled) {
      if (!password || password.length < 4) {
        return NextResponse.json(
          { error: "Password is required (min 4 characters for temp invites)" },
          { status: 400 }
        )
      }

      // Social media is reserved for Hampus only.
      const social =
        fullName.toLowerCase() === "hampus" ||
        email === "hampus@flowbyelysian.com" ||
        email.startsWith("hampus@")

      const user = await createAppUser({
        email,
        password,
        fullName,
        role,
        canAccessSocial: social,
        mustChangePassword: true,
      })

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            canAccessSocial: user.can_access_social,
          },
        },
        { status: 201 }
      )
    }

    const { userId } = await auth()
    const clerk = await clerkClient()
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role,
        area: body.area || null,
        invitedBy: userId,
        canAccessSocial: false,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-up`,
    })

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.emailAddress,
          status: invitation.status,
          createdAt: invitation.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    const message = error instanceof Error ? error.message : "Failed to create user"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
