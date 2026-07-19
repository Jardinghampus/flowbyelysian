"use client"

import type { Ref } from "react"
import { cn } from "@/lib/utils"
import { TEAM_COLOR } from "@/lib/brand"
import {
  CATEGORY_LOCK,
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

export type SocialCardTheme = "instagram" | "linkedin"

type SocialCardProps = {
  post: BuiltSocialPost
  agent: AgentBits
  theme?: SocialCardTheme
  className?: string
  cardRef?: Ref<HTMLDivElement>
}

/**
 * Instagram (dark) + LinkedIn (light authority) 1080×1350 cards.
 */
export function SocialCard({
  post,
  agent,
  theme = "instagram",
  className,
  cardRef,
}: SocialCardProps) {
  const isLi = theme === "linkedin"
  const isWeekly = post.concept === "weekly_transactions"
  const rent = formatAedCompact(post.metrics.rentAvg ?? post.metrics.rentMedian)
  const sale = formatAedCompact(post.metrics.saleAvg ?? post.metrics.saleMedian)
  const rentMed = formatAedCompact(post.metrics.rentMedian)
  const saleMed = formatAedCompact(post.metrics.saleMedian)
  const ppsVal = post.metrics.salePricePerSqft ?? post.metrics.avgPricePerSqft
  const pps = ppsVal ? `AED ${Math.round(ppsVal).toLocaleString("en-AE")}` : null
  const place = post.metrics.subArea
    ? `${post.metrics.subArea} · ${post.communityLabel}`
    : post.communityLabel
  const highlights = post.highlights || []

  return (
    <div
      ref={cardRef}
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        width: SOCIAL_EXPORT_WIDTH,
        height: SOCIAL_EXPORT_HEIGHT,
        background: isLi ? "#f7f5f0" : "#050505",
        color: isLi ? "#0f172a" : "#ffffff",
      }}
    >
      {!isLi ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 18% 0%, ${TEAM_COLOR}cc 0%, #0a0a0b 42%, #050505 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_42%)] opacity-40" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #ffffff 0%, #f7f5f0 55%, #eef2f7 100%)`,
          }}
        />
      )}

      <div
        className={cn(
          "relative flex h-full flex-col backdrop-blur-md",
          isLi ? "border border-slate-200/80 bg-white/70" : "border border-white/10 bg-white/[0.03]"
        )}
        style={{ margin: 28, borderRadius: 36, padding: 48 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-20 w-20 shrink-0 overflow-hidden rounded-full",
              isLi ? "bg-slate-100 ring-[3px] ring-slate-200" : "bg-white/10 ring-[3px] ring-white/20"
            )}
          >
            {agent.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.profileImageUrl} alt={agent.fullName} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: TEAM_COLOR }}
              >
                {agent.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-2xl font-semibold tracking-tight", isLi && "text-slate-900")}>
              {agent.fullName}
            </p>
            <p className={cn("truncate text-base", isLi ? "text-slate-500" : "text-white/60")}>
              {agent.jobTitle || "Villa & Townhouse Specialist"}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider",
              isLi
                ? "border border-slate-200 bg-slate-50 text-slate-600"
                : "border border-white/15 bg-white/5 text-white/70"
            )}
          >
            Market Desk
          </span>
        </div>

        <p
          className={cn(
            "mt-8 text-sm font-semibold uppercase tracking-[0.28em]",
            isLi ? "text-[#1e3a5f]" : "text-sky-300/90"
          )}
        >
          {post.scheduleLabel}
        </p>
        <h2
          className={cn(
            "mt-3 text-[48px] font-black leading-[1.05] tracking-tight",
            isLi && "text-slate-900"
          )}
        >
          {post.headline}
        </h2>
        <p className={cn("mt-3 text-lg leading-relaxed", isLi ? "text-slate-600" : "text-white/70")}>
          {post.hook}
        </p>

        {isWeekly ? (
          <div className="mt-8 flex flex-1 flex-col gap-3">
            {highlights.slice(0, 5).map((h, i) => (
              <div
                key={`${h.place}-${i}`}
                className={cn(
                  "flex items-start gap-4 rounded-[20px] px-5 py-3.5",
                  isLi ? "border border-slate-200 bg-white" : "border border-white/10 bg-white/[0.06]"
                )}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ backgroundColor: TEAM_COLOR }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-base font-semibold tracking-tight", isLi && "text-slate-900")}>
                    {h.place}
                  </p>
                  <p className={cn("mt-0.5 text-sm", isLi ? "text-slate-500" : "text-white/50")}>
                    {h.bedsLabel} {h.propertyType} · {h.dealType === "sale" ? "Sale" : "Rent"}
                    {h.ppsLabel ? ` · ${h.ppsLabel}` : ""}
                    {h.dateLabel ? ` · ${h.dateLabel}` : ""}
                  </p>
                </div>
                <p className={cn("shrink-0 text-base font-black tracking-tight", isLi && "text-slate-900")}>
                  {h.priceLabel}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "rounded-[24px] p-6",
                  isLi ? "border border-slate-200 bg-white" : "border border-white/10 bg-white/[0.06]"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isLi ? "text-emerald-700" : "text-emerald-300/90"
                  )}
                >
                  Rent avg
                </p>
                <p className={cn("mt-2 text-4xl font-black tracking-tight", isLi && "text-slate-900")}>{rent}</p>
                <p className={cn("mt-1 text-sm", isLi ? "text-slate-500" : "text-white/45")}>
                  {post.rentLabel}
                  {rentMed !== "—" && rentMed !== rent ? ` · med ${rentMed}` : ""}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-[24px] p-6",
                  isLi ? "border border-slate-200 bg-white" : "border border-white/10 bg-white/[0.06]"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isLi ? "text-[#1e3a5f]" : "text-sky-300/90"
                  )}
                >
                  Sale avg
                </p>
                <p className={cn("mt-2 text-4xl font-black tracking-tight", isLi && "text-slate-900")}>{sale}</p>
                <p className={cn("mt-1 text-sm", isLi ? "text-slate-500" : "text-white/45")}>
                  {post.saleLabel}
                  {saleMed !== "—" && saleMed !== sale ? ` · med ${saleMed}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "AED/sqft", value: pps || "—" },
                { label: "Beds", value: post.metrics.bedsMix || "—" },
                { label: "Sample", value: String(post.metrics.rentCount + post.metrics.saleCount || "—") },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className={cn(
                    "rounded-[18px] px-4 py-3",
                    isLi ? "border border-slate-200 bg-slate-50" : "border border-white/10 bg-black/25"
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      isLi ? "text-slate-500" : "text-white/45"
                    )}
                  >
                    {cell.label}
                  </p>
                  <p className={cn("mt-1 truncate text-lg font-black tracking-tight", isLi && "text-slate-900")}>
                    {cell.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className={cn(
                "mt-4 rounded-[22px] border border-dashed px-5 py-4",
                isLi ? "border-slate-300 bg-white/60" : "border-white/15 bg-black/20"
              )}
            >
              <p className={cn("text-base font-medium", isLi ? "text-slate-800" : "text-white/80")}>{place}</p>
              {post.metrics.topSubAreas ? (
                <p className={cn("mt-1 text-sm", isLi ? "text-slate-500" : "text-white/55")}>
                  Clusters: {post.metrics.topSubAreas}
                </p>
              ) : null}
              <p className={cn("mt-2 text-sm leading-relaxed", isLi ? "text-slate-500" : "text-white/45")}>
                {post.trustLine}
              </p>
            </div>
          </>
        )}

        <div className="mt-auto pt-6">
          <p
            className={cn(
              "mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em]",
              isLi ? "text-slate-400" : "text-white/35"
            )}
          >
            {CATEGORY_LOCK}
          </p>
          <div
            className="rounded-full px-6 py-4 text-center text-xl font-bold text-white"
            style={{ backgroundColor: TEAM_COLOR }}
          >
            {agent.phone ? `${agent.fullName} · ${agent.phone}` : `DM "Market"`}
          </div>
          <p className={cn("mt-3 text-center text-sm", isLi ? "text-slate-400" : "text-white/40")}>
            {agent.company || "Derrick Signature Properties LLC"} ·{" "}
            {agent.website || "derricksignatureproperties.ae"}
          </p>
        </div>
      </div>
    </div>
  )
}
