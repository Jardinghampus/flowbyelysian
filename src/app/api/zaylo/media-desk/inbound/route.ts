import { NextRequest, NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

const ALLOWED_SOURCES = new Set([
  "instagram_dm",
  "linkedin",
  "instagram_organic",
  "website",
  "referral",
  "cold_outreach",
])

/** Log inbound DM / LI lead into opportunities with Media Desk attribution. */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const body = (await request.json()) as {
      name?: string
      phone?: string
      email?: string
      source?: string
      mediaPostId?: string
      community?: string
      budgetAed?: number
      beds?: number
      timeline?: string
      finance?: string
      intent?: "buy" | "sell" | "rent" | "unknown"
      notes?: string
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const source = body.source && ALLOWED_SOURCES.has(body.source) ? body.source : "instagram_dm"
    const supabase = createUntypedServerClient()

    const payload = {
      type: body.intent === "sell" ? "sell" : body.intent === "rent" ? "rent" : "buy",
      full_name: body.name.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || "media-desk@zaylo.local",
      area: body.community || null,
      bedrooms: body.beds ?? null,
      price: body.budgetAed ?? null,
      source,
      status: "new",
      media_post_id: body.mediaPostId || null,
      qualify_budget_aed: body.budgetAed ?? null,
      qualify_beds: body.beds ?? null,
      qualify_communities: body.community ? [body.community] : [],
      qualify_timeline: body.timeline || null,
      qualify_finance: body.finance || null,
      qualify_intent: body.intent || "unknown",
      notes: body.notes || `Inbound via Media Desk (${source})`,
    }

    const { data, error } = await supabase.from("opportunities").insert(payload).select("id").single()

    if (error) {
      const minimal = {
        type: payload.type,
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email,
        area: payload.area,
        bedrooms: payload.bedrooms,
        price: payload.price,
        source: "website",
        status: "new",
        notes: `${payload.notes}${body.mediaPostId ? ` · post ${body.mediaPostId}` : ""} · channel ${source} · intent ${body.intent || "unknown"} · budget ${body.budgetAed ?? "n/a"} · beds ${body.beds ?? "n/a"}`,
      }
      const retry = await supabase.from("opportunities").insert(minimal).select("id").single()
      if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 })
      return NextResponse.json({ ok: true, id: retry.data.id, degraded: true })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    console.error("inbound media lead failed:", error)
    return NextResponse.json({ error: "Failed to log inbound lead" }, { status: 500 })
  }
}
