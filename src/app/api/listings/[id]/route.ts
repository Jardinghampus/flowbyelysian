import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET /api/listings/:id - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/:id - Update listing (owner or admin only)
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

    // Check if user owns the listing or is admin
    const { data: existing } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Check admin status from Clerk metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === "admin"

    if (existing.owner_id !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/:id - Delete listing (owner or admin only)
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

    // Check ownership
    const { data: existing } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Check admin status
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === "admin"

    if (existing.owner_id !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("listings").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    )
  }
}
