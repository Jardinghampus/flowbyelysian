import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// GET /api/smart/collections/[id] - Get single collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: collection, error } = await (supabase as any)
      .from("smart_collections")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("Error fetching smart collection:", error)
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    )
  }
}

// PATCH /api/smart/collections/[id] - Update collection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: collection, error } = await (supabase as any)
      .from("smart_collections")
      .update({
        name: body.name,
        description: body.description,
        color: body.color,
        icon: body.icon,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("is_default", false) // Can't edit default collection
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("Error updating smart collection:", error)
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    )
  }
}

// DELETE /api/smart/collections/[id] - Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient()

    // Don't allow deleting default collection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: collection } = await (supabase as any)
      .from("smart_collections")
      .select("is_default")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (collection?.is_default) {
      return NextResponse.json(
        { error: "Cannot delete default collection" },
        { status: 400 }
      )
    }

    // Move documents to default collection (set collection_id to null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("smart_documents")
      .update({ collection_id: null })
      .eq("collection_id", id)
      .eq("user_id", userId)

    // Delete the collection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("smart_collections")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .eq("is_default", false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting smart collection:", error)
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    )
  }
}
