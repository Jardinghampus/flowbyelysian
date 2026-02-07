import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/contacts - List all contacts
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get("role")
    const areaId = searchParams.get("areaId")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("contacts")
      .select(`
        *,
        areas (name, slug)
      `)
      .order("name")

    if (role) query = query.eq("role", role)
    if (areaId) query = query.eq("area_id", areaId)

    const { data: contacts, error } = await query

    if (error) throw error

    return NextResponse.json({ contacts: contacts || [] })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: contact, error } = await (supabase as any)
      .from("contacts")
      .insert({
        ...body,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
