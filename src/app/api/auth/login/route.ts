import { NextRequest, NextResponse } from "next/server"
import { isLocalAuthEnabled } from "@/lib/auth-mode"
import {
  LOCAL_SESSION_COOKIE,
  bootstrapAdminIfEmpty,
  createSessionToken,
  findUserByEmail,
  normalizeLoginEmail,
  sessionCookieOptions,
  toSessionUser,
  verifyPassword,
} from "@/lib/local-auth"

export async function POST(request: NextRequest) {
  if (!isLocalAuthEnabled) {
    return NextResponse.json({ error: "Local auth is not enabled" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const emailRaw = String(body.email || "").trim()
    const password = String(body.password || "")

    if (!emailRaw || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await bootstrapAdminIfEmpty(emailRaw, password)

    const email = normalizeLoginEmail(emailRaw)
    const user = await findUserByEmail(email)

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const sessionUser = toSessionUser(user)
    const token = createSessionToken(sessionUser)
    const response = NextResponse.json({
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        fullName: sessionUser.fullName,
        role: sessionUser.role,
        canAccessSocial: sessionUser.canAccessSocial,
        mustChangePassword: Boolean(sessionUser.mustChangePassword),
      },
    })

    response.cookies.set(LOCAL_SESSION_COOKIE, token, sessionCookieOptions())
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
