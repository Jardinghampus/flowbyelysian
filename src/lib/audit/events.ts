import type { SupabaseClient } from "@supabase/supabase-js"
import { getDefaultTeamId } from "@/lib/api/team"

type ActorContext = {
  userId?: string | null
  role?: string | null
  name?: string | null
}

type ActivityEventInput = {
  actor?: ActorContext
  teamId?: string | null
  entityType: string
  entityId: string
  eventType: string
  title: string
  body?: string | null
  source?: string
  visibility?: "private" | "team" | "admin"
  payload?: Record<string, unknown>
}

type AuditLogInput = {
  actor?: ActorContext
  teamId?: string | null
  action: string
  targetType: string
  targetId?: string | null
  beforeData?: Record<string, unknown> | null
  afterData?: Record<string, unknown> | null
  metadata?: Record<string, unknown>
}

async function resolveTeamId(supabase: SupabaseClient, explicitTeamId?: string | null) {
  if (explicitTeamId !== undefined) return explicitTeamId
  return getDefaultTeamId(supabase)
}

export async function emitActivityEvent(supabase: SupabaseClient, input: ActivityEventInput) {
  try {
    const teamId = await resolveTeamId(supabase, input.teamId)

    await supabase.from("crm_activity_events").insert({
      team_id: teamId,
      actor_user_id: input.actor?.userId || null,
      actor_name: input.actor?.name || null,
      entity_type: input.entityType,
      entity_id: input.entityId,
      event_type: input.eventType,
      title: input.title,
      body: input.body || null,
      source: input.source || "api",
      visibility: input.visibility || "team",
      payload: input.payload || {},
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn("Activity event was not recorded", { eventType: input.eventType, message })
  }
}

export async function emitAuditLog(supabase: SupabaseClient, input: AuditLogInput) {
  try {
    const teamId = await resolveTeamId(supabase, input.teamId)

    await supabase.from("audit_logs").insert({
      team_id: teamId,
      actor_user_id: input.actor?.userId || null,
      actor_role: input.actor?.role || null,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId || null,
      before_data: input.beforeData || null,
      after_data: input.afterData || null,
      metadata: input.metadata || {},
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn("Audit log was not recorded", { action: input.action, message })
  }
}

