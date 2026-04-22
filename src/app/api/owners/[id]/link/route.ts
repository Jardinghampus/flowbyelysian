import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { linkListingToOwner, unlinkListing } from "@/app/app/data/_lib/supabase-queries"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: ownerId } = await params
    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    await linkListingToOwner(listingId, ownerId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error linking listing:", error)
    return NextResponse.json({ error: "Failed to link listing" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listingId")

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    await unlinkListing(listingId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unlinking listing:", error)
    return NextResponse.json({ error: "Failed to unlink listing" }, { status: 500 })
  }
}
