import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// GET /api/smart/documents/[id] - Get single document
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
    const { data: document, error } = await (supabase as any)
      .from("smart_documents")
      .select(`
        *,
        collection:smart_collections(*),
        analysis:smart_document_analysis(*)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error("Error fetching smart document:", error)
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}

// PATCH /api/smart/documents/[id] - Update document
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
    const { data: document, error } = await (supabase as any)
      .from("smart_documents")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ document })
  } catch (error) {
    console.error("Error updating smart document:", error)
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
}

// DELETE /api/smart/documents/[id] - Delete document
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

    // Get document first to update collection count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingDoc } = await (supabase as any)
      .from("smart_documents")
      .select("collection_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("smart_documents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) throw error

    // Update collection document count
    if (existingDoc?.collection_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("smart_collections")
        .update({
          document_count: (supabase as any).rpc('decrement_count'),
          updated_at: new Date().toISOString()
        })
        .eq("id", existingDoc.collection_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting smart document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
