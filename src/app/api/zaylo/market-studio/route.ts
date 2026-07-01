import { NextResponse } from "next/server"
import { zayloAreaCatalog, zayloSourceLinks } from "@/lib/zaylo/market-catalog"
import { marketMetrics, socialDrafts } from "@/lib/zaylo/market-studio"

export async function GET() {
  return NextResponse.json({
    areas: zayloAreaCatalog,
    sourceLinks: zayloSourceLinks,
    metrics: marketMetrics,
    drafts: socialDrafts,
    generatedAt: new Date().toISOString(),
    note: "Hosted CRM market studio. Draft data must be replaced by Firecrawl/Bayut/DXB/Supabase imports before external publishing.",
  })
}
