"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TEAM_COLOR } from "@/lib/brand"

type Community = { id: string; label: string; tagline: string }

type Pulse = {
  community: { id: string; label: string; tagline: string }
  communities: Community[]
  rentAvg: string
  saleAvg: string
  rentCount: number
  saleCount: number
  cta: string
}

export default function MarketMagnetPage() {
  const [communityId, setCommunityId] = useState("mudon")
  const [pulse, setPulse] = useState<Pulse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void fetch(`/api/market/pulse?community=${communityId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Pulse) => setPulse(data))
      .finally(() => setLoading(false))
  }, [communityId])

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Dubai Land · Villas & Townhouses · Market Desk
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          The numbers landlords and buyers actually use
        </h1>
        <p className="mt-3 max-w-xl text-lg text-slate-600">
          Not a brokerage ad. A weekly desk for Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai
          Hills & Town Square — comps first, then the shortlist.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(pulse?.communities || []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCommunityId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                communityId === c.id ? "text-white" : "bg-white text-slate-700 border border-slate-200"
              }`}
              style={communityId === c.id ? { backgroundColor: TEAM_COLOR } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading || !pulse ? (
            <p className="text-slate-500">Loading pulse…</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{pulse.community.label}</h2>
              <p className="mt-1 text-slate-500">{pulse.community.tagline}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Rent avg</p>
                  <p className="mt-2 text-3xl font-black">{pulse.rentAvg}</p>
                  <p className="mt-1 text-sm text-slate-500">{pulse.rentCount} transactions</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1e3a5f]">Sale avg</p>
                  <p className="mt-2 text-3xl font-black">{pulse.saleAvg}</p>
                  <p className="mt-1 text-sm text-slate-500">{pulse.saleCount} transactions</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-600">
                {pulse.cta} Brands are built in public — this desk is how Hampus shows the work before
                the viewing.
              </p>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Before you list — ask any agent:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>How will you use video, not just photos?</li>
                  <li>What reach beyond the portal?</li>
                  <li>How do you make buyers compete on perception?</li>
                </ol>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild style={{ backgroundColor: TEAM_COLOR }}>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer">
                    DM Market on Instagram
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/opportunity">Request a shortlist</Link>
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Zaylo Market Desk · Derrick Signature Properties LLC
        </p>
      </div>
    </div>
  )
}
