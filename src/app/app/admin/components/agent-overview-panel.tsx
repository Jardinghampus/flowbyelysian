"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AgentRow = {
  agentId: string
  agentName: string
  saleDeals: number
  rentDeals: number
  saleCommission: number
  rentCommission: number
  commission: number
  rank: number
}

function aed(n: number) {
  return `AED ${Math.round(n).toLocaleString("en-AE")}`
}

/** Real team roster + this-month commission (no demo agents). */
export function AgentOverviewPanel() {
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/performance/overview?year=${year}&month=${month}`)
        const json = await res.json()
        if (!cancelled && res.ok) setAgents(json.agents || [])
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [year, month])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Team overview</CardTitle>
          <CardDescription>
            Registered agents only · commission split sales / rentals this month
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/app/performance">
            <ExternalLink className="mr-2 h-4 w-4" />
            Performance
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No active agents. Add them in Admin → Users.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Rentals</TableHead>
                  <TableHead>Total commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.agentId}>
                    <TableCell>{a.rank}</TableCell>
                    <TableCell className="font-medium">{a.agentName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.saleDeals}</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">{aed(a.saleCommission)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.rentDeals}</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">{aed(a.rentCommission)}</div>
                    </TableCell>
                    <TableCell className="font-medium">{aed(a.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
