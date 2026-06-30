import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  scanPipeline,
  getPipelineHealth,
  type PipelineOpportunity,
} from "@/lib/pipeline-automations"

/**
 * GET /api/pipeline-automations
 * Scan pipeline and return automation triggers + health summary.
 *
 * Query params:
 *   - agentId: filter by assigned agent
 *   - priority: filter triggers by priority (critical, high, medium, low)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const agentId = searchParams.get("agentId")
    const priorityFilter = searchParams.get("priority")

    // Fetch all non-terminal opportunities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("opportunities")
      .select("*")
      .not("status", "in", '("closed","cancelled")')
      .order("updated_at", { ascending: true })

    if (agentId) query = query.eq("assigned_agent_id", agentId)

    const { data: opportunities, error } = await query

    if (error) throw error

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json({
        triggers: [],
        health: {
          totalActive: 0,
          byStatus: {},
          criticalCount: 0,
          highCount: 0,
          avgDaysInPipeline: 0,
          oldestLead: null,
          triggers: [],
        },
      })
    }

    // Convert to pipeline format
    const pipelineOpps: PipelineOpportunity[] = opportunities.map((opp: Record<string, unknown>) => ({
      id: opp.id as string,
      status: opp.status as PipelineOpportunity["status"],
      fullName: opp.full_name as string,
      phone: opp.phone as string | null,
      whatsapp: opp.whatsapp as string | null,
      email: opp.email as string | null,
      area: opp.area as string | null,
      propertyType: opp.property_type as string | null,
      assignedAgentId: opp.assigned_agent_id as string | null,
      assignedAgentName: opp.assigned_agent_name as string | null,
      createdAt: opp.created_at as string,
      updatedAt: opp.updated_at as string,
      notes: opp.notes as string | null,
    }))

    const health = getPipelineHealth(pipelineOpps)

    // Optionally filter triggers by priority
    let triggers = health.triggers
    if (priorityFilter) {
      triggers = triggers.filter(t => t.priority === priorityFilter)
    }

    return NextResponse.json({
      triggers,
      health: {
        totalActive: health.totalActive,
        byStatus: health.byStatus,
        criticalCount: health.criticalCount,
        highCount: health.highCount,
        avgDaysInPipeline: health.avgDaysInPipeline,
        oldestLead: health.oldestLead,
      },
    })
  } catch (error) {
    console.error("Error scanning pipeline:", error)
    return NextResponse.json({ error: "Failed to scan pipeline" }, { status: 500 })
  }
}
