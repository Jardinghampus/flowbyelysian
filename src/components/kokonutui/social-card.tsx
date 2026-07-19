"use client"

import type { Ref } from "react"
import { VerifiedIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEAM_COLOR } from "@/lib/brand"
import {
  SOCIAL_EXPORT_HEIGHT,
  SOCIAL_EXPORT_WIDTH,
  formatAedCompact,
  type BuiltSocialPost,
} from "@/lib/zaylo/social-focus"

type AgentBits = {
  fullName: string
  phone: string
  profileImageUrl?: string | null
  jobTitle?: string
  company?: string
  website?: string
}

type SocialCardProps = {
  post: BuiltSocialPost
  agent: AgentBits
  className?: string
  cardRef?: Ref<HTMLDivElement>
}

/**
 * Instagram portrait card — fixed 1080×1350 (export-ready).
 * Preview at 50% via parent wrapper; download uses native pixels.
 */
export function SocialCard({ post, agent, className, cardRef }: SocialCardProps) {
  const isWeekly = post.concept === "weekly_transactions"
  const rent = formatAedCompact(post.metrics.rentAvg ?? post.metrics.rentMedian)
  const sale = formatAedCompact(post.metrics.saleAvg ?? post.metrics.saleMedian)
  const place = post.metrics.subArea
    ? `${post.metrics.subArea} · ${post.communityLabel}`
    : post.communityLabel
  const highlights = post.highlights || []

  return (
    <div
      ref={cardRef}
      className={cn("relative isolate overflow-hidden text-white", className)}
      style={{
        width: SOCIAL_EXPORT_WIDTH,
        height: SOCIAL_EXPORT_HEIGHT,
        background: "#050505",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 18% 0%, ${TEAM_COLOR}cc 0%, #0a0a0b 42%, #050505 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_42%)] opacity-40" />

      <div
        className="relative flex h-full flex-col border border-white/10 bg-white/[0.03] backdrop-blur-md"
        style={{ margin: 28, borderRadius: 36, padding: 48 }}
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/10 ring-[3px] ring-white/20">
            {agent.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.profileImageUrl} alt={agent.fullName} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xl font-bold"
                style={{ backgroundColor: TEAM_COLOR }}
              >
                {agent.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-2xl font-semibold tracking-tight">{agent.fullName}</p>
              <VerifiedIcon className="h-6 w-6 shrink-0 text-sky-400" fill="currentColor" />
            </div>
            <p className="truncate text-base text-white/60">
              {agent.jobTitle || "Villa & Townhouse Specialist"}
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            Zaylo
          </span>
        </div>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.28em] text-sky-300/90">
          {post.scheduleLabel}
        </p>
        <h2 className="mt-3 text-[52px] font-black leading-[1.05] tracking-tight">{post.headline}</h2>
        <p className="mt-4 text-xl leading-relaxed text-white/70">{post.hook}</p>

        {isWeekly ? (
          <div className="mt-10 flex flex-1 flex-col gap-4">
            {highlights.slice(0, 5).map((h, i) => (
              <div
                key={`${h.place}-${i}`}
                className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.06] px-5 py-4"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
                  style={{ backgroundColor: TEAM_COLOR }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold tracking-tight">{h.place}</p>
                  <p className="mt-0.5 text-sm text-white/50">
                    {h.bedsLabel} {h.propertyType} · {h.dealType === "sale" ? "Sale" : "Rent"}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-black tracking-tight">{h.priceLabel}</p>
              </div>
            ))}
            {highlights.length < 5 ? (
              <p className="text-center text-sm text-amber-200/80">
                Needs more TX data — run transaction scrape
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-5">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                  Rent avg
                </p>
                <p className="mt-3 text-4xl font-black tracking-tight">{rent}</p>
                <p className="mt-2 text-sm text-white/45">{post.rentLabel}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300/90">
                  Sale avg
                </p>
                <p className="mt-3 text-4xl font-black tracking-tight">{sale}</p>
                <p className="mt-2 text-sm text-white/45">{post.saleLabel}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-dashed border-white/15 bg-black/20 px-6 py-5">
              <p className="text-base font-medium text-white/80">{place}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{post.trustLine}</p>
            </div>
          </>
        )}

        <div className="mt-auto pt-8">
          <div
            className="rounded-full px-6 py-5 text-center text-xl font-bold text-white"
            style={{ backgroundColor: TEAM_COLOR }}
          >
            {agent.phone ? `${agent.fullName} · ${agent.phone}` : `DM "Market"`}
          </div>
          <p className="mt-4 text-center text-sm text-white/40">
            {agent.company || "Derrick Signature Properties LLC"} ·{" "}
            {agent.website || "derricksignatureproperties.ae"}
          </p>
        </div>
      </div>
    </div>
  )
}
