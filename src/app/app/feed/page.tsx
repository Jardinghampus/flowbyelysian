"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Link2, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useListingShare } from "@/components/listings/listing-share-actions"

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
}

type MatchRow = {
  id: string
  score: number
  ai_summary: string
  reasons: string[]
  stock: { id: string; title: string; area_name: string; status: string; price: number; bedrooms: number | null } | null
  request: { id: string; title: string; area_name: string; price: number; bedrooms: number | null } | null
}

function formatPrice(price: number | null, tx: string) {
  if (price == null) return "—"
  const n = `AED ${Math.round(price).toLocaleString("en-AE")}`
  return tx === "rent" ? `${n}/yr` : n
}

function eventLabel(type: string) {
  switch (type) {
    case "listing_request":
      return "Request"
    case "listing_pocket":
      return "Pocket"
    case "listing_live":
      return "Live"
    default:
      return "Update"
  }
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
            New live, pocket, and requests — share links without exposing owner contacts.
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
          <div className="space-y-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{eventLabel(event.event_type)}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {event.transaction_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {event.actor_name} · {new Date(event.created_at).toLocaleString("en-AE")}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold leading-snug">{event.title || "Untitled"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.area_name || "—"}
                  {event.bedrooms != null ? ` · ${event.bedrooms === 0 ? "Studio" : `${event.bedrooms} BR`}` : ""}
                  {event.property_type ? ` · ${event.property_type}` : ""}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatPrice(event.price, event.transaction_type)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === event.listing_id}
                    onClick={() => void copyLink(event.listing_id)}
                  >
                    {busyId === event.listing_id ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-3.5 w-3.5" />
                    )}
                    Share link
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/app/inventory?highlight=${event.listing_id}`}>
                      Open <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
