import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth, currentUser } from "@/lib/demo-auth"

// NOTE: Requires a "tasks" table in Supabase.
// Run this migration to enable sync:
//
// create table if not exists tasks (
//   id          uuid primary key default gen_random_uuid(),
//   owner_id    text not null,
//   title       text not null,
//   status      text not null default 'todo',
//   priority    text not null default 'medium',
//   category    text not null default 'general',
//   notes       text,
//   due_date    date,
//   created_at  timestamptz default now(),
//   updated_at  timestamptz default now()
// );
// alter table tasks enable row level security;
// create policy "users manage own tasks" on tasks
//   using (owner_id = requesting_user_id())
//   with check (owner_id = requesting_user_id());

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const status   = searchParams.get("status")
    const priority = searchParams.get("priority")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (userId)  query = query.eq("owner_id", userId)
    if (status)  query = query.eq("status", status)
    if (priority) query = query.eq("priority", priority)

    const { data: tasks, error } = await query
    if (error) throw error

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await request.json()
    const { title, status = "todo", priority = "medium", category = "general", notes, due_date } = body

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: task, error } = await (supabase as any)
      .from("tasks")
      .insert({ owner_id: userId ?? "demo", title, status, priority, category, notes, due_date })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
