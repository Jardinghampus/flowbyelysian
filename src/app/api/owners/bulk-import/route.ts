import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@/lib/demo-auth"
import { bulkCreateOwners } from "@/app/app/data/_lib/supabase-queries"

function str(v: unknown): string {
  return String(v ?? "").trim()
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

function normalizePrice(v: unknown): string {
  return String(v ?? "").replace(/,/g, "").trim()
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()
    const { rows } = body as { rows: Array<Record<string, unknown>> }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 })
    }

    const owners = rows.map((row) => {
      // Generic columns
      const genericName = str(row.name ?? row.Name ?? row.owner_name ?? row["Owner Name"])
      const genericPhone = normalizePhone(str(row.phone ?? row.Phone ?? row.number))
      const genericArea = str(row.area ?? row.Area ?? row.location ?? row.Location)

      // DLD columns
      const dldName = str(row.NameEn)
      const dldPhone = normalizePhone(str(row.Mobile ?? row.mobile))
      const dldArea = str(row["Master Project"])
      const dldProject = str(row.Project)
      const dldUnit = str(row.UnitNumber)
      const dldSize = str(row.Size)
      const dldPrice = normalizePrice(row.ProcedureValue)
      const dldPartyType = str(row.ProcedurePartyTypeNameEn)
      const dldPropType = str(row.PropertyTypeEn)
      const dldTxType = str(row.ProcedureNameEn)
      const dldCountry = str(row.CountryNameEn)

      const name = dldName || genericName
      const phone = dldPhone || genericPhone
      const area = dldArea || genericArea
      const unit_number = dldUnit || str(row.unit_number ?? row.unit ?? row.Unit ?? row["Unit Number"]) || null
      const bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR ?? row.br) || null

      // Compose notes from DLD fields
      const noteParts: string[] = []
      if (dldProject) noteParts.push(dldProject)
      if (dldPartyType) noteParts.push(dldPartyType)
      if (dldPropType) noteParts.push(dldPropType)
      if (dldTxType) noteParts.push(dldTxType)
      if (dldCountry) noteParts.push(dldCountry)
      if (dldSize) noteParts.push(`${dldSize} sqft`)
      if (dldPrice) noteParts.push(`AED ${Number(dldPrice).toLocaleString()}`)
      const notes = noteParts.length > 0
        ? noteParts.join(" • ")
        : str(row.notes ?? row.Notes ?? row.remarks ?? row.Remarks) || null

      return {
        user_id: userId,
        name,
        phone,
        area,
        unit_number: unit_number || null,
        bedrooms: bedrooms || null,
        status: "owner" as const,
        priority: "medium" as const,
        notes: notes || null,
        assigned_agent_id: userId,
        assigned_agent_name: user?.fullName || "Unknown",
        is_hidden: false,
      }
    }).filter((o) => o.name && o.phone && o.area)

    if (owners.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found. Required: name (or NameEn), phone (or Mobile), area (or Master Project)." },
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
