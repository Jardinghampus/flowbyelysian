import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { fetchOwnerById, updateOwner, deleteOwner, fetchOutreachLogs } from "@/app/app/data/_lib/supabase-queries"
import { updateOwnerSchema } from "@/app/app/data/_lib/schemas"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const owner = await fetchOwnerById(id)
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 })
    }

    const logs = await fetchOutreachLogs(id)
    return NextResponse.json({ owner, logs })
  } catch (error) {
    console.error("Error fetching owner:", error)
    return NextResponse.json({ error: "Failed to fetch owner" }, { status: 500 })
  }
}

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
    const parsed = updateOwnerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const owner = await updateOwner(id, parsed.data as never)
    return NextResponse.json({ owner })
  } catch (error) {
    console.error("Error updating owner:", error)
    return NextResponse.json({ error: "Failed to update owner" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await deleteOwner(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting owner:", error)
    return NextResponse.json({ error: "Failed to delete owner" }, { status: 500 })
  }
}
