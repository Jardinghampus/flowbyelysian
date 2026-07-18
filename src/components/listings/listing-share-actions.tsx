"use client"

import Link from "next/link"
import { useState } from "react"
import { FileDown, Link2, Loader2, MessageCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

async function createShare(listingId: string) {
  const res = await fetch(`/api/listings/${listingId}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresInDays: 30 }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Failed to create share link")
  return json as { url: string; pdfUrl: string; token: string }
}

export function useListingShare() {
  const [busyId, setBusyId] = useState<string | null>(null)

  const copyLink = async (listingId: string) => {
    setBusyId(listingId)
    try {
      const share = await createShare(listingId)
      await navigator.clipboard.writeText(share.url)
      toast.success("Flyer link copied")
      return share
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create link")
      return null
    } finally {
      setBusyId(null)
    }
  }

  const downloadPdf = async (listingId: string) => {
    setBusyId(listingId)
    try {
      const share = await createShare(listingId)
      window.open(share.pdfUrl, "_blank", "noopener,noreferrer")
      toast.success("Opening PDF flyer")
      return share
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create PDF")
      return null
    } finally {
      setBusyId(null)
    }
  }

  const shareWhatsApp = async (listingId: string, title: string) => {
    setBusyId(listingId)
    try {
      const share = await createShare(listingId)
      const text = `Zaylo listing flyer: ${title}\n${share.url}\nPDF: ${share.pdfUrl}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
      return share
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not share")
      return null
    } finally {
      setBusyId(null)
    }
  }

  return { busyId, copyLink, downloadPdf, shareWhatsApp }
}

export function ListingShareMenuItems({
  listingId,
  title,
}: {
  listingId: string
  title: string
}) {
  const { busyId, copyLink, downloadPdf, shareWhatsApp } = useListingShare()
  const busy = busyId === listingId

  return (
    <>
      <DropdownMenuItem asChild>
        <Link href={`/app/inventory/${listingId}/flyer`} onClick={(e) => e.stopPropagation()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Open flyer page
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation()
          void copyLink(listingId)
        }}
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
        Copy flyer link
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation()
          void downloadPdf(listingId)
        }}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Download PDF flyer
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation()
          void shareWhatsApp(listingId, title)
        }}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp flyer
      </DropdownMenuItem>
    </>
  )
}

export function ListingShareButtons({
  listingId,
  title,
}: {
  listingId: string
  title: string
}) {
  const { busyId, copyLink, downloadPdf, shareWhatsApp } = useListingShare()
  const busy = busyId === listingId

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="default" asChild>
        <Link href={`/app/inventory/${listingId}/flyer`}>
          <Sparkles className="mr-2 h-4 w-4" />
          Flyer
        </Link>
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => void copyLink(listingId)}
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
        Copy link
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => void downloadPdf(listingId)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => void shareWhatsApp(listingId, title)}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  )
}
