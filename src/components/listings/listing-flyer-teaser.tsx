"use client"

import { cn } from "@/lib/utils"

type ListingFlyerTeaserProps = {
  images: string[]
  title: string
  className?: string
}

function FlyerImageCard({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  )
}

function PlaceholderCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/15 bg-white/[0.03]",
        className
      )}
    />
  )
}

/** 5-image teaser: 1 full-width header + 2×2 equal cards below. */
export function ListingFlyerTeaser({ images, title, className }: ListingFlyerTeaserProps) {
  const slots = Array.from({ length: 5 }, (_, i) => images[i] || null)
  const [header, ...grid] = slots

  return (
    <div className={cn("space-y-3", className)}>
      {header ? (
        <FlyerImageCard
          src={header}
          alt={`${title} — hero`}
          className="aspect-[16/9] w-full sm:aspect-[21/9]"
        />
      ) : (
        <PlaceholderCard className="aspect-[16/9] w-full sm:aspect-[21/9]" />
      )}

      <div className="grid grid-cols-2 gap-3">
        {grid.map((src, index) =>
          src ? (
            <FlyerImageCard
              key={src}
              src={src}
              alt={`${title} — photo ${index + 2}`}
              className="aspect-[4/3] w-full"
            />
          ) : (
            <PlaceholderCard key={`placeholder-${index}`} className="aspect-[4/3] w-full" />
          )
        )}
      </div>
    </div>
  )
}
