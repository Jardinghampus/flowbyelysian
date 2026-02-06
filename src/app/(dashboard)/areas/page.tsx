"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Building2, Users, TrendingUp, DollarSign, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { areasData, formatPrice } from "./data/areas-data"

export default function AreasPage() {
  const [search, setSearch] = useState("")

  const filteredAreas = areasData.filter((area) =>
    area.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Areas</h1>
          <p className="text-muted-foreground">
            Explore market data, listings, and agents by area
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search areas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAreas.map((area) => (
          <Link key={area.id} href={`/areas/${area.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {area.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {area.stats.activeAgents} active agent{area.stats.activeAgents !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {area.stats.totalListings} listings
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {area.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Avg Price:</span>
                    <span className="font-medium">{formatPrice(area.stats.avgPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-medium">{area.stats.avgRentYield}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Deals:</span>
                    <span className="font-medium">{area.stats.totalDeals}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Agents:</span>
                    <span className="font-medium">{area.stats.activeAgents}</span>
                  </div>
                </div>

                {/* Market Indicator */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    AED {area.marketData.avgPriceSqft}/sqft
                  </span>
                  <Badge
                    variant={area.marketData.avgPriceSqftChange > 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {area.marketData.avgPriceSqftChange > 0 ? "+" : ""}
                    {area.marketData.avgPriceSqftChange}% YoY
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No areas found matching &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  )
}
