import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@/lib/demo-auth"
import { fetchOwners, createOwner } from "@/app/app/data/_lib/supabase-queries"
import { addOwnerSchema } from "@/app/app/data/_lib/schemas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const result = await fetchOwners({
      search: searchParams.get("search") || undefined,
      area: searchParams.get("area") || undefined,
      bedrooms: searchParams.get("bedrooms") || undefined,
      status: searchParams.get("status") || undefined,
      agent: searchParams.get("agent") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      limit: parseInt(searchParams.get("limit") || "100"),
      offset: parseInt(searchParams.get("offset") || "0"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching owners:", error)
    return NextResponse.json({ error: "Failed to fetch owners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()
    const parsed = addOwnerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { follow_up_days, ...ownerData } = parsed.data
    const follow_up_at = follow_up_days
      ? new Date(Date.now() + follow_up_days * 24 * 60 * 60 * 1000).toISOString()
      : null

    const owner = await createOwner({
      ...ownerData,
      user_id: userId,
      assigned_agent_id: ownerData.assigned_agent_id || userId,
      assigned_agent_name: ownerData.assigned_agent_name || user?.fullName || "Unknown",
      follow_up_at,
      unit_number: ownerData.unit_number || null,
      bedrooms: ownerData.bedrooms || null,
      notes: ownerData.notes || null,
    } as never)

    return NextResponse.json({ owner }, { status: 201 })
  } catch (error) {
    console.error("Error creating owner:", error)
    return NextResponse.json({ error: "Failed to create owner" }, { status: 500 })
  }
}
