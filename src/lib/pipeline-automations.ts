/**
 * Pipeline Automations Engine
 *
 * Scans opportunities and generates automated actions:
 *   - Stale lead alerts (no update in X days per stage)
 *   - Auto follow-up reminders
 *   - Stage-specific nudges
 *   - Escalation triggers
 *
 * Designed to be called via a cron API route or on-demand.
 */

export type OpportunityStatus = "new" | "contacted" | "in_progress" | "matched" | "closed" | "cancelled"

export interface PipelineOpportunity {
  id: string
  status: OpportunityStatus
  fullName: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  area: string | null
  propertyType: string | null
  assignedAgentId: string | null
  assignedAgentName: string | null
  createdAt: string
  updatedAt: string
  notes: string | null
}

export type AutomationAction =
  | "follow_up_reminder"
  | "stale_alert"
  | "escalation"
  | "re_engage"
  | "congratulate"

export type AutomationPriority = "critical" | "high" | "medium" | "low"

export interface AutomationTrigger {
  opportunityId: string
  opportunityName: string
  action: AutomationAction
  priority: AutomationPriority
  title: string
  message: string
  suggestedChannel: "whatsapp" | "phone" | "email" | "system"
  agentId: string | null
  daysInStage: number
}

// ── Stage SLA thresholds (days before triggering) ───────────────────

const STAGE_SLAS: Record<OpportunityStatus, { warn: number; critical: number }> = {
  new: { warn: 1, critical: 2 },          // New leads must be contacted within 24h
  contacted: { warn: 3, critical: 7 },    // Move to in_progress within 3 days
  in_progress: { warn: 7, critical: 14 }, // Active deals should progress weekly
  matched: { warn: 5, critical: 10 },     // Matched deals should close or move
  closed: { warn: Infinity, critical: Infinity },
  cancelled: { warn: Infinity, critical: Infinity },
}

// ── Follow-up message templates ─────────────────────────────────────

function getFollowUpMessage(opp: PipelineOpportunity, daysInStage: number): string {
  const name = opp.fullName.split(" ")[0]

  switch (opp.status) {
    case "new":
      if (daysInStage >= 2) {
        return `URGENT: ${opp.fullName} submitted a lead ${daysInStage} days ago and has NOT been contacted. Reach out immediately to avoid losing this lead.`
      }
      return `${opp.fullName} submitted a new ${opp.propertyType || "property"} inquiry${opp.area ? ` in ${opp.area}` : ""}. Contact them today.`

    case "contacted":
      return `${name} was contacted ${daysInStage} days ago but hasn't moved to active. Schedule a viewing or qualify their requirements to keep momentum.`

    case "in_progress":
      if (daysInStage >= 14) {
        return `${name}'s deal has been in progress for ${daysInStage} days without updates. Check if they're still interested or need different options.`
      }
      return `Time to follow up with ${name}. It's been ${daysInStage} days since the last update. A quick check-in keeps deals alive.`

    case "matched":
      return `${name} has been matched for ${daysInStage} days. Push for a decision — schedule a final viewing or send the offer documents.`

    default:
      return `Follow up needed for ${opp.fullName}.`
  }
}

function getReEngageMessage(opp: PipelineOpportunity, daysInStage: number): string {
  const name = opp.fullName.split(" ")[0]
  return `${name} has gone quiet for ${daysInStage} days. Consider sending a market update for ${opp.area || "their preferred area"} or new listings that match their criteria to re-spark interest.`
}

// ── Core automation scanner ─────────────────────────────────────────

export function scanPipeline(opportunities: PipelineOpportunity[]): AutomationTrigger[] {
  const triggers: AutomationTrigger[] = []
  const now = Date.now()

  for (const opp of opportunities) {
    // Skip terminal states
    if (opp.status === "closed" || opp.status === "cancelled") continue

    const lastUpdate = new Date(opp.updatedAt).getTime()
    const daysInStage = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24))

    const sla = STAGE_SLAS[opp.status]

    // Critical: past SLA
    if (daysInStage >= sla.critical) {
      if (opp.status === "new") {
        // Uncontacted leads past critical = escalation
        triggers.push({
          opportunityId: opp.id,
          opportunityName: opp.fullName,
          action: "escalation",
          priority: "critical",
          title: `ESCALATION: ${opp.fullName} uncontacted for ${daysInStage} days`,
          message: getFollowUpMessage(opp, daysInStage),
          suggestedChannel: opp.whatsapp ? "whatsapp" : "phone",
          agentId: opp.assignedAgentId,
          daysInStage,
        })
      } else if (daysInStage >= 30) {
        // 30+ days with no update = re-engage campaign
        triggers.push({
          opportunityId: opp.id,
          opportunityName: opp.fullName,
          action: "re_engage",
          priority: "medium",
          title: `Re-engage: ${opp.fullName} (${daysInStage} days inactive)`,
          message: getReEngageMessage(opp, daysInStage),
          suggestedChannel: "whatsapp",
          agentId: opp.assignedAgentId,
          daysInStage,
        })
      } else {
        triggers.push({
          opportunityId: opp.id,
          opportunityName: opp.fullName,
          action: "stale_alert",
          priority: "high",
          title: `Stale deal: ${opp.fullName} (${daysInStage}d in ${opp.status})`,
          message: getFollowUpMessage(opp, daysInStage),
          suggestedChannel: opp.whatsapp ? "whatsapp" : "phone",
          agentId: opp.assignedAgentId,
          daysInStage,
        })
      }
    }
    // Warning: approaching SLA
    else if (daysInStage >= sla.warn) {
      triggers.push({
        opportunityId: opp.id,
        opportunityName: opp.fullName,
        action: "follow_up_reminder",
        priority: opp.status === "new" ? "high" : "medium",
        title: `Follow up: ${opp.fullName} (${daysInStage}d in ${opp.status})`,
        message: getFollowUpMessage(opp, daysInStage),
        suggestedChannel: opp.whatsapp ? "whatsapp" : "email",
        agentId: opp.assignedAgentId,
        daysInStage,
      })
    }
  }

  // Sort by priority (critical first) then by days in stage
  const priorityOrder: Record<AutomationPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return triggers.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.daysInStage - a.daysInStage
  })
}

/**
 * Generate a daily digest summary of pipeline health.
 */
export interface PipelineHealthSummary {
  totalActive: number
  byStatus: Record<string, number>
  criticalCount: number
  highCount: number
  avgDaysInPipeline: number
  oldestLead: { name: string; days: number } | null
  triggers: AutomationTrigger[]
}

export function getPipelineHealth(opportunities: PipelineOpportunity[]): PipelineHealthSummary {
  const active = opportunities.filter(o => o.status !== "closed" && o.status !== "cancelled")
  const now = Date.now()

  const byStatus: Record<string, number> = {}
  let totalDays = 0
  let oldest: { name: string; days: number } | null = null

  for (const opp of active) {
    byStatus[opp.status] = (byStatus[opp.status] || 0) + 1

    const days = Math.floor((now - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    totalDays += days

    if (!oldest || days > oldest.days) {
      oldest = { name: opp.fullName, days }
    }
  }

  const triggers = scanPipeline(opportunities)

  return {
    totalActive: active.length,
    byStatus,
    criticalCount: triggers.filter(t => t.priority === "critical").length,
    highCount: triggers.filter(t => t.priority === "high").length,
    avgDaysInPipeline: active.length > 0 ? Math.round(totalDays / active.length) : 0,
    oldestLead: oldest,
    triggers,
  }
}
