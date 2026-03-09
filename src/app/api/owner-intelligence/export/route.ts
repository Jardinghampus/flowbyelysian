import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { createUntypedServerClient as createServerClient } from "@/lib/supabase/server-untyped"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const portal = searchParams.get("portal") || ""

    const supabase = createServerClient()

    let query = supabase.from("owner_contacts").select("*").eq("user_id", userId)

    if (search) {
      query = query.or(
        `owner_name.ilike.%${search}%,building_name.ilike.%${search}%,unit_number.ilike.%${search}%,zone.ilike.%${search}%`
      )
    }
    if (status) query = query.eq("lookup_status", status)
    if (portal) query = query.eq("portal", portal)

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }

    const headers = [
      "Owner Name",
      "Phone",
      "Phone 2",
      "Email",
      "Building",
      "Unit",
      "Zone",
      "Property Value",
      "Size (sqft)",
      "Rooms",
      "Source",
      "Status",
      "Date Added",
    ]

    const rows = (data || []).map((r) =>
      [
        r.owner_name || "",
        r.owner_phone || "",
        r.owner_phone2 || "",
        r.owner_email || "",
        r.building_name || "",
        r.unit_number || "",
        r.zone || "",
        r.property_value || "",
        r.property_size || "",
        r.rooms || "",
        r.portal || "",
        r.lookup_status || "",
        r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )

    const csv = [headers.join(","), ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="owner-contacts-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
