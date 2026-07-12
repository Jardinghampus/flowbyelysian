import { NextResponse } from "next/server"
import { getMarketStudioState } from "@/lib/zaylo/market-store"
import { requireSocialAccess } from "@/lib/api/guards"

export async function GET() {
  const guard = await requireSocialAccess()
  if (!guard.ok) return guard.response

  const state = await getMarketStudioState()

  return NextResponse.json({
    ...state,
    generatedAt: new Date().toISOString(),
    note: "Hosted CRM market studio. Draft data must be replaced by Firecrawl/Bayut/DXB/Supabase imports before external publishing.",
  })
}
