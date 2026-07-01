import { NextResponse } from "next/server"
import { getMarketStudioState } from "@/lib/zaylo/market-store"

export async function GET() {
  const state = await getMarketStudioState()

  return NextResponse.json({
    ...state,
    generatedAt: new Date().toISOString(),
    note: "Hosted CRM market studio. Draft data must be replaced by Firecrawl/Bayut/DXB/Supabase imports before external publishing.",
  })
}
