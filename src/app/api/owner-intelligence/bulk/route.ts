import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { runPropertyFinder, runOwnerFinder } from "@/app/(dashboard)/owner-intelligence/_lib/apify"
import { computeDedupHash } from "@/app/(dashboard)/owner-intelligence/_lib/dedup"
import { detectPortal } from "@/app/(dashboard)/owner-intelligence/_lib/detectPortal"
import type { LookupStatus, SourceType } from "@/types/owner-intelligence"

interface BulkItem {
  url?: string
  unitNumber?: string
  buildingName?: string
  propertySize?: string
  zone?: string
}

export async function POST(req: NextRequest) {
  try {
    const { items, jobName, sourceType, userId } = (await req.json()) as {
      items: BulkItem[]
      jobName?: string
      sourceType: SourceType
      userId?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items provided" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create bulk job record
    const { data: job, error: jobError } = await supabase
      .from("bulk_jobs")
      .insert({
        user_id: userId || "anonymous",
        job_name: jobName || `Bulk ${sourceType} — ${items.length} items`,
        total_rows: items.length,
        processed_rows: 0,
        success_rows: 0,
        failed_rows: 0,
        status: "processing",
        source_type: sourceType,
      })
      .select()
      .single()

    if (jobError || !job) {
      console.error("Job creation error:", jobError)
      return NextResponse.json({ success: false, error: "Failed to create job" }, { status: 500 })
    }

    const jobId = job.id

    // Process in background (fire and forget)
    processItems(supabase, jobId, items, sourceType, userId || "anonymous").catch(
      (err) => console.error("Bulk processing error:", err)
    )

    return NextResponse.json({ success: true, jobId })
  } catch (error) {
    console.error("Bulk route error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to start bulk job" },
      { status: 500 }
    )
  }
}

async function processItems(
  supabase: ReturnType<typeof createServerClient>,
  jobId: string,
  items: BulkItem[],
  sourceType: SourceType,
  userId: string
) {
  let successRows = 0
  let failedRows = 0

  // Process in batches of 3 concurrent
  const BATCH_SIZE = 3
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((item) => processOneItem(supabase, item, sourceType, userId))
    )

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        successRows++
      } else {
        failedRows++
      }
    }

    // Update progress
    await supabase
      .from("bulk_jobs")
      .update({
        processed_rows: Math.min(i + batch.length, items.length),
        success_rows: successRows,
        failed_rows: failedRows,
      })
      .eq("id", jobId)
  }

  // Mark complete
  await supabase
    .from("bulk_jobs")
    .update({
      processed_rows: items.length,
      success_rows: successRows,
      failed_rows: failedRows,
      status: "complete",
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
}

async function processOneItem(
  supabase: ReturnType<typeof createServerClient>,
  item: BulkItem,
  sourceType: SourceType,
  userId: string
): Promise<boolean> {
  try {
    if (sourceType === "url_list" && item.url) {
      const portal = detectPortal(item.url)
      if (!portal) return false

      const result = await runPropertyFinder(item.url)
      if (!result.data) return false

      const d = result.data
      let lookupStatus: LookupStatus = "failed"
      if (d.ownerName && d.ownerPhone) lookupStatus = "resolved"
      else if (d.ownerName) lookupStatus = "partial"

      const dedupHash =
        d.unitNumber && d.buildingName
          ? await computeDedupHash(d.unitNumber, d.buildingName)
          : null

      await supabase.from("owner_contacts").upsert(
        {
          user_id: userId,
          source_url: item.url,
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
          dedup_hash: dedupHash,
          updated_at: new Date().toISOString(),
        },
        dedupHash ? { onConflict: "dedup_hash" } : undefined
      )

      return lookupStatus !== "failed"
    }

    if (sourceType === "owners_list" && item.unitNumber && item.buildingName) {
      const dedupHash = await computeDedupHash(item.unitNumber, item.buildingName)

      // Check cache
      const { data: existing } = await supabase
        .from("owner_contacts")
        .select("updated_at, lookup_status")
        .eq("dedup_hash", dedupHash)
        .single()

      if (existing) {
        const updatedAt = new Date(existing.updated_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        if (updatedAt > thirtyDaysAgo && existing.lookup_status !== "failed") {
          return true
        }
      }

      const result = await runOwnerFinder({
        unitNumber: item.unitNumber,
        buildingName: item.buildingName,
        propertySize: item.propertySize,
        zoneNameEn: item.zone,
      })

      const d = result.data
      let lookupStatus: LookupStatus = "failed"
      if (d?.ownerName && d?.ownerPhone) lookupStatus = "resolved"
      else if (d?.ownerName) lookupStatus = "partial"

      await supabase.from("owner_contacts").upsert(
        {
          user_id: userId,
          portal: "manual",
          building_name: item.buildingName,
          unit_number: item.unitNumber,
          zone: item.zone || d?.ownerArea || null,
          property_size: item.propertySize ? Number(item.propertySize) : null,
          owner_name: d?.ownerName || null,
          owner_phone: d?.ownerPhone || null,
          owner_phone2: d?.ownerPhone2 || null,
          owner_email: d?.ownerEmail || null,
          owner_date: d?.ownerDate || null,
          lookup_status: lookupStatus,
          dedup_hash: dedupHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "dedup_hash" }
      )

      return lookupStatus !== "failed"
    }

    return false
  } catch (err) {
    console.error("Process item error:", err)
    return false
  }
}
