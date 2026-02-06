"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Building2, Users, TrendingUp, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAreaBySlug, formatPrice } from "../data/areas-data"
import { AreaOverview } from "./components/area-overview"
import { AreaInventory } from "./components/area-inventory"
import { AreaMarket } from "./components/area-market"
import { AreaAgents } from "./components/area-agents"
import { AreaRequests } from "./components/area-requests"

export default function AreaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const area = getAreaBySlug(slug)

  if (!area) {
    return (
      <div className="px-4 lg:px-6 py-12 text-center">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Area not found</h2>
        <p className="text-muted-foreground mb-4">The area you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push("/areas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Areas
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/areas")}
          className="mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{area.name}</h1>
              <p className="text-muted-foreground">{area.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Listings</span>
            </div>
            <p className="text-2xl font-bold mt-1">{area.stats.totalListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Agents</span>
            </div>
            <p className="text-2xl font-bold mt-1">{area.stats.activeAgents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Price</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatPrice(area.stats.avgPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Deals</span>
            </div>
            <p className="text-2xl font-bold mt-1">{area.stats.totalDeals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Yield</span>
            </div>
            <p className="text-2xl font-bold mt-1">{area.stats.avgRentYield}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">
            Inventory ({area.listings.length})
          </TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="agents">
            Agents ({area.agents.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({area.requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AreaOverview area={area} />
        </TabsContent>

        <TabsContent value="inventory">
          <AreaInventory listings={area.listings} />
        </TabsContent>

        <TabsContent value="market">
          <AreaMarket marketData={area.marketData} />
        </TabsContent>

        <TabsContent value="agents">
          <AreaAgents agents={area.agents} />
        </TabsContent>

        <TabsContent value="requests">
          <AreaRequests requests={area.requests} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
