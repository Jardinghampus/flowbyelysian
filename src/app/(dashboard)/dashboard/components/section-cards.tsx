"use client"

import { TrendingDown, TrendingUp, Users, Building2, Eye, Target, DollarSign, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import agentData from "../data/agent-performance.json"

export function SectionCards() {
  const { totals } = agentData

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Commission
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            AED {totals.commission.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3" />
              +{totals.salesActualPercent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sales: {totals.salesActualPercent}% of target
          </div>
          <div className="text-muted-foreground">
            Leasing: {totals.leasingActualPercent}% of target
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Total Deals
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.deals}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3" />
              {totals.targetPercent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totals.targetPercent}% of overall target
          </div>
          <div className="text-muted-foreground">
            {totals.points.toLocaleString()} total points
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Active Listings
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.listings}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totals.viewings} viewings completed
          </div>
          <div className="text-muted-foreground">
            {totals.contacts} new contacts
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Performance
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {agentData.agents.length} Agents
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={`text-xs ${totals.salesActualPercent >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
              {totals.salesActualPercent >= 100 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {totals.salesActualPercent >= 100 ? 'On Target' : 'Below'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sales: AED {totals.salesActual.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            Leasing: AED {totals.leasingActual.toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
