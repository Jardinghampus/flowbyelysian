import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/training - List all training modules
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("training_modules")
      .select("*")
      .order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data: modules, error } = await query

    if (error) throw error

    return NextResponse.json({ modules: modules || [] })
  } catch (error) {
    console.error("Error fetching training modules:", error)
    return NextResponse.json(
      { error: "Failed to fetch training modules" },
      { status: 500 }
    )
  }
}

// POST /api/training - Create new training module (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const supabase = createServerClient()

    const moduleData = {
      ...body,
      created_by: userId,
      documents: body.documents || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: module, error } = await (supabase as any)
      .from("training_modules")
      .insert(moduleData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ module }, { status: 201 })
  } catch (error) {
    console.error("Error creating training module:", error)
    return NextResponse.json(
      { error: "Failed to create training module" },
      { status: 500 }
    )
  }
}
