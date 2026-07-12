import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { emitActivityEvent } from "@/lib/audit/events"

const DEAL_STATUSES = [
  "offer",
  "negotiation",
  "mou",
  "form_f",
  "closed_won",
  "closed_lost",
  "cancelled",
] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { id } = await params
  const body = await request.json()
  const supabase = createUntypedServerClient()

  const { data: existing } = await supabase.from("deals").select("*").eq("id", id).maybeSingle()
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  }

  if (existing.agent_id !== guard.context.userId && guard.context.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) update.title = body.title
  if (body.status !== undefined) {
    if (!DEAL_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    update.status = body.status
    if (body.status === "closed_won" || body.status === "closed_lost") {
      update.closed_at = new Date().toISOString()
    }
  }
  if (body.offerAmount !== undefined) update.offer_amount = body.offerAmount
  if (body.agreedAmount !== undefined) update.agreed_amount = body.agreedAmount
  if (body.grossCommission !== undefined) update.gross_commission = body.grossCommission
  if (body.companySplitPct !== undefined) update.company_split_pct = body.companySplitPct
  if (body.agentSplitPct !== undefined) update.agent_split_pct = body.agentSplitPct
  if (body.coBrokerName !== undefined) update.co_broker_name = body.coBrokerName
  if (body.coBrokerSplitPct !== undefined) update.co_broker_split_pct = body.coBrokerSplitPct
  if (body.expectedCloseDate !== undefined) update.expected_close_date = body.expectedCloseDate
  if (body.commissionPaid !== undefined) {
    update.commission_paid = Boolean(body.commissionPaid)
    update.commission_paid_at = body.commissionPaid ? new Date().toISOString() : null
  }
  if (body.trakheesiPermit !== undefined) update.trakheesi_permit = body.trakheesiPermit
  if (body.formARef !== undefined) update.form_a_ref = body.formARef
  if (body.formBRef !== undefined) update.form_b_ref = body.formBRef
  if (body.formFRef !== undefined) update.form_f_ref = body.formFRef
  if (body.mouRef !== undefined) update.mou_ref = body.mouRef
  if (body.notes !== undefined) update.notes = body.notes

  const { data, error } = await supabase.from("deals").update(update).eq("id", id).select("*").single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.status && body.status !== existing.status) {
    await emitActivityEvent(supabase, {
      actor: {
        userId: guard.context.userId,
        role: guard.context.role,
        name: guard.context.fullName,
      },
      entityType: "deal",
      entityId: id,
      eventType: "deal.status_changed",
      title: `Deal → ${body.status}`,
      body: existing.title,
      payload: { from: existing.status, to: body.status },
    })
  }

  return NextResponse.json({ deal: data })
}
