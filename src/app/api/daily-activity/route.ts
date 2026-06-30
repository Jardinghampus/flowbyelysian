import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET - Fetch daily activity logs (supports ?date=YYYY-MM-DD and ?agent_id=xxx)
export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const agentId = searchParams.get("agent_id")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = supabase
      .from("daily_activity_log")
      .select("*")
      .order("activity_date", { ascending: false })

    if (date) {
      query = query.eq("activity_date", date)
    }
    if (agentId) {
      query = query.eq("agent_id", agentId)
    }
    if (from) {
      query = query.gte("activity_date", from)
    }
    if (to) {
      query = query.lte("activity_date", to)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching daily activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch daily activity" },
      { status: 500 }
    )
  }
}

// POST - Create or update daily activity (upsert on agent_id + activity_date)
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { agent_id, activity_date, calls_wa, leads, viewings, notes } = body

    if (!agent_id) {
      return NextResponse.json(
        { error: "agent_id is required" },
        { status: 400 }
      )
    }

    const date = activity_date || new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_activity_log")
      .upsert(
        {
          agent_id,
          activity_date: date,
          calls_wa: calls_wa ?? 0,
          leads: leads ?? 0,
          viewings: viewings ?? 0,
          notes: notes ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "agent_id,activity_date" }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error saving daily activity:", error)
    return NextResponse.json(
      { error: "Failed to save daily activity" },
      { status: 500 }
    )
  }
}
