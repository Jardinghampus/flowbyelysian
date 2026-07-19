import { createServerClient } from "@/lib/supabase/server"
import type { LocalRole } from "@/lib/local-auth"

export const SESSION_ACTIVE_DAYS = 14

export type LoginEventRow = {
  id: string
  user_id: string | null
  email: string
  full_name: string
  role: LocalRole
  ip_address: string | null
  user_agent: string | null
  logged_in_at: string
}

export type TeamLoginStatus = {
  userId: string | null
  email: string
  fullName: string
  role: LocalRole
  lastLoginAt: string | null
  loginCount: number
  likelyActive: boolean
}

async function loginEventsTable() {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from("login_events")
}

export async function recordLoginEvent(input: {
  userId: string
  email: string
  fullName: string
  role: LocalRole
  ipAddress?: string | null
  userAgent?: string | null
}) {
  const table = await loginEventsTable()
  const { error } = await table.insert({
    user_id: input.userId,
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName,
    role: input.role,
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null,
  })

  if (error) {
    console.error("Failed to record login event:", error.message)
  }
}

export async function listLoginEvents(limit = 200): Promise<LoginEventRow[]> {
  const table = await loginEventsTable()
  const { data, error } = await table
    .select("*")
    .order("logged_in_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []) as LoginEventRow[]
}

export async function getTeamLoginStatus(): Promise<TeamLoginStatus[]> {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usersTable = (supabase as any).from("app_users")
  const { data: users, error: usersError } = await usersTable
    .select("id, email, full_name, role")
    .eq("status", "active")
    .order("full_name")

  if (usersError) throw usersError

  const events = await listLoginEvents(500)
  const cutoff = Date.now() - SESSION_ACTIVE_DAYS * 24 * 60 * 60 * 1000

  return ((users || []) as { id: string; email: string; full_name: string; role: LocalRole }[]).map(
    (user) => {
      const userEvents = events.filter(
        (event) => event.user_id === user.id || event.email.toLowerCase() === user.email.toLowerCase()
      )
      const lastLoginAt = userEvents[0]?.logged_in_at ?? null
      return {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        lastLoginAt,
        loginCount: userEvents.length,
        likelyActive: lastLoginAt ? new Date(lastLoginAt).getTime() >= cutoff : false,
      }
    }
  )
}
