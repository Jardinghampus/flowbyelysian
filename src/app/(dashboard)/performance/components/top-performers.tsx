"use client"

import { Trophy, Home, Key } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import agentData from "../../dashboard/data/agent-performance.json"

type Agent = {
  id: number
  name: string
  contacts: number
  listings: number
  viewings: number
  commission: number
  deals: number
  targetPercent: number
  points: number
  rank: number
  area: string
  role: string
  target: number
}

export function TopPerformers() {
  const agents: Agent[] = agentData.agents

  // Find #1 Sales agent (highest commission among Sales)
  const topSalesAgent = agents
    .filter((a) => a.role === "Sales")
    .sort((a, b) => b.commission - a.commission)[0]

  // Find #1 Rentals agent (highest commission among Leasing)
  const topLeasingAgent = agents
    .filter((a) => a.role === "Leasing")
    .sort((a, b) => b.commission - a.commission)[0]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* #1 Sales Performer */}
      <BackgroundGradient className="rounded-[22px]" containerClassName="">
        <Card className="border-0 bg-background dark:bg-zinc-900 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              #1 Sales
            </CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {topSalesAgent?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{topSalesAgent?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{topSalesAgent?.area || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Deals</p>
                <p className="font-bold">{topSalesAgent?.deals || 0}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Target</p>
                <Badge
                  variant={
                    (topSalesAgent?.targetPercent || 0) >= 100
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {topSalesAgent?.targetPercent || 0}%
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="font-bold">{topSalesAgent?.points || 0}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-muted-foreground">Commission</span>
              <span className="font-bold text-xl text-primary">
                AED {(topSalesAgent?.commission || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </BackgroundGradient>

      {/* #1 Rentals Performer */}
      <BackgroundGradient className="rounded-[22px]" containerClassName="">
        <Card className="border-0 bg-background dark:bg-zinc-900 rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              #1 Rentals
            </CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {topLeasingAgent?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{topLeasingAgent?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{topLeasingAgent?.area || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Deals</p>
                <p className="font-bold">{topLeasingAgent?.deals || 0}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Target</p>
                <Badge
                  variant={
                    (topLeasingAgent?.targetPercent || 0) >= 100
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {topLeasingAgent?.targetPercent || 0}%
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="font-bold">{topLeasingAgent?.points || 0}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-muted-foreground">Commission</span>
              <span className="font-bold text-xl text-primary">
                AED {(topLeasingAgent?.commission || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </BackgroundGradient>
    </div>
  )
}
