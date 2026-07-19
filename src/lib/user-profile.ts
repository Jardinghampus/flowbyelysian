import { createServerClient } from "@/lib/supabase/server"
import {
  splitFullName,
  TEAM_COMPANY_NAME,
  TEAM_COMPANY_WEBSITE,
  type AgentProfile,
  type AgentProfileInput,
} from "@/lib/brand"

type AppUserProfileRow = {
  id: string
  email: string
  full_name: string
  role: "admin" | "agent"
  phone?: string | null
  location?: string | null
  brn?: string | null
  language?: string | null
  job_title?: string | null
  profile_image_url?: string | null
}

function usersTable() {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from("app_users")
}

export function rowToAgentProfile(row: AppUserProfileRow): AgentProfile {
  const { firstName, lastName } = splitFullName(row.full_name || "")
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    phone: row.phone || "",
    location: row.location || "",
    brn: row.brn || "",
    language: row.language || "english",
    jobTitle: row.job_title || "",
    profileImageUrl: row.profile_image_url || null,
    company: TEAM_COMPANY_NAME,
    website: TEAM_COMPANY_WEBSITE,
    role: row.role,
  }
}

export async function getAgentProfileByUserId(userId: string): Promise<AgentProfile | null> {
  const table = usersTable()
  const { data, error } = await table.select("*").eq("id", userId).maybeSingle()
  if (error) throw error
  if (!data) return null
  return rowToAgentProfile(data as AppUserProfileRow)
}

export async function getAgentProfilesByUserIds(userIds: string[]): Promise<Map<string, AgentProfile>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  const map = new Map<string, AgentProfile>()
  if (!unique.length) return map

  const table = usersTable()
  const { data, error } = await table.select("*").in("id", unique)
  if (error) throw error

  for (const row of (data || []) as AppUserProfileRow[]) {
    map.set(row.id, rowToAgentProfile(row))
  }
  return map
}

export async function updateAgentProfile(userId: string, input: AgentProfileInput): Promise<AgentProfile> {
  const table = usersTable()
  const { data: existing, error: readError } = await table.select("*").eq("id", userId).maybeSingle()
  if (readError) throw readError
  if (!existing) throw new Error("User not found")

  const current = existing as AppUserProfileRow
  const firstName = input.firstName?.trim() || splitFullName(current.full_name).firstName
  const lastName = input.lastName?.trim() ?? splitFullName(current.full_name).lastName
  const fullName = `${firstName} ${lastName}`.trim() || current.full_name

  const patch: Record<string, unknown> = {
    full_name: fullName,
    updated_at: new Date().toISOString(),
  }

  if (input.phone !== undefined) patch.phone = input.phone
  if (input.location !== undefined) patch.location = input.location
  if (input.brn !== undefined) patch.brn = input.brn
  if (input.language !== undefined) patch.language = input.language
  if (input.jobTitle !== undefined) patch.job_title = input.jobTitle
  if (input.profileImageUrl !== undefined) patch.profile_image_url = input.profileImageUrl

  const { data, error } = await table.update(patch).eq("id", userId).select("*").single()
  if (error) throw error
  return rowToAgentProfile(data as AppUserProfileRow)
}
