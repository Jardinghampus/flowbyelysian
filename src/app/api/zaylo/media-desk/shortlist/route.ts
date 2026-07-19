import { NextRequest, NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

/** Create a shortlist pack for an opportunity (listings + comps notes). */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const body = (await request.json()) as {
      opportunityId?: string
      title?: string
      listingIds?: string[]
      compNotes?: Array<{ place: string; price: string; note?: string }>
      proofPostId?: string
    }

    if (!body.opportunityId) {
      return NextResponse.json({ error: "opportunityId required" }, { status: 400 })
    }

    const supabase = createUntypedServerClient()
    const { data, error } = await supabase
      .from("media_shortlists")
      .insert({
        opportunity_id: body.opportunityId,
        title: body.title || "Private shortlist",
        listing_ids: body.listingIds || [],
        comp_notes: body.compNotes || [],
        proof_post_id: body.proofPostId || null,
        created_by: guard.context.email,
      })
      .select("id")
      .single()

    if (error) {
      // Fallback: store on opportunity notes if table missing
      await supabase
        .from("opportunities")
        .update({
          shortlist_listing_ids: body.listingIds || [],
          shortlist_notes: JSON.stringify(body.compNotes || []),
          notes: `Shortlist created · proof ${body.proofPostId || "n/a"}`,
        })
        .eq("id", body.opportunityId)
      return NextResponse.json({ ok: true, degraded: true })
    }

    await supabase
      .from("opportunities")
      .update({
        shortlist_listing_ids: body.listingIds || [],
        status: "in_progress",
      })
      .eq("id", body.opportunityId)

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    console.error("shortlist create failed:", error)
    return NextResponse.json({ error: "Failed to create shortlist" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const opportunityId = request.nextUrl.searchParams.get("opportunityId")
    const supabase = createUntypedServerClient()
    let query = supabase.from("media_shortlists").select("*").order("created_at", { ascending: false }).limit(50)
    if (opportunityId) query = query.eq("opportunity_id", opportunityId)

    const { data, error } = await query
    if (error) return NextResponse.json({ shortlists: [], error: error.message })
    return NextResponse.json({ shortlists: data || [] })
  } catch (error) {
    console.error("shortlist list failed:", error)
    return NextResponse.json({ shortlists: [] })
  }
}
