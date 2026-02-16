import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// GET /api/smart/collections - List all collections
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: collections, error } = await (supabase as any)
      .from("smart_collections")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ collections: collections || [] })
  } catch (error) {
    console.error("Error fetching smart collections:", error)
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    )
  }
}

// POST /api/smart/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerClient()

    const collectionData = {
      user_id: userId,
      name: body.name,
      description: body.description || null,
      color: body.color || '#6366f1',
      icon: body.icon || 'folder',
      is_default: false,
      document_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: collection, error } = await (supabase as any)
      .from("smart_collections")
      .insert(collectionData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collection }, { status: 201 })
  } catch (error) {
    console.error("Error creating smart collection:", error)
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    )
  }
}
