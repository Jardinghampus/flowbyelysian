import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { isLocalAuthEnabled } from "@/lib/auth-mode"
import {
  deleteAppUser,
  findUserById,
  updateAppUser,
  type LocalRole,
} from "@/lib/local-auth"
import { isHampusEmail } from "@/lib/hampus-access"
import { clerkClient } from "@/lib/demo-auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    const { id } = await params

    if (isLocalAuthEnabled) {
      const user = await findUserById(id)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        user: {
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
        },
      })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const meta = (user.publicMetadata || {}) as {
      role?: string
      area?: string | null
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress || "",
        role: meta.role || "agent",
        area: meta.area || null,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        imageUrl: user.imageUrl,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = await request.json()
    const role = body.role === "admin" || body.role === "agent" ? (body.role as LocalRole) : undefined
    const fullName =
      body.firstName || body.lastName
        ? `${body.firstName || ""} ${body.lastName || ""}`.trim()
        : body.fullName

    if (isLocalAuthEnabled) {
      const existing = await findUserById(id)
      if (!existing) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (role === "admin" && !isHampusEmail(existing.email)) {
        return NextResponse.json({ error: "Only Hampus can be admin." }, { status: 400 })
      }

      const updated = await updateAppUser(id, {
        role,
        full_name: fullName || undefined,
        password: body.password || undefined,
        status: body.status,
        can_access_social: isHampusEmail(existing.email),
      })

      return NextResponse.json({
        user: {
          id: updated.id,
          name: updated.full_name,
          email: updated.email,
          role: updated.role,
          canAccessSocial: updated.can_access_social,
        },
      })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.updateUser(id, {
      firstName: body.firstName,
      lastName: body.lastName,
      publicMetadata: {
        role: role || "agent",
        area: body.area || null,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || "",
        role: role || "agent",
        area: body.area || null,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    const { id } = await params

    if (id === guard.context.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    if (isLocalAuthEnabled) {
      await deleteAppUser(id)
      return NextResponse.json({ success: true })
    }

    const clerk = await clerkClient()
    await clerk.users.updateUser(id, {
      publicMetadata: { status: "disabled" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
