import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireApiUser } from "@/lib/api/guards"

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { id } = await params
    const body = await request.json()
    const { title, status, priority, category, notes, due_date } = body

    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: task, error } = await (supabase as any)
      .from("tasks")
      .update({ title, status, priority, category, notes, due_date, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", guard.context.userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { id } = await params
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("owner_id", guard.context.userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
