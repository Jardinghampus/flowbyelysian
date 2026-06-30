"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Building2, Home, Key, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { BackgroundGradient } from "@/components/ui/background-gradient"

// Dubai Market Data - Feb 2026 Snapshot
const marketSnapshot = {
  month: "Feb 2026",
  totalTransactions: 18547,
  totalValue: "AED 52.3B",
  avgPricePerSqft: {
    sales: 1890,
    rentals: 95,
  },
  topAreas: [
    { name: "Business Bay", transactions: 2341, avgPrice: 2150, change: 8.2 },
    { name: "Dubai Marina", transactions: 1987, avgPrice: 2450, change: 5.4 },
    { name: "Downtown Dubai", transactions: 1654, avgPrice: 3200, change: 12.1 },
    { name: "JVC", transactions: 1543, avgPrice: 1150, change: -2.3 },
    { name: "Palm Jumeirah", transactions: 987, avgPrice: 4500, change: 15.7 },
  ],
}

// Sales Price per SqFt History (AED)
const salesSqftHistory = [
  { area: "Palm Jumeirah", oct24: 4100, nov24: 4200, dec24: 4350, jan25: 4400, feb25: 4500, change: 9.8 },
  { area: "Downtown Dubai", oct24: 2850, nov24: 2900, dec24: 3000, jan25: 3100, feb25: 3200, change: 12.3 },
  { area: "Dubai Marina", oct24: 2200, nov24: 2280, dec24: 2350, jan25: 2400, feb25: 2450, change: 11.4 },
  { area: "Business Bay", oct24: 1900, nov24: 1950, dec24: 2000, jan25: 2080, feb25: 2150, change: 13.2 },
  { area: "JLT", oct24: 1450, nov24: 1480, dec24: 1520, jan25: 1560, feb25: 1600, change: 10.3 },
  { area: "JVC", oct24: 1100, nov24: 1120, dec24: 1140, jan25: 1150, feb25: 1150, change: 4.5 },
  { area: "Dubai Hills Estate", oct24: 1800, nov24: 1850, dec24: 1900, jan25: 1950, feb25: 2050, change: 13.9 },
  { area: "MBR City", oct24: 1650, nov24: 1700, dec24: 1750, jan25: 1800, feb25: 1880, change: 13.9 },
  { area: "Tilal Al Ghaf", oct24: 1400, nov24: 1450, dec24: 1500, jan25: 1550, feb25: 1620, change: 15.7 },
  { area: "Arabian Ranches", oct24: 1550, nov24: 1580, dec24: 1620, jan25: 1680, feb25: 1750, change: 12.9 },
]

// Rental Price per SqFt History (AED)
const rentalSqftHistory = [
  { area: "Palm Jumeirah", oct24: 180, nov24: 185, dec24: 190, jan25: 195, feb25: 200, change: 11.1 },
  { area: "Downtown Dubai", oct24: 145, nov24: 148, dec24: 152, jan25: 158, feb25: 165, change: 13.8 },
  { area: "Dubai Marina", oct24: 110, nov24: 112, dec24: 115, jan25: 118, feb25: 120, change: 9.1 },
  { area: "Business Bay", oct24: 95, nov24: 97, dec24: 100, jan25: 102, feb25: 105, change: 10.5 },
  { area: "JLT", oct24: 75, nov24: 77, dec24: 78, jan25: 80, feb25: 82, change: 9.3 },
  { area: "JVC", oct24: 55, nov24: 56, dec24: 57, jan25: 58, feb25: 58, change: 5.5 },
  { area: "Dubai Hills Estate", oct24: 95, nov24: 98, dec24: 100, jan25: 105, feb25: 110, change: 15.8 },
  { area: "MBR City", oct24: 85, nov24: 88, dec24: 90, jan25: 92, feb25: 95, change: 11.8 },
  { area: "Tilal Al Ghaf", oct24: 80, nov24: 82, dec24: 85, jan25: 88, feb25: 92, change: 15.0 },
  { area: "Arabian Ranches", oct24: 70, nov24: 72, dec24: 74, jan25: 76, feb25: 80, change: 14.3 },
]

function formatAED(value: number) {
  return `AED ${value.toLocaleString()}`
}

function ChangeIndicator({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-500"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span className="text-xs font-medium">{isPositive ? "+" : ""}{value.toFixed(1)}%</span>
    </div>
  )
}

export function MarketData() {
  const [isSnapshotOpen, setIsSnapshotOpen] = React.useState(true)

  return (
    <div className="space-y-6">
      {/* Market Snapshot */}
      <BackgroundGradient className="rounded-[22px]" containerClassName="">
        <Card className="border-0 bg-background dark:bg-zinc-900 rounded-[20px]">
          <Collapsible open={isSnapshotOpen} onOpenChange={setIsSnapshotOpen}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>Dubai Market Snapshot</CardTitle>
                  <Badge variant="outline">{marketSnapshot.month}</Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isSnapshotOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CardDescription>Real estate market overview for Dubai</CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{marketSnapshot.totalTransactions.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{marketSnapshot.totalValue}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Avg Sales (per sqft)</p>
                    <p className="text-2xl font-bold">AED {marketSnapshot.avgPricePerSqft.sales}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Avg Rental (per sqft)</p>
                    <p className="text-2xl font-bold">AED {marketSnapshot.avgPricePerSqft.rentals}</p>
                  </div>
                </div>

                {/* Top Areas */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Top Performing Areas
                  </h4>
                  <div className="grid gap-2">
                    {marketSnapshot.topAreas.map((area, index) => (
                      <div
                        key={area.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-xs text-muted-foreground">{area.transactions.toLocaleString()} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatAED(area.avgPrice)}/sqft</p>
                          <ChangeIndicator value={area.change} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </BackgroundGradient>

      {/* Price History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Price per SqFt History
          </CardTitle>
          <CardDescription>Historical price trends by area (Oct 2024 - Feb 2025)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="rentals" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Rentals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Oct 24</TableHead>
                      <TableHead className="text-right">Nov 24</TableHead>
                      <TableHead className="text-right">Dec 24</TableHead>
                      <TableHead className="text-right">Jan 25</TableHead>
                      <TableHead className="text-right">Feb 25</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesSqftHistory.map((row) => (
                      <TableRow key={row.area}>
                        <TableCell className="font-medium">{row.area}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.oct24.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.nov24.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.dec24.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.jan25.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{row.feb25.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <ChangeIndicator value={row.change} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rentals" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Oct 24</TableHead>
                      <TableHead className="text-right">Nov 24</TableHead>
                      <TableHead className="text-right">Dec 24</TableHead>
                      <TableHead className="text-right">Jan 25</TableHead>
                      <TableHead className="text-right">Feb 25</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentalSqftHistory.map((row) => (
                      <TableRow key={row.area}>
                        <TableCell className="font-medium">{row.area}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.oct24}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.nov24}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.dec24}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.jan25}</TableCell>
                        <TableCell className="text-right font-semibold">{row.feb25}</TableCell>
                        <TableCell className="text-right">
                          <ChangeIndicator value={row.change} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
