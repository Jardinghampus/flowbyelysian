import { NextRequest, NextResponse } from "next/server"
import { isLocalAuthEnabled } from "@/lib/auth-mode"
import {
  getVerifiedSessionUser,
  updateAppUser,
  verifyPassword,
  findUserById,
} from "@/lib/local-auth"

/** Set a new personal password (min 8). Clears must_change_password. */
export async function POST(request: NextRequest) {
  if (!isLocalAuthEnabled) {
    return NextResponse.json({ error: "Local auth is not enabled" }, { status: 400 })
  }

  try {
    const session = await getVerifiedSessionUser()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const currentPassword = String(body.currentPassword || "")
    const newPassword = String(body.newPassword || "")

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const row = await findUserById(session.id)
    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, row.password_hash)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    await updateAppUser(session.id, {
      password: newPassword,
      must_change_password: false,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("change-password", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
