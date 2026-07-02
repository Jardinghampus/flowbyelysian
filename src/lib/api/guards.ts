import { NextResponse } from "next/server"
import { auth, currentUser, DEMO_USER_ID } from "@/lib/demo-auth"
import { isClerkAuthEnabled } from "@/lib/auth-mode"

type ApiRole = "admin" | "manager" | "operator" | "agent"

type ApiUserContext = {
  userId: string
  role: ApiRole
  isDemo: boolean
}

type GuardResult =
  | { ok: true; context: ApiUserContext }
  | { ok: false; response: NextResponse }

const productionLike = process.env.NODE_ENV === "production" || process.env.VERCEL === "1"

export function isDemoApiEnabled() {
  if (isClerkAuthEnabled) return false
  if (!productionLike) return true
  return process.env.DEMO_API_ENABLED === "true"
}

export function isProductionAuthMisconfigured() {
  return productionLike && !isClerkAuthEnabled && !isDemoApiEnabled()
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
      required: "Set AUTH_MODE=clerk and NEXT_PUBLIC_AUTH_MODE=clerk, or explicitly set DEMO_API_ENABLED=true for a temporary demo deployment.",
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

  if (options.roles?.length && !options.roles.includes(role)) {
    return { ok: false, response: forbidden("This action requires elevated access.") }
  }

  return {
    ok: true,
    context: {
      userId,
      role,
      isDemo: userId === DEMO_USER_ID && !isClerkAuthEnabled,
    },
  }
}

