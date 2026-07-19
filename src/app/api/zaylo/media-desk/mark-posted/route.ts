import { NextRequest, NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

/** Mark a Media Desk post as posted on IG and/or LinkedIn. */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const body = (await request.json()) as {
      scheduleKey?: string
      platform?: "instagram" | "linkedin" | "both"
      captionIg?: string
      captionLi?: string
      hook?: string
      headline?: string
      communityId?: string
      concept?: string
    }

    if (!body.scheduleKey || !body.platform) {
      return NextResponse.json({ error: "scheduleKey and platform required" }, { status: 400 })
    }

    const supabase = createUntypedServerClient()
    const now = new Date().toISOString()
    const patch: Record<string, unknown> = {
      schedule_key: body.scheduleKey,
      community_id: body.communityId || null,
      concept: body.concept || null,
      hook: body.hook || "Media Desk",
      headline: body.headline || "Posted",
      body: body.captionIg || body.captionLi || "",
      caption: body.captionIg || body.captionLi || "",
      caption_ig: body.captionIg || null,
      caption_li: body.captionLi || null,
      format: "1080x1350",
      status: "posted",
      narrative: "dubai_land_villa_expert",
    }

    if (body.platform === "instagram" || body.platform === "both") {
      patch.posted_ig_at = now
    }
    if (body.platform === "linkedin" || body.platform === "both") {
      patch.posted_li_at = now
    }

    const { data: existing } = await supabase
      .from("zaylo_social_posts")
      .select("id, posted_ig_at, posted_li_at")
      .eq("schedule_key", body.scheduleKey)
      .maybeSingle()

    const igAt =
      body.platform === "instagram" || body.platform === "both"
        ? now
        : existing?.posted_ig_at || null
    const liAt =
      body.platform === "linkedin" || body.platform === "both"
        ? now
        : existing?.posted_li_at || null

    patch.posted_ig_at = igAt
    patch.posted_li_at = liAt
    patch.posted_at = igAt || liAt
    patch.desk_status =
      igAt && liAt ? "posted_both" : igAt ? "posted_ig" : liAt ? "posted_li" : "ready"

    if (existing?.id) {
      const { error } = await supabase.from("zaylo_social_posts").update(patch).eq("id", existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from("zaylo_social_posts").insert(patch)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      scheduleKey: body.scheduleKey,
      postedIgAt: igAt,
      postedLiAt: liAt,
      deskStatus: patch.desk_status,
    })
  } catch (error) {
    console.error("mark-posted failed:", error)
    return NextResponse.json({ error: "Failed to mark posted" }, { status: 500 })
  }
}
