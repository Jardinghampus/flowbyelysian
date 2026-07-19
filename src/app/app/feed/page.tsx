"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Bath,
  BedDouble,
  Building2,
  ExternalLink,
  Link2,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useListingShare } from "@/components/listings/listing-share-actions"
import { cn } from "@/lib/utils"

type FeedListingMeta = {
  bathrooms?: number | null
  size?: number | null
  notes?: string | null
  owner_name?: string | null
  sub_area?: string | null
  availability?: string | null
}

type FeedEvent = {
  id: string
  event_type: string
  listing_id: string
  actor_name: string
  title: string
  area_name: string
  status: string
  inquiry_type: string
  transaction_type: string
  price: number | null
  bedrooms: number | null
  property_type: string
  created_at: string
  listings?: FeedListingMeta | FeedListingMeta[] | null
}

type MatchRow = {
  id: string
  score: number
  ai_summary: string
  reasons: string[]
  stock: { id: string; title: string; area_name: string; status: string; price: number; bedrooms: number | null } | null
  request: { id: string; title: string; area_name: string; price: number; bedrooms: number | null } | null
}

function listingMeta(event: FeedEvent): FeedListingMeta | null {
  const raw = event.listings
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] ?? null : raw
}

function formatPrice(price: number | null, tx: string) {
  if (price == null) return "—"
  const n = `AED ${Math.round(price).toLocaleString("en-AE")}`
  return tx === "rent" ? `${n}/year` : n
}

function eventHeadline(type: string) {
  switch (type) {
    case "listing_live":
      return "New Live Listing"
    case "listing_request":
      return "New Request"
    case "listing_pocket":
      return "Pocket Listing"
    default:
      return "Listing Update"
  }
}

function eventBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "listing_live") return "default"
  if (type === "listing_pocket") return "secondary"
  return "outline"
}

function cleanNotes(notes?: string | null) {
  if (!notes) return null
  return notes.replace(/\s*·\s*seed:[^\s·]+/gi, "").trim()
}

function FeedEventCard({
  event,
  busyId,
  onShare,
}: {
  event: FeedEvent
  busyId: string | null
  onShare: (id: string) => void
}) {
  const meta = listingMeta(event)
  const isLive = event.event_type === "listing_live"
  const agency = cleanNotes(meta?.notes)

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        isLive && "border-emerald-500/30 ring-1 ring-emerald-500/10"
      )}
    >
      {isLive ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
          {eventHeadline(event.event_type)}
        </div>
      ) : null}

      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {!isLive ? (
            <Badge variant={eventBadgeVariant(event.event_type)}>{eventHeadline(event.event_type)}</Badge>
          ) : null}
          <Badge variant="outline" className="capitalize">
            {event.transaction_type}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {event.property_type || "property"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(event.created_at).toLocaleString("en-AE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {event.title || "Untitled listing"}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.area_name}
            {meta?.sub_area ? ` · ${meta.sub_area}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            Owner {meta?.owner_name || event.actor_name}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Price</p>
            <p className="mt-0.5 text-sm font-semibold">{formatPrice(event.price, event.transaction_type)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Beds</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold">
              <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
              {event.bedrooms == null ? "—" : event.bedrooms === 0 ? "Studio" : event.bedrooms}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Baths</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold">
              <Bath className="h-3.5 w-3.5 text-muted-foreground" />
              {meta?.bathrooms ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Size</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              {meta?.size ? `${meta.size.toLocaleString()} sqft` : "—"}
            </p>
          </div>
        </div>

        {meta?.availability || agency ? (
          <div className="mt-3 space-y-1 rounded-xl border border-dashed bg-muted/20 px-3 py-2 text-sm">
            {meta?.availability ? (
              <p>
                <span className="font-medium text-foreground">Availability:</span> {meta.availability}
              </p>
            ) : null}
            {agency ? (
              <p className="text-muted-foreground line-clamp-2">{agency}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busyId === event.listing_id}
            onClick={() => onShare(event.listing_id)}
          >
            {busyId === event.listing_id ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Link2 className="mr-2 h-3.5 w-3.5" />
            )}
            Share link
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`/app/inventory?highlight=${event.listing_id}`}>
              View listing <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function TeamFeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const { copyLink, busyId } = useListingShare()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [feedRes, matchRes] = await Promise.all([
        fetch("/api/feed?limit=60"),
        fetch("/api/matches"),
      ])
      const feedJson = await feedRes.json()
      const matchJson = await matchRes.json()
      setEvents(feedJson.events || [])
      setMatches(matchJson.matches || [])
    } catch {
      toast.error("Could not load feed")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team Feed</h1>
          <p className="text-sm text-muted-foreground">
            New live listings, pocket stock, and requests — with owner-safe sharing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {matches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              AI matches (09 / 13 / 18 Dubai)
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {matches.slice(0, 8).map((m) => (
              <div key={m.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{Math.round(Number(m.score))}% match</Badge>
                </div>
                <p className="mt-2 text-sm font-medium line-clamp-2">{m.ai_summary || m.reasons?.join(" · ")}</p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Stock:</span> {m.stock?.title} ·{" "}
                    {m.stock?.area_name}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Request:</span> {m.request?.title} ·{" "}
                    {m.request?.area_name}
                  </p>
                </div>
                {m.stock?.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={busyId === m.stock.id}
                    onClick={() => void copyLink(m.stock!.id)}
                  >
                    {busyId === m.stock.id ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-3.5 w-3.5" />
                    )}
                    Share stock link
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity</h2>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
            Feed is empty. New live / pocket / requests appear here automatically.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {events.map((event) => (
              <FeedEventCard
                key={event.id}
                event={event}
                busyId={busyId}
                onShare={(id) => void copyLink(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
