import { NextRequest, NextResponse } from "next/server"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { toShareableListing } from "@/lib/listings/share"

/** Public lookup for colleague listing preview (token-gated). */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const supabase = createUntypedServerClient()
  const { data: share, error } = await supabase
    .from("listing_shares")
    .select("*")
    .eq("token", token)
    .maybeSingle()

  if (error || !share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 })
  }

  if (share.revoked_at) {
    return NextResponse.json({ error: "This share link was revoked" }, { status: 410 })
  }

  if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This share link has expired" }, { status: 410 })
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", share.listing_id)
    .maybeSingle()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing no longer available" }, { status: 404 })
  }

  await supabase
    .from("listing_shares")
    .update({
      view_count: (share.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", share.id)

  return NextResponse.json({
    listing: toShareableListing(listing),
    sharedBy: share.created_by_name || "Colleague",
    note: share.note || "",
    expiresAt: share.expires_at,
    pdfUrl: `/api/listing-share/${token}/pdf`,
  })
}
