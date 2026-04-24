import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phones } = (await request.json()) as { phones: string[] }
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ duplicates: {} })
    }

    const normalized = [...new Set(phones.filter(Boolean))]

    const supabase = createServerClient()
    const { data, error } = await (supabase as ReturnType<typeof createServerClient>)
      .from("owners")
      .select("id, name, phone, area, status")
      .in("phone", normalized)

    if (error) {
      console.error("Duplicate check error:", error)
      return NextResponse.json({ duplicates: {} })
    }

    const rows = (data || []) as Array<{ id: string; name: string; phone: string; area: string; status: string }>
    const duplicates: Record<string, { id: string; name: string; area: string; status: string }> = {}
    for (const owner of rows) {
      duplicates[owner.phone] = {
        id: owner.id,
        name: owner.name,
        area: owner.area,
        status: owner.status,
      }
    }

    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error("Error checking duplicates:", error)
    return NextResponse.json({ duplicates: {} })
  }
}
