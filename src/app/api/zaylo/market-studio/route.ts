import { NextResponse } from "next/server"
import { marketMetrics, socialDrafts } from "@/lib/zaylo/market-studio"

export async function GET() {
  return NextResponse.json({
    metrics: marketMetrics,
    drafts: socialDrafts,
    generatedAt: new Date().toISOString(),
    note: "Hosted CRM market studio. Draft data must be replaced by Firecrawl/Bayut/DXB/Supabase imports before external publishing.",
  })
}
