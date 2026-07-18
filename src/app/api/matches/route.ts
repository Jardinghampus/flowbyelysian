import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { sanitizeListingForViewer } from "@/lib/listings/privacy"

export async function GET() {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()
  const { data, error } = await supabase
    .from("listing_matches")
    .select(
      `
      id, score, reasons, ai_summary, model, run_at,
      stock:stock_listing_id ( id, title, area_name, type, status, inquiry_type, transaction_type, price, bedrooms, size, owner_id, owner_name ),
      request:request_listing_id ( id, title, area_name, type, status, inquiry_type, transaction_type, price, bedrooms, size, owner_id, owner_name )
    `
    )
    .order("score", { ascending: false })
    .limit(40)

  if (error) {
    return NextResponse.json({ error: error.message, matches: [] }, { status: 500 })
  }

  const matches = (data || []).map((row: Record<string, unknown>) => {
    const stock = row.stock as Record<string, unknown> | null
    const request = row.request as Record<string, unknown> | null
    return {
      id: row.id,
      score: row.score,
      reasons: row.reasons,
      ai_summary: row.ai_summary,
      model: row.model,
      run_at: row.run_at,
      stock: stock
        ? sanitizeListingForViewer(stock, guard.context.userId, { isAdmin: guard.context.role === "admin" })
        : null,
      request: request
        ? sanitizeListingForViewer(request, guard.context.userId, {
            isAdmin: guard.context.role === "admin",
          })
        : null,
    }
  })

  return NextResponse.json({ matches })
}
