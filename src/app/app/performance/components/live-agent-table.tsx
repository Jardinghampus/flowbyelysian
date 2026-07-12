"use client"

import * as React from "react"
import { Loader2, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CardContent } from "@/components/ui/card"
import { CollapsibleCard } from "@/components/ui/collapsible-card"
import { Progress } from "@/components/ui/progress"
import type { PerformanceOverviewData } from "./company-revenue-overview"

function aed(n: number) {
  return `AED ${Math.round(n).toLocaleString("en-AE")}`
}

export function LiveAgentPerformanceTable({
  overview,
  loading,
}: {
  overview: PerformanceOverviewData | null
  loading?: boolean
}) {
  const agents = overview?.agents || []

  return (
    <CollapsibleCard
      title={
        overview
          ? `Agent performance · ${overview.period.year}-${String(overview.period.month).padStart(2, "0")}`
          : "Agent performance"
      }
      icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
      defaultOpen
      storageKey="live-agent-performance"
    >
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Every active agent · sale vs rent · personal/company KPI progress
        </p>
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : agents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No agents yet. Add them in Admin → Users. Closed deals and admin actuals will show here.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Sale</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>vs personal/company KPI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.agentId}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {agent.rank === 1 && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                        #{agent.rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{agent.saleDeals}</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {aed(agent.saleCommission)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.rentDeals}</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {aed(agent.rentCommission)}
                      </div>
                    </TableCell>
                    <TableCell>{aed(agent.commission)}</TableCell>
                    <TableCell>{aed(agent.revenue)}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{agent.targetPercent}%</span>
                      </div>
                      <Progress value={Math.min(agent.targetPercent, 100)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </CollapsibleCard>
  )
}
