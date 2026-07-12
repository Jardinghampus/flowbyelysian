import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { emitActivityEvent } from "@/lib/audit/events"
import { getDefaultTeamId } from "@/lib/api/team"

const DEAL_STATUSES = [
  "offer",
  "negotiation",
  "mou",
  "form_f",
  "closed_won",
  "closed_lost",
  "cancelled",
] as const

export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const mine = searchParams.get("mine") === "1"
  const limit = parseInt(searchParams.get("limit") || "100")
  const supabase = createUntypedServerClient()

  let query = supabase.from("deals").select("*").order("updated_at", { ascending: false }).limit(limit)

  if (guard.context.role === "agent" || mine) {
    query = query.eq("agent_id", guard.context.userId)
  }
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) {
    console.error("deals GET", error)
    return NextResponse.json({ deals: [], warning: error.message })
  }

  return NextResponse.json({ deals: data || [] })
}

export async function POST(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const body = await request.json()
  const title = String(body.title || "").trim()
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const status = DEAL_STATUSES.includes(body.status) ? body.status : "offer"
  const supabase = createUntypedServerClient()
  const teamId = await getDefaultTeamId(supabase)

  const row = {
    team_id: teamId,
    listing_id: body.listingId || null,
    opportunity_id: body.opportunityId || null,
    owner_contact_id: body.ownerContactId || null,
    title,
    deal_type: body.dealType === "rent" ? "rent" : "sale",
    status,
    offer_amount: body.offerAmount ?? null,
    agreed_amount: body.agreedAmount ?? null,
    gross_commission: body.grossCommission ?? null,
    company_split_pct: body.companySplitPct ?? 50,
    agent_split_pct: body.agentSplitPct ?? 50,
    co_broker_name: body.coBrokerName || null,
    co_broker_split_pct: body.coBrokerSplitPct ?? null,
    expected_close_date: body.expectedCloseDate || null,
    trakheesi_permit: body.trakheesiPermit || null,
    form_a_ref: body.formARef || null,
    form_b_ref: body.formBRef || null,
    form_f_ref: body.formFRef || null,
    mou_ref: body.mouRef || null,
    notes: body.notes || null,
    agent_id: guard.context.userId,
    agent_name: guard.context.fullName || "Agent",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("deals").insert(row).select("*").single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await emitActivityEvent(supabase, {
    actor: {
      userId: guard.context.userId,
      role: guard.context.role,
      name: guard.context.fullName,
    },
    entityType: "deal",
    entityId: data.id,
    eventType: "deal.created",
    title: `Deal created: ${title}`,
    body: `Status ${status}`,
    payload: { listingId: row.listing_id, status },
  })

  return NextResponse.json({ deal: data }, { status: 201 })
}
