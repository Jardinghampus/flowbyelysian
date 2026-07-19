"use client"

import type { Ref } from "react"
import { VerifiedIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEAM_COLOR } from "@/lib/brand"
import { formatAedCompact, type BuiltSocialPost } from "@/lib/zaylo/social-focus"

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
 * Instagram-ready market social card (KokonutUI-inspired).
 * Note: kokonutd/social-card is not in the public Kokonut registry — this is the Zaylo market variant.
 */
export function SocialCard({ post, agent, className, cardRef }: SocialCardProps) {
  const rent = formatAedCompact(post.metrics.rentAvg ?? post.metrics.rentMedian)
  const sale = formatAedCompact(post.metrics.saleAvg ?? post.metrics.saleMedian)
  const place = post.metrics.subArea
    ? `${post.metrics.subArea} · ${post.communityLabel}`
    : post.communityLabel

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative isolate w-[540px] overflow-hidden rounded-[28px] p-2",
        "bg-neutral-950 text-white",
        "shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
        className
      )}
      style={{ aspectRatio: "4 / 5" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, ${TEAM_COLOR}cc 0%, #0a0a0b 45%, #050505 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_40%)] opacity-40" />

      <div className="relative flex h-full flex-col rounded-[22px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/20">
            {agent.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.profileImageUrl} alt={agent.fullName} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-sm font-bold"
                style={{ backgroundColor: TEAM_COLOR }}
              >
                {agent.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold tracking-tight">{agent.fullName}</p>
              <VerifiedIcon className="h-4 w-4 shrink-0 text-sky-400" fill="currentColor" />
            </div>
            <p className="truncate text-xs text-white/60">
              {agent.jobTitle || "Villa & Townhouse Specialist"}
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            Zaylo
          </span>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/90">
          {post.scheduleLabel}
        </p>
        <h2 className="mt-2 text-[28px] font-black leading-[1.1] tracking-tight">{post.headline}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{post.hook}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90">Rent avg</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{rent}</p>
            <p className="mt-1 text-[11px] text-white/45">{post.rentLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/90">Sale avg</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{sale}</p>
            <p className="mt-1 text-[11px] text-white/45">{post.saleLabel}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3">
          <p className="text-xs font-medium text-white/80">{place}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/50">{post.trustLine}</p>
        </div>

        <div className="mt-auto pt-6">
          <div
            className="rounded-full px-4 py-3 text-center text-sm font-bold text-white"
            style={{ backgroundColor: TEAM_COLOR }}
          >
            {agent.phone ? `${agent.fullName} · ${agent.phone}` : `DM "${post.communityLabel}"`}
          </div>
          <p className="mt-3 text-center text-[10px] text-white/40">
            {agent.company || "Derrick Signature Properties LLC"} ·{" "}
            {agent.website || "derricksignatureproperties.ae"}
          </p>
        </div>
      </div>
    </div>
  )
}
