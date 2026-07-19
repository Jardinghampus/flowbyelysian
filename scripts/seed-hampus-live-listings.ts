/**
 * Seed Hampus live inventory + team feed events (Derrick Signature stock).
 * Run: npx tsx scripts/seed-hampus-live-listings.ts
 */
import { createClient } from "@supabase/supabase-js"
import { emitTeamFeedEvent } from "../src/lib/listings/feed"

type ListingSeed = {
  title: string
  area_name: string
  sub_area: string
  size: number
  price: number
  type: "villa" | "apartment" | "townhouse"
  transaction_type: "rent" | "sale"
  bedrooms: number
  bathrooms: number
  notes: string
  availability?: string
}

const AGENCY = "DERRICK SIGNATURE PROPERTIES L.L.C"
const SEED_TAG = "seed:hampus-derrick-live-2026-07"

const LISTINGS: ListingSeed[] = [
  {
    title: "Furnished 1BR | Prime Location | Family Living",
    area_name: "Motor City",
    sub_area: "Weston Court 2",
    size: 943,
    price: 79000,
    type: "apartment",
    transaction_type: "rent",
    bedrooms: 1,
    bathrooms: 2,
    notes: `${AGENCY} · Weston Court, Motor City · Listed ~2 months ago`,
    availability: "Available",
  },
  {
    title: "3BR + Maid's | Single Row | Vacant | Casa Flores",
    area_name: "Motor City",
    sub_area: "Casa Flores, Green Community",
    size: 2587,
    price: 249999,
    type: "townhouse",
    transaction_type: "rent",
    bedrooms: 3,
    bathrooms: 5,
    notes: `${AGENCY} · Featured · Listed ~13 days ago`,
    availability: "Vacant",
  },
  {
    title: "3BR | Park Location | Available Mid August",
    area_name: "Tilal Al Ghaf",
    sub_area: "Elan",
    size: 1511,
    price: 185000,
    type: "villa",
    transaction_type: "rent",
    bedrooms: 3,
    bathrooms: 4,
    notes: `${AGENCY} · Featured · Listed ~18 days ago`,
    availability: "Mid August",
  },
  {
    title: "4-Bedroom Townhouse | Semi-Detached | Single Row",
    area_name: "Mudon",
    sub_area: "Arabella Townhouses 3",
    size: 3388,
    price: 260000,
    type: "townhouse",
    transaction_type: "rent",
    bedrooms: 4,
    bathrooms: 5,
    notes: `${AGENCY} · Arabella Townhouses · Listed ~20 days ago`,
    availability: "Available",
  },
  {
    title: "4-Bedroom Townhouse | Semi-Detached | Single Row (Alt)",
    area_name: "Mudon",
    sub_area: "Arabella Townhouses 3",
    size: 3388,
    price: 260000,
    type: "townhouse",
    transaction_type: "rent",
    bedrooms: 4,
    bathrooms: 5,
    notes: `${AGENCY} · Duplicate Bayut ref · Listed ~20 days ago`,
    availability: "Available",
  },
  {
    title: "Vacant 2BR | Bright and Spacious | Motor City",
    area_name: "Motor City",
    sub_area: "Rabdan Building",
    size: 1200,
    price: 110000,
    type: "apartment",
    transaction_type: "rent",
    bedrooms: 2,
    bathrooms: 2,
    notes: `${AGENCY} · Listed ~1 month ago`,
    availability: "Vacant",
  },
  {
    title: "Vacant 2BR | Bright Living | Prime Motor City",
    area_name: "Motor City",
    sub_area: "Rabdan Building",
    size: 1175,
    price: 105000,
    type: "apartment",
    transaction_type: "rent",
    bedrooms: 2,
    bathrooms: 2,
    notes: `${AGENCY} · Listed ~2 months ago`,
    availability: "Vacant",
  },
  {
    title: "Aura Gardens | 3 Bed + Maid | Private Garden",
    area_name: "Tilal Al Ghaf",
    sub_area: "Aura Gardens",
    size: 1534,
    price: 4250000,
    type: "villa",
    transaction_type: "sale",
    bedrooms: 3,
    bathrooms: 4,
    notes: `${AGENCY} · ~11K Mortgage Cashback · Listed ~2 days ago`,
    availability: "Available",
  },
  {
    title: "3BR | Park Location | Vacant on Transfer",
    area_name: "Tilal Al Ghaf",
    sub_area: "Elan",
    size: 1511,
    price: 3950000,
    type: "villa",
    transaction_type: "sale",
    bedrooms: 3,
    bathrooms: 4,
    notes: `${AGENCY} · Listed ~17 days ago`,
    availability: "Vacant on transfer",
  },
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error("Missing Supabase env vars")
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data: hampus, error: userError } = await supabase
    .from("app_users")
    .select("id, full_name, email")
    .ilike("email", "hampus@zaylo.com")
    .maybeSingle()

  if (userError || !hampus) {
    console.error("Hampus user not found:", userError?.message)
    process.exit(1)
  }

  const ownerId = hampus.id as string
  const ownerName = (hampus.full_name as string) || "Hampus"
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from("listings")
    .select("id, title")
    .eq("owner_id", ownerId)
    .like("notes", `%${SEED_TAG}%`)

  if (existing?.length) {
    console.log(`Removing ${existing.length} previous seed listings…`)
    const ids = existing.map((row) => row.id)
    await supabase.from("team_feed_events").delete().in("listing_id", ids)
    await supabase.from("listings").delete().in("id", ids)
  }

  let created = 0
  for (const item of LISTINGS) {
    const row = {
      title: item.title,
      area_name: item.area_name,
      sub_area: item.sub_area,
      size: item.size,
      price: item.price,
      type: item.type,
      status: "live",
      inquiry_type: "stock",
      transaction_type: item.transaction_type,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      availability: item.availability || null,
      notes: `${item.notes} · ${SEED_TAG}`,
      owner_id: ownerId,
      owner_name: ownerName,
      created_at: now,
      updated_at: now,
    }

    const { data: listing, error } = await supabase.from("listings").insert(row).select("*").single()
    if (error) {
      console.error("Insert failed:", item.title, error.message)
      continue
    }

    await emitTeamFeedEvent(supabase, listing as Parameters<typeof emitTeamFeedEvent>[1])
    created++
    console.log(`  + ${item.transaction_type.toUpperCase()} · ${item.title}`)
  }

  console.log(`\nDone — ${created} live listings + feed events for ${ownerName}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
