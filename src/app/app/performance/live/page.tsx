"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KPI_PERIOD_OPTIONS, type KpiPeriodKey } from "@/lib/kpi/periods"
import { cn } from "@/lib/utils"

type LivePayload = {
  kpi: {
    period: { label: string }
    totals: {
      totalListings: number
      newListings: number
      offers: number
      viewings: number
    }
    agents: Array<{
      agentId: string
      agentName: string
      totalListings: number
      newListings: number
      offers: number
      viewings: number
    }>
  }
  commission: {
    period: { year: number; month: number }
    previousPeriod: { year: number; month: number }
    thisMonth: {
      commission: number
      saleCommission: number
      rentCommission: number
      saleDeals: number
      rentDeals: number
      deals: number
    }
    lastMonth: {
      commission: number
      saleCommission: number
      rentCommission: number
      deals: number
    }
    agents: Array<{
      agentId: string
      agentName: string
      saleCommission: number
      rentCommission: number
      commission: number
      saleDeals: number
      rentDeals: number
      rank: number
    }>
  }
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function aed(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`
  return `AED ${Math.round(n).toLocaleString("en-AE")}`
}

function MetricTile({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white md:text-4xl">{value}</p>
      {sub ? <p className="mt-1 text-sm text-white/45">{sub}</p> : null}
    </div>
  )
}

export default function LivePerformancePage() {
  return <LiveBoardScreen />
}

function LiveBoardScreen() {
  const [period, setPeriod] = useState<KpiPeriodKey>("week")
  const [data, setData] = useState<LivePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState(() => new Date())

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/performance/live?period=${period}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    setLoading(true)
    void load()
    const poll = setInterval(() => void load(), 60_000)
    return () => clearInterval(poll)
  }, [load])

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const thisLabel = data
    ? `${MONTHS[data.commission.period.month - 1]} ${data.commission.period.year}`
    : "This month"
  const lastLabel = data
    ? `${MONTHS[data.commission.previousPeriod.month - 1]} ${data.commission.previousPeriod.year}`
    : "Last month"

  return (
    <div className="min-h-screen bg-[#0c0b09] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Zaylo · Live</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Office KPI board</h1>
            <p className="text-sm text-white/50">
              {data?.kpi.period.label || "…"} · refreshed every minute ·{" "}
              {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {KPI_PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  period === opt.key
                    ? "bg-[#C9A84C] text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                )}
              >
                {opt.short}
              </button>
            ))}
            <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white">
              <Link href="/app/performance">
                <X className="mr-1 h-4 w-4" />
                Exit
              </Link>
            </Button>
          </div>
        </header>

        {loading && !data ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
          </div>
        ) : data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Total listings" value={data.kpi.totals.totalListings} />
              <MetricTile label="New listings" value={data.kpi.totals.newListings} />
              <MetricTile label="Offers" value={data.kpi.totals.offers} />
              <MetricTile label="Viewings" value={data.kpi.totals.viewings} />
            </section>

            <section className="grid gap-3 lg:grid-cols-2">
              <MetricTile
                label={`Commission · ${thisLabel}`}
                value={aed(data.commission.thisMonth.commission)}
                sub={`Sales ${aed(data.commission.thisMonth.saleCommission)} · Rentals ${aed(data.commission.thisMonth.rentCommission)}`}
              />
              <MetricTile
                label={`Commission · ${lastLabel}`}
                value={aed(data.commission.lastMonth.commission)}
                sub={`Sales ${aed(data.commission.lastMonth.saleCommission)} · Rentals ${aed(data.commission.lastMonth.rentCommission)}`}
              />
            </section>

            <section className="grid flex-1 gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="border-b border-white/10 px-5 py-3">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-white/60">
                    Agent KPIs
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-white/40">
                      <tr>
                        <th className="px-5 py-3 font-medium">Agent</th>
                        <th className="px-3 py-3 text-right font-medium">Total</th>
                        <th className="px-3 py-3 text-right font-medium">New</th>
                        <th className="px-3 py-3 text-right font-medium">Offers</th>
                        <th className="px-5 py-3 text-right font-medium">Viewings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.kpi.agents.map((a) => (
                        <tr key={a.agentId} className="border-t border-white/5">
                          <td className="px-5 py-3 font-medium">{a.agentName}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{a.totalListings}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{a.newListings}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{a.offers}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{a.viewings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="border-b border-white/10 px-5 py-3">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-white/60">
                    Commission by agent · {thisLabel}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-white/40">
                      <tr>
                        <th className="px-5 py-3 font-medium">#</th>
                        <th className="px-3 py-3 font-medium">Agent</th>
                        <th className="px-3 py-3 text-right font-medium">Sales</th>
                        <th className="px-3 py-3 text-right font-medium">Rentals</th>
                        <th className="px-5 py-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.commission.agents.map((a) => (
                        <tr key={a.agentId} className="border-t border-white/5">
                          <td className="px-5 py-3 text-white/40">{a.rank}</td>
                          <td className="px-3 py-3 font-medium">{a.agentName}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-emerald-300/90">
                            {aed(a.saleCommission)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-sky-300/90">
                            {aed(a.rentCommission)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium tabular-nums">
                            {aed(a.commission)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : (
          <p className="text-center text-white/50">Could not load live board.</p>
        )}

        <footer className="flex items-center justify-between text-xs text-white/35">
          <span>Admin enters monthly commission in Admin → Agent Performance</span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Press F11 for browser fullscreen
          </span>
        </footer>
      </div>
    </div>
  )
}
