import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { createUntypedServerClient as createServerClient } from "@/lib/supabase/server-untyped"
import { runPropertyFinder } from "@/app/app/owner-intelligence/_lib/apify"
import { computeDedupHash } from "@/app/app/owner-intelligence/_lib/dedup"
import { detectPortal } from "@/app/app/owner-intelligence/_lib/detectPortal"
import { lookupSchema } from "@/app/app/owner-intelligence/_lib/validation"
import { checkRateLimit } from "@/app/app/owner-intelligence/_lib/rate-limit"
import type { LookupStatus } from "@/types/owner-intelligence"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { allowed, remaining } = checkRateLimit(userId)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Daily lookup limit reached (100/day). Try again tomorrow." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      )
    }

    const body = await req.json()
    const parsed = lookupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { propertyUrl } = parsed.data
    const portal = detectPortal(propertyUrl)
    if (!portal) {
      return NextResponse.json({
        success: false,
        error: "Unsupported portal. We support Bayut, PropertyFinder, and Dubizzle.",
      }, { status: 400 })
    }

    const supabase = createServerClient()

    // Run Apify Actor 1
    const result = await runPropertyFinder(propertyUrl)

    if (!result.data) {
      return NextResponse.json({
        success: false,
        cached: false,
        data: null,
        error: result.status === "TIMED-OUT" ? "Lookup timed out — please retry" : "Lookup failed — please retry",
      }, { headers: { "X-RateLimit-Remaining": String(remaining) } })
    }

    const d = result.data

    // Determine status
    let lookupStatus: LookupStatus = "failed"
    if (d.ownerName && d.ownerPhone) lookupStatus = "resolved"
    else if (d.ownerName) lookupStatus = "partial"

    // Dedup check
    let dedupHash: string | undefined
    if (d.unitNumber && d.buildingName) {
      dedupHash = await computeDedupHash(d.unitNumber, d.buildingName)

      const { data: existing } = await supabase
        .from("owner_contacts")
        .select("*")
        .eq("dedup_hash", dedupHash)
        .single()

      if (existing) {
        const updatedAt = new Date(existing.updated_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        if (updatedAt > thirtyDaysAgo) {
          return NextResponse.json({
            success: true,
            cached: true,
            data: {
              id: existing.id,
              sourceUrl: existing.source_url,
              portal: existing.portal,
              propertyName: existing.property_name,
              buildingName: existing.building_name,
              unitNumber: existing.unit_number,
              zone: existing.zone,
              propertySize: existing.property_size,
              propertyValue: existing.property_value,
              rooms: existing.rooms,
              permitNumber: existing.permit_number,
              ownerName: existing.owner_name,
              ownerPhone: existing.owner_phone,
              ownerPhone2: existing.owner_phone2,
              ownerEmail: existing.owner_email,
              lookupStatus: existing.lookup_status as LookupStatus,
              dedupHash: existing.dedup_hash,
              createdAt: existing.created_at,
              updatedAt: existing.updated_at,
            },
          }, { headers: { "X-RateLimit-Remaining": String(remaining) } })
        }
      }
    }

    // Upsert to DB
    const row = {
      user_id: userId,
      source_url: propertyUrl,
      portal,
      property_name: d.propertyName || null,
      building_name: d.buildingName || null,
      unit_number: d.unitNumber || null,
      zone: d.zone || null,
      property_size: d.propertySize || null,
      property_value: d.propertyValue || null,
      rooms: d.rooms || null,
      permit_number: d.permitNumber || null,
      owner_name: d.ownerName || null,
      owner_phone: d.ownerPhone || null,
      owner_email: d.ownerEmail || null,
      lookup_status: lookupStatus,
      dedup_hash: dedupHash || null,
      updated_at: new Date().toISOString(),
    }

    const { data: saved, error: saveError } = dedupHash
      ? await supabase
          .from("owner_contacts")
          .upsert(row, { onConflict: "dedup_hash" })
          .select()
          .single()
      : await supabase.from("owner_contacts").insert(row).select().single()

    if (saveError) {
      console.error("DB save error:", saveError)
    }

    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        id: saved?.id,
        sourceUrl: propertyUrl,
        portal,
        propertyName: d.propertyName,
        buildingName: d.buildingName,
        unitNumber: d.unitNumber,
        zone: d.zone,
        propertySize: d.propertySize,
        propertyValue: d.propertyValue,
        rooms: d.rooms,
        permitNumber: d.permitNumber,
        ownerName: d.ownerName,
        ownerPhone: d.ownerPhone,
        ownerEmail: d.ownerEmail,
        lookupStatus,
        dedupHash,
        createdAt: saved?.created_at,
        updatedAt: saved?.updated_at,
      },
    }, { headers: { "X-RateLimit-Remaining": String(remaining) } })
  } catch (error) {
    console.error("Lookup error:", error)
    return NextResponse.json(
      { success: false, error: "Lookup failed — please retry" },
      { status: 500 }
    )
  }
}
