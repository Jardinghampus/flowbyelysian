import { NextRequest, NextResponse } from "next/server"
import React from "react"
import { pdf } from "@react-pdf/renderer"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { toShareableListing } from "@/lib/listings/share"
import { ListingSharePdf } from "@/lib/pdf/listing-share"

/** Public PDF download for a shared listing flyer. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const supabase = createUntypedServerClient()

    const { data: share } = await supabase
      .from("listing_shares")
      .select("*")
      .eq("token", token)
      .maybeSingle()

    if (!share || share.revoked_at) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 })
    }
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Share expired" }, { status: 410 })
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", share.listing_id)
      .maybeSingle()

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const shareable = toShareableListing(listing)
    // Only keep fetchable https images for PDF (broken URLs crash react-pdf)
    shareable.images = shareable.images.filter((src) => /^https?:\/\//i.test(src)).slice(0, 5)

    const sharedAt = new Date().toLocaleString("en-AE", {
      dateStyle: "medium",
      timeStyle: "short",
    })

    const makeDoc = (images: string[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdf(
        React.createElement(ListingSharePdf, {
          listing: { ...shareable, images },
          sharedBy: share.created_by_name || "Colleague",
          sharedAt,
          note: share.note || undefined,
        }) as any
      )

    let pdfBuffer: ArrayBuffer
    try {
      const pdfBlob = await makeDoc(shareable.images).toBlob()
      pdfBuffer = await pdfBlob.arrayBuffer()
    } catch (imageError) {
      console.warn("listing flyer pdf with images failed, retrying without images", imageError)
      const pdfBlob = await makeDoc([]).toBlob()
      pdfBuffer = await pdfBlob.arrayBuffer()
    }

    const filename = `zaylo-flyer-${shareable.title
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 40)}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("listing share pdf", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
