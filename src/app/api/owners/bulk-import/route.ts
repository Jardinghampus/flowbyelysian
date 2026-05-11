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
    const { rows, datasetName } = body as { rows: Array<Record<string, unknown>>; datasetName?: string }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 })
    }

    const owners = rows.map((row) => {
      const isCompany = "Transaction (AED)" in row || ("Community" in row && "Property Ref" in row)
      const isDld = !isCompany && (row.NameEn || row["Master Project"] || row.Mobile)

      let name: string, phone: string, area: string, subArea: string,
          unit_number: string | null, bedrooms: string | null, notes: string | null

      if (isCompany) {
        name = str(row.Name ?? row.name)
        phone = normalizePhone(str(row.Phone ?? row.phone))
        area = str(row.Area ?? row.area)
        subArea = str(row.Community ?? row.community)
        unit_number = str(row["Unit No"] ?? row["Unit No."] ?? row.UnitNo) || null
        bedrooms = str(row.Beds ?? row.beds ?? row.Bedrooms) || null
        const role = str(row.Role)
        const txType = str(row["Transaction Type"])
        const propType = str(row.Type)
        const size = str(row["Size (sqm)"])
        const price = normalizePrice(row["Transaction (AED)"])
        const nationality = str(row.Nationality)
        const source = str(row.Source)
        const propRef = str(row["Property Ref"])
        const date = str(row.Date)
        const noteParts: string[] = []
        if (role) noteParts.push(role)
        if (txType) noteParts.push(txType)
        if (propType) noteParts.push(propType)
        if (size) noteParts.push(`${size} sqm`)
        if (price) noteParts.push(`AED ${Number(price).toLocaleString()}`)
        if (nationality) noteParts.push(nationality)
        if (propRef) noteParts.push(`Ref: ${propRef}`)
        if (date) noteParts.push(date)
        if (source) noteParts.push(`Source: ${source}`)
        notes = noteParts.join(" • ") || null
      } else if (isDld) {
        name = str(row.NameEn)
        phone = normalizePhone(str(row.Mobile ?? row.mobile))
        area = str(row["Master Project"])
        subArea = str(row.Project)
        unit_number = str(row.UnitNumber) || null
        bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR) || null
        const size = str(row.Size)
        const price = normalizePrice(row.ProcedureValue)
        const partyType = str(row.ProcedurePartyTypeNameEn)
        const propType = str(row.PropertyTypeEn)
        const txType = str(row.ProcedureNameEn)
        const country = str(row.CountryNameEn)
        const noteParts: string[] = []
        if (partyType) noteParts.push(partyType)
        if (propType) noteParts.push(propType)
        if (txType) noteParts.push(txType)
        if (country) noteParts.push(country)
        if (size) noteParts.push(`${size} sqft`)
        if (price) noteParts.push(`AED ${Number(price).toLocaleString()}`)
        notes = noteParts.join(" • ") || null
      } else {
        name = str(row.name ?? row.Name ?? row.owner_name ?? row["Owner Name"])
        phone = normalizePhone(str(row.phone ?? row.Phone ?? row.number))
        area = str(row.area ?? row.Area ?? row.location ?? row.Location)
        subArea = str(row.sub_area ?? row["Sub Area"] ?? row.subarea ?? row.Subarea)
        unit_number = str(row.unit_number ?? row.unit ?? row.Unit ?? row["Unit Number"]) || null
        bedrooms = str(row.bedrooms ?? row.Bedrooms ?? row.BR ?? row.br) || null
        notes = str(row.notes ?? row.Notes ?? row.remarks ?? row.Remarks) || null
      }

      return {
        user_id: userId,
        name,
        phone,
        area,
        sub_area: subArea || null,
        unit_number,
        bedrooms,
        status: "owner" as const,
        priority: "medium" as const,
        notes,
        assigned_agent_id: userId,
        assigned_agent_name: user?.fullName || "Unknown",
        is_hidden: false,
        dataset_name: datasetName || null,
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
