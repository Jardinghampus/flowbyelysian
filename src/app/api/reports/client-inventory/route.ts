import { NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { pdf } from "@react-pdf/renderer"
import {
  ClientInventoryReport,
  type ClientInventoryReportData,
  type ClientListingItem,
} from "@/lib/pdf/client-inventory-report"
import React from "react"

interface IncomingListing {
  title: string
  area: string
  type: string
  size: number
  price: number
  transactionType: string
  bedrooms?: number
  bathrooms?: number
  availability?: string
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const rawListings: IncomingListing[] = body.listings || []

    const listings: ClientListingItem[] = rawListings.map((l) => ({
      title: l.title,
      area: l.area,
      type: l.type,
      size: l.size,
      price: l.price,
      transactionType: l.transactionType,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      availability: l.availability,
    }))

    const reportData: ClientInventoryReportData = {
      listings,
      reportDate: new Date().toISOString(),
      filterSummary: body.filterSummary,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = pdf(React.createElement(ClientInventoryReport, { data: reportData }) as any)
    const pdfBlob = await pdfDoc.toBlob()
    const pdfBuffer = await pdfBlob.arrayBuffer()

    const filename = `available-properties-${new Date().toISOString().split("T")[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating client inventory report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
