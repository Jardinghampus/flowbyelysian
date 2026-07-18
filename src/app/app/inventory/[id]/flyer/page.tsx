"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ListingFlyer } from "@/components/listings/listing-flyer"
import { toShareableListing, type ShareableListing } from "@/lib/listings/share"

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; listing: ShareableListing; pdfUrl: string; sharedBy: string }

export default function InventoryListingFlyerPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [state, setState] = useState<PageState>({ status: "loading" })

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const listingRes = await fetch(`/api/listings/${id}`)
        const listingJson = await listingRes.json()
        if (!listingRes.ok) throw new Error(listingJson.error || "Listing not found")

        const shareRes = await fetch(`/api/listings/${id}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresInDays: 30 }),
        })
        const shareJson = await shareRes.json()
        if (!shareRes.ok) throw new Error(shareJson.error || "Could not create flyer link")

        if (!cancelled) {
          setState({
            status: "ready",
            listing: toShareableListing(listingJson.listing),
            pdfUrl: shareJson.pdfUrl,
            sharedBy: listingJson.listing?.owner_name || "Agent",
          })
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Failed to load flyer",
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Flyer unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-3 -mt-3 md:-mx-5 md:-mt-4">
      <ListingFlyer
        listing={state.listing}
        sharedBy={state.sharedBy}
        pdfUrl={state.pdfUrl}
      />
    </div>
  )
}
