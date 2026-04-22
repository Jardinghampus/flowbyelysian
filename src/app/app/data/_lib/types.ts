export type OwnerStatus = "owner" | "considering" | "listed" | "sold" | "unresponsive"
export type OwnerPriority = "high" | "medium" | "low"
export type OutreachType = "call" | "whatsapp" | "email" | "meeting" | "sms"

export interface Owner {
  id: string
  user_id: string
  name: string
  phone: string
  whatsapp_number: string
  area: string
  unit_number: string | null
  bedrooms: string | null
  status: OwnerStatus
  priority: OwnerPriority
  last_contacted_at: string | null
  follow_up_at: string | null
  notes: string | null
  assigned_agent_id: string
  assigned_agent_name: string | null
  created_at: string
  updated_at: string
  call_count: number
  whatsapp_count: number
  total_outreach: number
}

export interface OutreachLog {
  id: string
  owner_id: string
  agent_id: string
  agent_name: string | null
  type: OutreachType
  outcome: string | null
  status_changed_to: string | null
  follow_up_set_to: string | null
  logged_at: string
}

export interface OwnerFiltersState {
  search: string
  area: string
  bedrooms: string
  status: string
  agent: string
  dateFrom: string
  dateTo: string
}

export interface OwnerStats {
  totalOwners: number
  callsLast7Days: number
  whatsappLast7Days: number
  consideringCount: number
  overdueFollowUps: number
}

export const STATUS_CONFIG: Record<OwnerStatus, { label: string; color: string; bg: string }> = {
  owner: { label: "Owner", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  considering: { label: "Considering", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  listed: { label: "Listed", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20" },
  sold: { label: "Sold", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  unresponsive: { label: "Unresponsive", color: "text-neutral-400", bg: "bg-neutral-400/10 border-neutral-400/20" },
}

export const PRIORITY_CONFIG: Record<OwnerPriority, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-500" },
  medium: { label: "Medium", color: "bg-amber-500" },
  low: { label: "Low", color: "bg-emerald-500" },
}

export const OUTREACH_TYPE_CONFIG: Record<OutreachType, { label: string; icon: string }> = {
  call: { label: "Call", icon: "📞" },
  whatsapp: { label: "WhatsApp", icon: "💬" },
  email: { label: "Email", icon: "📧" },
  meeting: { label: "Meeting", icon: "🤝" },
  sms: { label: "SMS", icon: "📱" },
}

export const DUBAI_AREAS = [
  "Palm Jumeirah",
  "Downtown Dubai",
  "Dubai Marina",
  "Business Bay",
  "JBR",
  "DIFC",
  "Emirates Hills",
  "Arabian Ranches",
  "Tilal Al Ghaf",
  "Al Furjan",
  "Dubai Hills",
  "Jumeirah Village Circle",
  "Dubai South",
  "MBR City",
  "Meydan",
  "Damac Hills",
  "Town Square",
  "Al Barsha",
  "Jumeirah",
  "Umm Suqeim",
] as const
