import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { pdf } from "@react-pdf/renderer"
import { MonthlyReport, type MonthlyReportData } from "@/lib/pdf/monthly-report"
import { createClient } from "@supabase/supabase-js"
import React from "react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Mock data for demonstration - replace with actual Supabase queries
function getMockReportData(month: string, year: number): MonthlyReportData {
  return {
    month,
    year,
    companyName: "Elysian Real Estate",
    totalRevenue: 45750000,
    totalCommission: 1372500,
    totalDeals: 28,
    totalListings: 156,
    totalViewings: 342,
    avgConversionRate: 8.2,
    revenueChange: 12.5,
    dealsChange: 7.8,
    agents: [
      {
        name: "Ahmed Al Maktoum",
        role: "Senior Agent",
        deals: 8,
        revenue: 15200000,
        commission: 456000,
        listings: 24,
        viewings: 68,
        conversionRate: 11.8,
      },
      {
        name: "Sarah Johnson",
        role: "Agent",
        deals: 6,
        revenue: 9800000,
        commission: 294000,
        listings: 32,
        viewings: 72,
        conversionRate: 8.3,
      },
      {
        name: "Mohammed Rashid",
        role: "Agent",
        deals: 5,
        revenue: 8500000,
        commission: 255000,
        listings: 28,
        viewings: 58,
        conversionRate: 8.6,
      },
      {
        name: "Emma Williams",
        role: "Junior Agent",
        deals: 4,
        revenue: 6250000,
        commission: 187500,
        listings: 36,
        viewings: 82,
        conversionRate: 4.9,
      },
      {
        name: "Ali Hassan",
        role: "Agent",
        deals: 3,
        revenue: 4200000,
        commission: 126000,
        listings: 22,
        viewings: 42,
        conversionRate: 7.1,
      },
      {
        name: "Fatima Al Nahyan",
        role: "Junior Agent",
        deals: 2,
        revenue: 1800000,
        commission: 54000,
        listings: 14,
        viewings: 20,
        conversionRate: 10.0,
      },
    ],
    topPerformer: {
      name: "Ahmed Al Maktoum",
      deals: 8,
      revenue: 15200000,
    },
    insights: [
      "Palm Jumeirah continues to be the highest-performing area with 45% of total revenue",
      "Response time improvements have led to 15% higher conversion rates across the team",
      "Luxury segment (10M+ AED) showed 22% growth compared to the previous month",
      "Weekend viewings convert at 2x the rate of weekday viewings",
    ],
    areasForImprovement: [
      "Follow-up consistency: 23% of leads receive delayed responses (>2 hours)",
      "Documentation completion time averaging 4.2 days - target is 2 days",
      "Marina district market share has declined by 8% - requires focused attention",
      "Cross-selling opportunities: Only 12% of sales clients are offered rental options",
    ],
  }
}

// GET /api/reports/monthly - Generate monthly PDF report
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toLocaleDateString("en-US", { month: "long" })
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Get report data (using mock data for now)
    // In production, this would query Supabase for actual performance data
    const reportData = getMockReportData(month, year)

    // If Supabase is configured, fetch real data
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch agent performance data
        const { data: performanceData } = await (supabase as any)
          .from("agent_performance")
          .select("*")
          .order("deals_closed", { ascending: false })

        if (performanceData && performanceData.length > 0) {
          // Transform Supabase data to report format
          reportData.agents = performanceData.map((p: any) => ({
            name: p.agent_name || "Agent",
            role: "Agent",
            deals: p.deals_closed || 0,
            revenue: p.revenue || 0,
            commission: p.commission || 0,
            listings: p.listings || 0,
            viewings: p.viewings || 0,
            conversionRate: p.conversion_rate || 0,
          }))

          // Calculate totals
          reportData.totalDeals = reportData.agents.reduce((sum, a) => sum + a.deals, 0)
          reportData.totalRevenue = reportData.agents.reduce((sum, a) => sum + a.revenue, 0)
          reportData.totalCommission = reportData.agents.reduce((sum, a) => sum + a.commission, 0)
          reportData.totalListings = reportData.agents.reduce((sum, a) => sum + a.listings, 0)
          reportData.totalViewings = reportData.agents.reduce((sum, a) => sum + a.viewings, 0)

          // Set top performer
          if (reportData.agents.length > 0) {
            reportData.topPerformer = {
              name: reportData.agents[0].name,
              deals: reportData.agents[0].deals,
              revenue: reportData.agents[0].revenue,
            }
          }
        }
      } catch (dbError) {
        console.error("Error fetching data from Supabase:", dbError)
        // Continue with mock data
      }
    }

    // Generate PDF - use type assertion for react-pdf compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = pdf(React.createElement(MonthlyReport, { data: reportData }) as any)
    const pdfBlob = await pdfDoc.toBlob()
    const pdfBuffer = await pdfBlob.arrayBuffer()

    // Return PDF as downloadable file
    const filename = `flow-monthly-report-${month.toLowerCase()}-${year}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating monthly report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
