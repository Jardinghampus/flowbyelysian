import type { SupabaseClient } from "@supabase/supabase-js"

export type FeedEventType = "listing_live" | "listing_pocket" | "listing_request" | "listing_updated"

export async function emitTeamFeedEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any> | { from: (t: string) => any },
  listing: {
    id: string
    title?: string | null
    area_name?: string | null
    status?: string | null
    inquiry_type?: string | null
    transaction_type?: string | null
    price?: number | null
    bedrooms?: number | null
    type?: string | null
    owner_id: string
    owner_name?: string | null
  },
  eventType?: FeedEventType
) {
  const inquiry = String(listing.inquiry_type || "stock")
  const status = String(listing.status || "live")
  const resolved: FeedEventType =
    eventType ||
    (inquiry === "request"
      ? "listing_request"
      : status === "pocket"
        ? "listing_pocket"
        : "listing_live")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("team_feed_events").insert({
    event_type: resolved,
    listing_id: listing.id,
    actor_id: listing.owner_id,
    actor_name: listing.owner_name || "Agent",
    title: listing.title || "",
    area_name: listing.area_name || "",
    status,
    inquiry_type: inquiry,
    transaction_type: listing.transaction_type || "sale",
    price: listing.price ?? null,
    bedrooms: listing.bedrooms ?? null,
    property_type: listing.type || "",
  })
}
