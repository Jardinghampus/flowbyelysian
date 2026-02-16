import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// GET /api/smart/documents - List all documents with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    // Parse filter params
    const collectionId = searchParams.get("collection_id")
    const documentType = searchParams.get("document_type")
    const analysisStatus = searchParams.get("analysis_status")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("smart_documents")
      .select(`
        *,
        collection:smart_collections(*),
        analysis:smart_document_analysis(*)
      `, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (collectionId) query = query.eq("collection_id", collectionId)
    if (documentType) query = query.eq("document_type", documentType)
    if (analysisStatus) query = query.eq("analysis_status", analysisStatus)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,property_name.ilike.%${search}%,area_name.ilike.%${search}%`)
    }

    const { data: documents, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      documents: documents || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching smart documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

// POST /api/smart/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerClient()

    const documentData = {
      ...body,
      user_id: userId,
      analysis_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: document, error } = await (supabase as any)
      .from("smart_documents")
      .insert(documentData)
      .select()
      .single()

    if (error) throw error

    // Update collection document count if collection_id is provided
    if (body.collection_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("smart_collections")
        .update({
          document_count: (supabase as any).rpc('increment_count'),
          updated_at: new Date().toISOString()
        })
        .eq("id", body.collection_id)
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("Error creating smart document:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
