"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ListingFlyer } from "@/components/listings/listing-flyer"
import type { ShareableListing } from "@/lib/listings/share"

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
      <div className="flex min-h-svh items-center justify-center bg-[#0c0c0d]">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0c0c0d] p-6 text-center text-white">
        <div>
          <h1 className="text-xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-white/60">{state.message}</p>
        </div>
      </div>
    )
  }

  return (
    <ListingFlyer
      listing={state.listing}
      sharedBy={state.sharedBy}
      note={state.note}
      pdfUrl={state.pdfUrl}
    />
  )
}
