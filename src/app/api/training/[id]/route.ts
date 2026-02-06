import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/training/:id - Get single training module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data: module, error } = await supabase
      .from("training_modules")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json({ module })
  } catch (error) {
    console.error("Error fetching training module:", error)
    return NextResponse.json(
      { error: "Failed to fetch training module" },
      { status: 500 }
    )
  }
}

// PATCH /api/training/:id - Update training module (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: module, error } = await supabase
      .from("training_modules")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ module })
  } catch (error) {
    console.error("Error updating training module:", error)
    return NextResponse.json(
      { error: "Failed to update training module" },
      { status: 500 }
    )
  }
}

// DELETE /api/training/:id - Delete training module (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase
      .from("training_modules")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting training module:", error)
    return NextResponse.json(
      { error: "Failed to delete training module" },
      { status: 500 }
    )
  }
}
