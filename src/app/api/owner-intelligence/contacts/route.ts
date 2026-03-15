import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { createUntypedServerClient as createServerClient } from "@/lib/supabase/server-untyped"
import { deleteContactsSchema } from "@/app/app/owner-intelligence/_lib/validation"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ contacts: [], total: 0, page: 1 }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const portal = searchParams.get("portal") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const supabase = createServerClient()
    const offset = (page - 1) * limit

    let query = supabase.from("owner_contacts").select("*", { count: "exact" }).eq("user_id", userId)

    if (search) {
      query = query.or(
        `owner_name.ilike.%${search}%,building_name.ilike.%${search}%,unit_number.ilike.%${search}%,zone.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq("lookup_status", status)
    }

    if (portal) {
      query = query.eq("portal", portal)
    }

    const validSortColumns: Record<string, string> = {
      created_at: "created_at",
      owner_name: "owner_name",
      property_value: "property_value",
      zone: "zone",
    }
    const sortColumn = validSortColumns[sortBy] || "created_at"

    query = query.order(sortColumn, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error("Contacts query error:", error)
      return NextResponse.json({ contacts: [], total: 0, page }, { status: 500 })
    }

    const contacts = (data || []).map((row) => ({
      id: row.id,
      sourceUrl: row.source_url,
      portal: row.portal,
      propertyName: row.property_name,
      buildingName: row.building_name,
      unitNumber: row.unit_number,
      zone: row.zone,
      propertySize: row.property_size,
      propertyValue: row.property_value,
      rooms: row.rooms,
      permitNumber: row.permit_number,
      ownerName: row.owner_name,
      ownerPhone: row.owner_phone,
      ownerPhone2: row.owner_phone2,
      ownerEmail: row.owner_email,
      lookupStatus: row.lookup_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json({ contacts, total: count || 0, page })
  } catch (error) {
    console.error("Contacts error:", error)
    return NextResponse.json({ contacts: [], total: 0, page: 1 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = deleteContactsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from("owner_contacts")
      .delete()
      .eq("user_id", userId)
      .in("id", parsed.data.ids)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 })
  }
}
