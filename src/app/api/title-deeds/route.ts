import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clerk_user_id, owner_name, owner_email, owner_phone, area, property_type, unit_number, file_url, file_name, file_size, file_type } = body

    if (!clerk_user_id || !owner_name || !owner_email || !file_url || !file_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("title_deeds")
      .insert({
        clerk_user_id,
        owner_name,
        owner_email,
        owner_phone: owner_phone || null,
        area: area || null,
        property_type: property_type || null,
        unit_number: unit_number || null,
        file_url,
        file_name,
        file_size: file_size || null,
        file_type: file_type || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Title deed insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("Title deed API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("user_id")
    const status = searchParams.get("status")

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any).from("title_deeds").select("*").order("created_at", { ascending: false })

    if (userId) query = query.eq("clerk_user_id", userId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("Title deed GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
