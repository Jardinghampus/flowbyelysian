import { NextResponse } from "next/server"
import { auth, currentUser, DEMO_USER_ID } from "@/lib/demo-auth"
import { isClerkAuthEnabled, isLocalAuthEnabled } from "@/lib/auth-mode"
import { isHampusEmail } from "@/lib/hampus-access"

type ApiRole = "admin" | "manager" | "operator" | "agent"

type ApiUserContext = {
  userId: string
  role: ApiRole
  isDemo: boolean
  canAccessSocial: boolean
  email: string | null
  fullName: string | null
}

type GuardResult =
  | { ok: true; context: ApiUserContext }
  | { ok: false; response: NextResponse }

const productionLike = process.env.NODE_ENV === "production" || process.env.VERCEL === "1"

export function isDemoApiEnabled() {
  if (isClerkAuthEnabled || isLocalAuthEnabled) return false
  if (!productionLike) return true
  return process.env.DEMO_API_ENABLED === "true"
}

export function isProductionAuthMisconfigured() {
  if (isClerkAuthEnabled || isLocalAuthEnabled) return false
  return productionLike && !isDemoApiEnabled()
}

function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}

function unauthenticated(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401 })
}

function authMisconfigured() {
  return NextResponse.json(
    {
      error: "Production API auth is not configured.",
      required:
        "Set AUTH_MODE=local (or clerk), or explicitly set DEMO_API_ENABLED=true for a temporary demo deployment.",
    },
    { status: 503 }
  )
}

function readRole(user: Awaited<ReturnType<typeof currentUser>>): ApiRole {
  const metadata = user?.publicMetadata as { role?: string } | undefined
  const role = metadata?.role

  if (role === "admin" || role === "manager" || role === "operator" || role === "agent") {
    return role
  }

  return "agent"
}

export async function requireApiUser(options: { roles?: ApiRole[] } = {}): Promise<GuardResult> {
  if (isProductionAuthMisconfigured()) {
    return { ok: false, response: authMisconfigured() }
  }

  const { userId } = await auth()

  if (!userId) {
    return { ok: false, response: unauthenticated() }
  }

  const user = await currentUser()
  const role = readRole(user)
  const metadata = user?.publicMetadata as { canAccessSocial?: boolean } | undefined

  if (options.roles?.length && !options.roles.includes(role)) {
    return { ok: false, response: forbidden("This action requires elevated access.") }
  }

  return {
    ok: true,
    context: {
      userId,
      role,
      isDemo: userId === DEMO_USER_ID && !isClerkAuthEnabled && !isLocalAuthEnabled,
      canAccessSocial: Boolean(metadata?.canAccessSocial),
      email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null,
      fullName: user?.fullName || null,
    },
  }
}

export async function requireSocialAccess(): Promise<GuardResult> {
  const guard = await requireApiUser()
  if (!guard.ok) return guard

  if (!guard.context.canAccessSocial) {
    return { ok: false, response: forbidden("Social media access is limited to Hampus.") }
  }

  return guard
}

export async function requireHampusUser(): Promise<GuardResult> {
  const guard = await requireApiUser()
  if (!guard.ok) return guard

  if (!isHampusEmail(guard.context.email)) {
    return { ok: false, response: forbidden("Only Hampus can access this.") }
  }

  return guard
}
