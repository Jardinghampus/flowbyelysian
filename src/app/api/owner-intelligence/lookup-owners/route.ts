import { NextRequest, NextResponse } from "next/server"
import { createUntypedServerClient as createServerClient } from "@/lib/supabase/server-untyped"
import { runOwnerFinder } from "@/app/(dashboard)/owner-intelligence/_lib/apify"
import { computeDedupHash } from "@/app/(dashboard)/owner-intelligence/_lib/dedup"
import type { LookupStatus } from "@/types/owner-intelligence"

export async function POST(req: NextRequest) {
  try {
    const { unitNumber, buildingName, propertySize, zoneNameEn, userId } = await req.json()

    if (!unitNumber || !buildingName) {
      return NextResponse.json(
        { success: false, error: "Missing unitNumber or buildingName" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Dedup check
    const dedupHash = await computeDedupHash(unitNumber, buildingName)
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
            portal: existing.portal,
            buildingName: existing.building_name,
            unitNumber: existing.unit_number,
            zone: existing.zone,
            propertySize: existing.property_size,
            ownerName: existing.owner_name,
            ownerPhone: existing.owner_phone,
            ownerPhone2: existing.owner_phone2,
            ownerEmail: existing.owner_email,
            lookupStatus: existing.lookup_status as LookupStatus,
            dedupHash: existing.dedup_hash,
            createdAt: existing.created_at,
            updatedAt: existing.updated_at,
          },
        })
      }
    }

    // Run Apify Actor 2
    const result = await runOwnerFinder({
      unitNumber,
      buildingName,
      propertySize: propertySize?.toString(),
      zoneNameEn,
    })

    if (!result.data) {
      // Save failed attempt
      await supabase.from("owner_contacts").upsert(
        {
          user_id: userId || "anonymous",
          portal: "manual",
          building_name: buildingName,
          unit_number: unitNumber,
          zone: zoneNameEn || null,
          property_size: propertySize ? Number(propertySize) : null,
          lookup_status: "failed",
          dedup_hash: dedupHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "dedup_hash" }
      )

      return NextResponse.json({
        success: false,
        cached: false,
        data: null,
        error:
          result.status === "TIMED-OUT"
            ? "Lookup timed out — please retry"
            : "Lookup failed — please retry",
      })
    }

    const d = result.data
    let lookupStatus: LookupStatus = "failed"
    if (d.ownerName && d.ownerPhone) lookupStatus = "resolved"
    else if (d.ownerName) lookupStatus = "partial"

    const row = {
      user_id: userId || "anonymous",
      portal: "manual" as const,
      building_name: buildingName,
      unit_number: unitNumber,
      zone: zoneNameEn || d.ownerArea || null,
      property_size: propertySize ? Number(propertySize) : null,
      owner_name: d.ownerName || null,
      owner_phone: d.ownerPhone || null,
      owner_phone2: d.ownerPhone2 || null,
      owner_email: d.ownerEmail || null,
      owner_date: d.ownerDate || null,
      lookup_status: lookupStatus,
      dedup_hash: dedupHash,
      updated_at: new Date().toISOString(),
    }

    const { data: saved } = await supabase
      .from("owner_contacts")
      .upsert(row, { onConflict: "dedup_hash" })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        id: saved?.id,
        portal: "manual",
        buildingName,
        unitNumber,
        zone: zoneNameEn || d.ownerArea,
        propertySize: propertySize ? Number(propertySize) : undefined,
        ownerName: d.ownerName,
        ownerPhone: d.ownerPhone,
        ownerPhone2: d.ownerPhone2,
        ownerEmail: d.ownerEmail,
        ownerDate: d.ownerDate,
        lookupStatus,
        dedupHash,
        createdAt: saved?.created_at,
        updatedAt: saved?.updated_at,
      },
    })
  } catch (error) {
    console.error("Owner lookup error:", error)
    return NextResponse.json(
      { success: false, error: "Lookup failed — please retry" },
      { status: 500 }
    )
  }
}
