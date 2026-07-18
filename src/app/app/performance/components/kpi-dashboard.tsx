"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KPI_PERIOD_OPTIONS, type KpiPeriodKey } from "@/lib/kpi/periods"
import { cn } from "@/lib/utils"

type Board = {
  period: { label: string; key: string }
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  )
}

export function KpiDashboard({
  period: controlledPeriod,
  onPeriodChange,
  compact,
}: {
  period?: KpiPeriodKey
  onPeriodChange?: (p: KpiPeriodKey) => void
  compact?: boolean
} = {}) {
  const [period, setPeriod] = useState<KpiPeriodKey>(controlledPeriod || "week")
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (controlledPeriod) setPeriod(controlledPeriod)
  }, [controlledPeriod])

  const selectPeriod = (p: KpiPeriodKey) => {
    setPeriod(p)
    onPeriodChange?.(p)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/kpi?period=${period}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      setBoard(json)
    } catch (e) {
      console.error(e)
      setBoard(null)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>KPI dashboard</CardTitle>
          <CardDescription>
            {board?.period.label || "Office KPIs"} · agent self-reported weekly stats
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KPI_PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              size="sm"
              variant={period === opt.key ? "default" : "outline"}
              className={cn("h-8", period === opt.key && "pointer-events-none")}
              onClick={() => selectPeriod(opt.key)}
            >
              {opt.short}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex h-28 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !board ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No KPI data yet.</p>
        ) : (
          <>
            <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-4")}>
              <Stat label="Total listings" value={board.totals.totalListings} />
              <Stat label="New listings" value={board.totals.newListings} />
              <Stat label="Offers" value={board.totals.offers} />
              <Stat label="Viewings" value={board.totals.viewings} />
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Total listings</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-right">Offers</TableHead>
                    <TableHead className="text-right">Viewings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.agents.map((a) => (
                    <TableRow key={a.agentId}>
                      <TableCell className="font-medium">{a.agentName}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.totalListings}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.newListings}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.offers}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.viewings}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
