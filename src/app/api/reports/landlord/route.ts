import { NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { pdf } from "@react-pdf/renderer"
import { LandlordReport, type LandlordReportData } from "@/lib/pdf/landlord-report"
import React from "react"

// POST /api/reports/landlord - Generate landlord report PDF
// Accepts report data in body (agent edits the data before generating)
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reportData: LandlordReportData = await request.json()

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = pdf(React.createElement(LandlordReport, { data: reportData }) as any)
    const pdfBlob = await pdfDoc.toBlob()
    const pdfBuffer = await pdfBlob.arrayBuffer()

    const sanitizedTitle = (reportData.propertyTitle || "property")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    const filename = `landlord-report-${sanitizedTitle}-${new Date().toISOString().split("T")[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating landlord report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
