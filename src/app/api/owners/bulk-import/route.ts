import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@/lib/demo-auth"
import { bulkCreateOwners } from "@/app/app/data/_lib/supabase-queries"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()
    const { rows } = body as { rows: Array<Record<string, string>> }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 })
    }

    const owners = rows.map((row) => ({
      user_id: userId,
      name: (row.name || row.Name || row.owner_name || row["Owner Name"] || "").trim(),
      phone: (row.phone || row.Phone || row.mobile || row.Mobile || row.number || "").trim(),
      area: (row.area || row.Area || row.location || row.Location || "").trim(),
      unit_number: (row.unit_number || row.unit || row.Unit || row["Unit Number"] || "").trim() || null,
      bedrooms: (row.bedrooms || row.Bedrooms || row.BR || row.br || "").trim() || null,
      status: "owner" as const,
      priority: "medium" as const,
      notes: (row.notes || row.Notes || row.remarks || row.Remarks || "").trim() || null,
      assigned_agent_id: userId,
      assigned_agent_name: user?.fullName || "Unknown",
      is_hidden: false,
    })).filter((o) => o.name && o.phone && o.area)

    if (owners.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found. Required: name, phone, area." },
        { status: 400 }
      )
    }

    const result = await bulkCreateOwners(owners as never[])

    return NextResponse.json({
      ...result,
      totalRows: rows.length,
      validRows: owners.length,
      invalidRows: rows.length - owners.length,
    })
  } catch (error) {
    console.error("Error in bulk import:", error)
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 })
  }
}
