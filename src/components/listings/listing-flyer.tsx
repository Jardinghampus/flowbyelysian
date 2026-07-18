"use client"

import { Download, ExternalLink, MapPin, BedDouble, Bath, Maximize2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatListingPrice, type ShareableListing } from "@/lib/listings/share"
import { cn } from "@/lib/utils"

type ListingFlyerProps = {
  listing: ShareableListing
  sharedBy?: string
  note?: string
  pdfUrl: string
  className?: string
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-white/55">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-white">{value}</p>
    </div>
  )
}

export function ListingFlyer({ listing, sharedBy, note, pdfUrl, className }: ListingFlyerProps) {
  const hero = listing.images[0] || null
  const gallery = listing.images.slice(1, 5)
  const location = [listing.area, listing.subArea].filter(Boolean).join(" · ") || "Dubai"
  const beds =
    listing.bedrooms === 0 ? "Studio" : listing.bedrooms != null ? String(listing.bedrooms) : "—"
  const baths = listing.bathrooms != null ? String(listing.bathrooms) : "—"
  const size = listing.size != null ? `${listing.size.toLocaleString("en-AE")} sqft` : "—"

  return (
    <div className={cn("min-h-svh bg-[#0c0c0d] text-white", className)}>
      {/* Hero */}
      <section className="relative min-h-[58vh] w-full overflow-hidden">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt={listing.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/55 to-black/30" />

        <div className="relative z-10 mx-auto flex h-full min-h-[58vh] w-full max-w-5xl flex-col justify-between px-5 pb-10 pt-6 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Zaylo</p>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-white text-neutral-950 hover:bg-neutral-200"
            >
              <a href={pdfUrl}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF flyer
              </a>
            </Button>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border-0 bg-white/15 capitalize text-white backdrop-blur">
                {listing.transactionType}
              </Badge>
              <Badge className="rounded-full border-0 bg-white/15 capitalize text-white backdrop-blur">
                {listing.type}
              </Badge>
              <Badge className="rounded-full border-0 bg-white/15 capitalize text-white backdrop-blur">
                {listing.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {listing.title}
            </h1>
            <p className="flex items-center gap-2 text-sm text-white/75 sm:text-base">
              <MapPin className="h-4 w-4 shrink-0" />
              {location}
            </p>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatListingPrice(listing.price, listing.transactionType)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Spec icon={<BedDouble className="h-3.5 w-3.5" />} label="Bedrooms" value={beds} />
          <Spec icon={<Bath className="h-3.5 w-3.5" />} label="Bathrooms" value={baths} />
          <Spec icon={<Maximize2 className="h-3.5 w-3.5" />} label="Built-up" value={size} />
          <Spec
            icon={<User className="h-3.5 w-3.5" />}
            label="Listing agent"
            value={listing.agentName || "Agent"}
          />
        </div>

        {listing.availability ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
              Availability
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{listing.availability}</p>
          </div>
        ) : null}

        {gallery.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">Gallery</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-5 sm:p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
            Presented by
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{listing.agentName}</p>
          <p className="mt-1 text-sm text-white/60">
            {sharedBy ? `Shared via Zaylo by ${sharedBy}` : "Zaylo listing flyer"}
          </p>
          {note ? <p className="mt-4 text-sm leading-relaxed text-white/80">{note}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2 pb-8">
          <Button asChild className="rounded-full bg-white text-neutral-950 hover:bg-neutral-200">
            <a href={pdfUrl}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF flyer
            </a>
          </Button>
          {listing.propertyFinderUrl ? (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <a href={listing.propertyFinderUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Portal link
              </a>
            </Button>
          ) : null}
          {listing.googleMapsUrl ? (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-2 h-4 w-4" />
                Location
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  )
}
