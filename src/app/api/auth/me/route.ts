import { NextResponse } from "next/server"
import { isLocalAuthEnabled } from "@/lib/auth-mode"
import { getVerifiedSessionUser } from "@/lib/local-auth"
import { currentUser } from "@/lib/demo-auth"

export async function GET() {
  if (isLocalAuthEnabled) {
    const user = await getVerifiedSessionUser()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        canAccessSocial: user.canAccessSocial,
      },
    })
  }

  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
      fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: (user.publicMetadata as { role?: string })?.role || "agent",
      canAccessSocial: Boolean((user.publicMetadata as { canAccessSocial?: boolean })?.canAccessSocial),
    },
  })
}
