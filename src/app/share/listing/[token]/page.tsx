"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Building2, Download, ExternalLink, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatListingPrice, type ShareableListing } from "@/lib/listings/share"

type ReadyState = {
  status: "ready"
  listing: ShareableListing
  sharedBy: string
  note: string
  pdfUrl: string
}

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ReadyState

export default function ListingSharePage() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const [state, setState] = useState<PageState>({ status: "loading" })

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/listing-share/${token}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to load share")
        if (!cancelled) {
          setState({
            status: "ready",
            listing: json.listing,
            sharedBy: json.sharedBy,
            note: json.note || "",
            pdfUrl: json.pdfUrl,
          })
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Failed to load",
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    )
  }

  const { listing, sharedBy, note, pdfUrl } = state

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Colleague listing preview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {[listing.area, listing.subArea].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {listing.transactionType}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {listing.type}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {listing.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-semibold">
              {formatListingPrice(listing.price, listing.transactionType)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Size</p>
            <p className="font-semibold">
              {listing.size != null ? `${listing.size.toLocaleString()} sqft` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Beds / Baths</p>
            <p className="font-semibold">
              {listing.bedrooms ?? "—"} / {listing.bathrooms ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Agent</p>
            <p className="font-semibold">{listing.agentName}</p>
          </div>
        </div>

        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="aspect-video w-full rounded-lg object-cover"
          />
        ) : null}

        {note ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Note from {sharedBy}
            </p>
            <p>{note}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Shared by {sharedBy}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={pdfUrl}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          {listing.propertyFinderUrl ? (
            <Button variant="outline" asChild>
              <a href={listing.propertyFinderUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Property Finder
              </a>
            </Button>
          ) : null}
          {listing.googleMapsUrl ? (
            <Button variant="outline" asChild>
              <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-2 h-4 w-4" />
                Maps
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
