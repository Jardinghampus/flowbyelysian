import { NextResponse } from "next/server"
import { isClerkAuthEnabled } from "@/lib/auth-mode"
import { isDemoApiEnabled, isProductionAuthMisconfigured, requireApiUser } from "@/lib/api/guards"
import { createServerClient } from "@/lib/supabase/server"

type CheckStatus = "ready" | "config_needed" | "error"

type HealthCheck = {
  id: string
  status: CheckStatus
  detail: string
}

function envCheck(id: string, names: string[]): HealthCheck {
  const missing = names.filter((name) => !process.env[name])

  return missing.length === 0
    ? { id, status: "ready", detail: `${names.length} required env vars configured.` }
    : { id, status: "config_needed", detail: `Missing: ${missing.join(", ")}` }
}

async function supabaseCheck(): Promise<HealthCheck> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      id: "supabase-connection",
      status: "config_needed",
      detail: "Supabase URL or service role key is missing.",
    }
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("owners").select("id").limit(1)

    if (error) {
      return { id: "supabase-connection", status: "error", detail: error.message }
    }

    return { id: "supabase-connection", status: "ready", detail: "Connected and owners table is queryable." }
  } catch (error) {
    return {
      id: "supabase-connection",
      status: "error",
      detail: error instanceof Error ? error.message : "Unknown Supabase error",
    }
  }
}

export async function GET() {
  const guard = await requireApiUser({ roles: ["admin", "manager", "operator"] })
  if (!guard.ok) return guard.response

  const authStatus: HealthCheck = isProductionAuthMisconfigured()
    ? {
        id: "auth-mode",
        status: "error",
        detail: "Production-like runtime is not using Clerk and DEMO_API_ENABLED is not explicitly enabled.",
      }
    : {
        id: "auth-mode",
        status: isClerkAuthEnabled ? "ready" : "config_needed",
        detail: isClerkAuthEnabled
          ? "Clerk auth mode is enabled."
          : `Demo auth mode is active${isDemoApiEnabled() ? " and explicitly allowed for this runtime." : "."}`,
      }

  const checks = [
    authStatus,
    envCheck("clerk-env", ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"]),
    envCheck("supabase-env", ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]),
    {
      id: "zaylo-worker-boundary",
      status: process.env.VERCEL === "1" ? "ready" : "config_needed",
      detail:
        process.env.VERCEL === "1"
          ? "Vercel runtime will refuse long-running Zaylo jobs."
          : "Local/server runtime can start Zaylo jobs; use the dedicated worker for scheduled imports.",
    } satisfies HealthCheck,
    await supabaseCheck(),
  ]

  const status: CheckStatus = checks.some((check) => check.status === "error")
    ? "error"
    : checks.some((check) => check.status === "config_needed")
      ? "config_needed"
      : "ready"

  return NextResponse.json({
    status,
    authMode: isClerkAuthEnabled ? "clerk" : "demo",
    demoApiEnabled: isDemoApiEnabled(),
    user: {
      id: guard.context.userId,
      role: guard.context.role,
      isDemo: guard.context.isDemo,
    },
    checks,
    checkedAt: new Date().toISOString(),
  })
}

