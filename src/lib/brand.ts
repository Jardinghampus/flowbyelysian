/** Central product branding — use everywhere instead of legacy template names. */
export const BRAND_NAME = "Zaylo"
export const BRAND_TITLE = "Zaylo - by Hampus"
export const BRAND_DESCRIPTION =
  "Zaylo — Dubai brokerage CRM, market intelligence, and agent tools."
export const BRAND_TAGLINE = "Dubai brokerage CRM and market intelligence"

/** Derrick Signature team identity (fixed — not user-editable). */
export const TEAM_COMPANY_NAME = "Derrick Signature Properties LLC"
export const TEAM_COMPANY_WEBSITE = "derricksignatureproperties.ae"

/** Team accent — dark navy blue (replaces legacy gold/green highlights). */
export const TEAM_COLOR = "#1e3a5f"
export const TEAM_COLOR_LIGHT = "#2d5082"
export const TEAM_COLOR_SOFT = "#e8eef7"

export type AgentProfile = {
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  phone: string
  location: string
  brn: string
  language: string
  jobTitle: string
  profileImageUrl: string | null
  company: string
  website: string
  role: "admin" | "agent"
}

export type AgentProfileInput = {
  firstName?: string
  lastName?: string
  phone?: string
  location?: string
  brn?: string
  language?: string
  jobTitle?: string
  profileImageUrl?: string | null
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] || ""
  const lastName = parts.slice(1).join(" ")
  return { firstName, lastName }
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] || ""}${parts[parts.length - 1]![0] || ""}`.toUpperCase()
}
