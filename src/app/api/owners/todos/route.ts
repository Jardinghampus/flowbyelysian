import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { fetchTodoOwners } from "@/app/app/data/_lib/supabase-queries"

export async function GET() {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const todos = await fetchTodoOwners()
    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
  }
}
