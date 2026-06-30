"use client"

import { useState } from "react"
import { Building2, Users, Eye, Star, Calendar, TrendingUp, ChevronDown, MapPin, ClipboardList, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Consolidated agent data - in production this would come from Supabase
interface AgentData {
  id: string
  name: string
  email: string
  role: string
  area: string
  // Performance
  dealsThisMonth: number
  revenue: number
  commission: number
  conversionRate: number
  // Listings
  activeListings: number
  totalListings: number
  // Activity
  totalLeads: number
  totalViewings: number
  avgResponseTime: string
  lastActive: string
  // Listings breakdown
  listings: {
    title: string
    area: string
    type: string
    price: number
    status: string
    transactionType: string
    leads: number
    viewings: number
    daysOnMarket: number
  }[]
}

const demoAgents: AgentData[] = [
  {
    id: "agent-1",
    name: "Ahmed Hassan",
    email: "ahmed@zaylo.ae",
    role: "Senior Agent",
    area: "Emirates Hills",
    dealsThisMonth: 3,
    revenue: 9800000,
    commission: 294000,
    conversionRate: 11.8,
    activeListings: 4,
    totalListings: 12,
    totalLeads: 18,
    totalViewings: 24,
    avgResponseTime: "32 min",
    lastActive: "2026-03-31",
    listings: [
      { title: "5BR Villa — Emirates Hills", area: "Emirates Hills", type: "Villa", price: 15000000, status: "live", transactionType: "sale", leads: 5, viewings: 8, daysOnMarket: 75 },
      { title: "2BR Apartment — Marina View", area: "Dubai Marina", type: "Apartment", price: 130000, status: "pocket", transactionType: "rent", leads: 3, viewings: 4, daysOnMarket: 39 },
      { title: "1BR Apartment — Downtown", area: "Downtown Dubai", type: "Apartment", price: 95000, status: "live", transactionType: "rent", leads: 3, viewings: 5, daysOnMarket: 44 },
      { title: "Family Villa in Murooj", area: "Al Murooj", type: "Villa", price: 8500000, status: "live", transactionType: "sale", leads: 7, viewings: 7, daysOnMarket: 82 },
    ],
  },
  {
    id: "agent-2",
    name: "Sara Al-Mahmoud",
    email: "sara@zaylo.ae",
    role: "Agent",
    area: "Arabian Ranches",
    dealsThisMonth: 2,
    revenue: 5200000,
    commission: 156000,
    conversionRate: 8.3,
    activeListings: 3,
    totalListings: 9,
    totalLeads: 11,
    totalViewings: 16,
    avgResponseTime: "1h 15m",
    lastActive: "2026-03-31",
    listings: [
      { title: "4BR Townhouse — Arabian Ranches III", area: "Arabian Ranches", type: "Townhouse", price: 5200000, status: "live", transactionType: "sale", leads: 4, viewings: 6, daysOnMarket: 49 },
      { title: "Studio — Business Bay", area: "Business Bay", type: "Apartment", price: 55000, status: "draft", transactionType: "rent", leads: 0, viewings: 0, daysOnMarket: 30 },
      { title: "3BR Villa — Al Furjan", area: "Al Furjan", type: "Villa", price: 3800000, status: "live", transactionType: "sale", leads: 7, viewings: 10, daysOnMarket: 62 },
    ],
  },
  {
    id: "agent-3",
    name: "Omar Khalil",
    email: "omar@zaylo.ae",
    role: "Senior Agent",
    area: "Palm Jumeirah",
    dealsThisMonth: 4,
    revenue: 53500000,
    commission: 1605000,
    conversionRate: 14.2,
    activeListings: 2,
    totalListings: 8,
    totalLeads: 21,
    totalViewings: 28,
    avgResponseTime: "18 min",
    lastActive: "2026-03-31",
    listings: [
      { title: "3BR Penthouse — DIFC", area: "DIFC", type: "Penthouse", price: 8500000, status: "live", transactionType: "sale", leads: 6, viewings: 9, daysOnMarket: 62 },
      { title: "6BR Mansion — Palm Jumeirah", area: "Palm Jumeirah", type: "Villa", price: 45000000, status: "live", transactionType: "sale", leads: 15, viewings: 19, daysOnMarket: 85 },
    ],
  },
]

const statusColors: Record<string, string> = {
  live: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  pocket: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400",
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`
  return `AED ${amount.toLocaleString()}`
}

export function AgentOverviewPanel() {
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set())

  const toggleAgent = (id: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredAgents = selectedAgent === "all"
    ? demoAgents
    : demoAgents.filter((a) => a.id === selectedAgent)

  // Totals across all agents
  const totals = demoAgents.reduce(
    (acc, a) => ({
      deals: acc.deals + a.dealsThisMonth,
      revenue: acc.revenue + a.revenue,
      listings: acc.listings + a.activeListings,
      leads: acc.leads + a.totalLeads,
      viewings: acc.viewings + a.totalViewings,
    }),
    { deals: 0, revenue: 0, listings: 0, leads: 0, viewings: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Deals</p>
            <p className="text-2xl font-bold">{totals.deals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Active Listings</p>
            <p className="text-2xl font-bold">{totals.listings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{totals.leads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Viewings</p>
            <p className="text-2xl font-bold">{totals.viewings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {demoAgents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href="/app/landlord-report">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Landlord Report
          </Button>
        </Link>
      </div>

      {/* Agent cards */}
      {filteredAgents.map((agent) => (
        <Card key={agent.id}>
          <Collapsible
            open={expandedAgents.has(agent.id)}
            onOpenChange={() => toggleAgent(agent.id)}
          >
            <CardHeader className="pb-3">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">
                      {agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription>{agent.role} &middot; {agent.area} &middot; {agent.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Quick stats in header */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Deals</p>
                        <p className="font-bold">{agent.dealsThisMonth}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Revenue</p>
                        <p className="font-bold">{formatCurrency(agent.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Listings</p>
                        <p className="font-bold">{agent.activeListings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Conv.</p>
                        <p className="font-bold">{agent.conversionRate}%</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedAgents.has(agent.id) ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Detail stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" /> Deals
                    </div>
                    <p className="text-lg font-bold">{agent.dealsThisMonth}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Building2 className="h-3 w-3" /> Listings
                    </div>
                    <p className="text-lg font-bold">{agent.activeListings} <span className="text-sm font-normal text-muted-foreground">/ {agent.totalListings}</span></p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Users className="h-3 w-3" /> Leads
                    </div>
                    <p className="text-lg font-bold">{agent.totalLeads}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Eye className="h-3 w-3" /> Viewings
                    </div>
                    <p className="text-lg font-bold">{agent.totalViewings}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Star className="h-3 w-3" /> Commission
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(agent.commission)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" /> Resp. Time
                    </div>
                    <p className="text-lg font-bold">{agent.avgResponseTime}</p>
                  </div>
                </div>

                {/* Listings breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Listings Breakdown</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Property</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Price</TableHead>
                          <TableHead className="text-xs">Leads</TableHead>
                          <TableHead className="text-xs">Viewings</TableHead>
                          <TableHead className="text-xs">Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agent.listings.map((listing, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <p className="text-sm font-medium">{listing.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {listing.area}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${statusColors[listing.status] || ""} border-0`}>
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(listing.price)}
                              {listing.transactionType === "rent" ? "/yr" : ""}
                            </TableCell>
                            <TableCell className="text-sm">{listing.leads}</TableCell>
                            <TableCell className="text-sm">{listing.viewings}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.daysOnMarket}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  )
}
