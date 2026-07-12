import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

/** Create or reuse an active share link for a listing (colleague preview). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const note = String(body.note || "").slice(0, 500)
  const expiresInDays = Number(body.expiresInDays || 30)

  const supabase = createUntypedServerClient()
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, owner_name")
    .eq("id", id)
    .maybeSingle()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  // Reuse latest non-revoked, non-expired share from this user for same listing
  const { data: existing } = await supabase
    .from("listing_shares")
    .select("*")
    .eq("listing_id", id)
    .eq("created_by", guard.context.userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const stillValid =
    existing &&
    (!existing.expires_at || new Date(existing.expires_at).getTime() > Date.now())

  if (stillValid) {
    const origin = request.nextUrl.origin
    return NextResponse.json({
      token: existing.token,
      url: `${origin}/share/listing/${existing.token}`,
      pdfUrl: `${origin}/api/listing-share/${existing.token}/pdf`,
      reused: true,
    })
  }

  const expires_at =
    Number.isFinite(expiresInDays) && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

  const { data: share, error } = await supabase
    .from("listing_shares")
    .insert({
      listing_id: id,
      created_by: guard.context.userId,
      created_by_name: guard.context.fullName || guard.context.email || "Agent",
      note,
      expires_at,
    })
    .select("*")
    .single()

  if (error || !share) {
    console.error("listing share create", error)
    return NextResponse.json({ error: error?.message || "Failed to create share" }, { status: 500 })
  }

  const origin = request.nextUrl.origin
  return NextResponse.json({
    token: share.token,
    url: `${origin}/share/listing/${share.token}`,
    pdfUrl: `${origin}/api/listing-share/${share.token}/pdf`,
    reused: false,
    listingTitle: listing.title,
  })
}
