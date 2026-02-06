"use client"

import { TrendingUp, TrendingDown, Building2, Users, DollarSign, Clock, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Area } from "../../data/areas-data"
import { formatPrice } from "../../data/areas-data"

interface AreaOverviewProps {
  area: Area
}

export function AreaOverview({ area }: AreaOverviewProps) {
  const { marketData, stats, agents, listings, requests } = area

  // Calculate top performer
  const topAgent = agents.length > 0
    ? agents.reduce((prev, current) => prev.commission > current.commission ? prev : current)
    : null

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price per Sqft
            </CardDescription>
            <CardTitle className="text-2xl">
              AED {marketData.avgPriceSqft.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {marketData.avgPriceSqftChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={marketData.avgPriceSqftChange > 0 ? "text-green-500" : "text-red-500"}>
                {marketData.avgPriceSqftChange > 0 ? "+" : ""}{marketData.avgPriceSqftChange}%
              </span>
              <span className="text-muted-foreground text-sm">vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Transactions (6mo)
            </CardDescription>
            <CardTitle className="text-2xl">
              {marketData.totalTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {marketData.transactionsChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={marketData.transactionsChange > 0 ? "text-green-500" : "text-red-500"}>
                {marketData.transactionsChange > 0 ? "+" : ""}{marketData.transactionsChange}%
              </span>
              <span className="text-muted-foreground text-sm">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Days on Market
            </CardDescription>
            <CardTitle className="text-2xl">
              {marketData.avgDaysOnMarket} days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {marketData.daysOnMarketChange < 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={marketData.daysOnMarketChange < 0 ? "text-green-500" : "text-red-500"}>
                {marketData.daysOnMarketChange}%
              </span>
              <span className="text-muted-foreground text-sm">faster than avg</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Type Distribution</CardTitle>
          <CardDescription>Breakdown of property types in this area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketData.propertyTypeBreakdown.map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.type}</span>
                <span className="font-medium">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Agent */}
        {topAgent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {topAgent.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{topAgent.name}</p>
                  <p className="text-sm text-muted-foreground">{topAgent.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatPrice(topAgent.commission)}
                  </p>
                  <p className="text-sm text-muted-foreground">{topAgent.deals} deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Listings</span>
                <Badge variant="outline">{listings.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">For Sale</span>
                <Badge variant="outline">
                  {listings.filter(l => l.transactionType === "sale").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">For Rent</span>
                <Badge variant="outline">
                  {listings.filter(l => l.transactionType === "rent").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Requests</span>
                <Badge variant="outline">
                  {requests.filter(r => r.status === "active").length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
