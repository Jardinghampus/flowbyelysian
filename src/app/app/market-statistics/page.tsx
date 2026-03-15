"use client"

import { useState, useRef, useCallback } from "react"
import {
  Download,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowUpDown,
  Image as ImageIcon,
  FileDown,
  RefreshCw,
  Palette,
  ChevronDown,
  Check,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  Legend,
} from "recharts"
import { villaCommunities, formatPrice, type VillaCommunity } from "@/lib/data/villa-communities"
import { toast } from "sonner"

// ========== COLOR PALETTES ==========
const PALETTES = {
  default: ["#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"],
  ocean: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#023e8a", "#0096c7"],
  sunset: ["#ff6b6b", "#ee5a24", "#f39c12", "#e74c3c", "#c0392b", "#e17055"],
  forest: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#1b4332"],
  mono: ["#000000", "#333333", "#555555", "#777777", "#999999", "#bbbbbb"],
  pastel: ["#a8dadc", "#457b9d", "#e63946", "#f4a261", "#2a9d8f", "#264653"],
}

type PaletteKey = keyof typeof PALETTES

// ========== CHART DATA GENERATORS ==========
function getPriceComparisonData() {
  return villaCommunities.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + "..." : c.name,
    fullName: c.name,
    avgPriceSqft: c.marketData.avgPriceSqft,
    yoyChange: c.marketData.avgPriceSqftChange,
    transactions: c.marketData.totalTransactionsYTD,
    yield: c.marketData.avgRentYield,
    daysOnMarket: c.marketData.avgDaysOnMarket,
  }))
}

function getBedroomData(community: VillaCommunity) {
  return community.marketData.bedroomBreakdown.map((b) => ({
    bedrooms: b.bedrooms,
    percentage: b.percentage,
    avgPrice: b.avgPrice,
  }))
}

function getTypeData(community: VillaCommunity) {
  return community.marketData.propertyTypeBreakdown.map((t) => ({
    type: t.type,
    percentage: t.percentage,
    avgPrice: t.avgPrice,
  }))
}

function getYieldComparison() {
  const data: { area: string; type: string; yield: number }[] = []
  villaCommunities.forEach((c) => {
    c.marketData.rentalYields.forEach((r) => {
      data.push({ area: c.name, type: r.type, yield: r.yield })
    })
  })
  return data
}

function getPriceTrendData(selectedAreas: string[]) {
  const months = villaCommunities[0].marketData.priceHistory.map((h) => h.month)
  return months.map((month, idx) => {
    const point: Record<string, string | number> = { month: month.split(" ")[0] }
    villaCommunities.forEach((c) => {
      if (selectedAreas.includes(c.slug) && c.marketData.priceHistory[idx]) {
        point[c.name] = c.marketData.priceHistory[idx].avgPrice
      }
    })
    return point
  })
}

function getScatterData() {
  return villaCommunities.map((c) => ({
    name: c.name,
    x: c.marketData.avgPriceSqft,
    y: c.marketData.avgRentYield,
    z: c.marketData.totalTransactionsYTD,
  }))
}

function getRadarData() {
  return villaCommunities.slice(0, 5).map((c) => ({
    area: c.name.substring(0, 10),
    price: Math.min(c.marketData.avgPriceSqft / 35, 100),
    yield: c.marketData.avgRentYield * 14,
    volume: Math.min(c.marketData.totalTransactionsYTD / 100, 100),
    growth: c.marketData.avgPriceSqftChange * 4,
    speed: Math.max(100 - c.marketData.avgDaysOnMarket, 10),
  }))
}

// ========== SVG EXPORT ==========
function exportChartAsSVG(chartRef: React.RefObject<HTMLDivElement | null>, filename: string) {
  if (!chartRef.current) {
    toast.error("Chart not found")
    return
  }
  const svgElement = chartRef.current.querySelector("svg")
  if (!svgElement) {
    toast.error("SVG element not found")
    return
  }

  const clone = svgElement.cloneNode(true) as SVGSVGElement
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")

  // Add white background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bg.setAttribute("width", "100%")
  bg.setAttribute("height", "100%")
  bg.setAttribute("fill", "white")
  clone.insertBefore(bg, clone.firstChild)

  const svgData = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success(`Exported ${filename}.svg`)
}

// ========== MAIN COMPONENT ==========
export default function MarketStatisticsPage() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(villaCommunities.map((c) => c.slug))
  const [selectedCommunity, setSelectedCommunity] = useState<string>(villaCommunities[0].slug)
  const [palette, setPalette] = useState<PaletteKey>("default")
  const [showGrid, setShowGrid] = useState(true)
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar")
  const colors = PALETTES[palette]

  // Chart refs for SVG export
  const priceCompRef = useRef<HTMLDivElement>(null)
  const trendRef = useRef<HTMLDivElement>(null)
  const bedroomRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)
  const yieldRef = useRef<HTMLDivElement>(null)
  const scatterRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)

  const community = villaCommunities.find((c) => c.slug === selectedCommunity) || villaCommunities[0]

  const toggleArea = useCallback((slug: string) => {
    setSelectedAreas((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }, [])

  const exportAll = useCallback(() => {
    const refs = [
      { ref: priceCompRef, name: "price-comparison" },
      { ref: trendRef, name: "price-trends" },
      { ref: bedroomRef, name: "bedroom-breakdown" },
      { ref: typeRef, name: "property-type-mix" },
      { ref: yieldRef, name: "rental-yields" },
      { ref: scatterRef, name: "price-vs-yield" },
      { ref: radarRef, name: "community-radar" },
      { ref: volumeRef, name: "transaction-volume" },
    ]
    refs.forEach(({ ref, name }) => exportChartAsSVG(ref, name))
    toast.success(`Exported ${refs.length} charts`)
  }, [])

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Market Statistics</h1>
            <p className="text-muted-foreground">
              Interactive market data across Dubai&apos;s villa communities. Customize and export charts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Palette className="mr-2 h-4 w-4" />
                  Theme
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(PALETTES).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setPalette(key as PaletteKey)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex gap-0.5">
                      {PALETTES[key as PaletteKey].slice(0, 4).map((c, i) => (
                        <div key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="capitalize">{key}</span>
                    {palette === key && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Grid {showGrid ? "On" : "Off"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export SVG
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportAll}>
                  <FileDown className="mr-2 h-4 w-4" /> Export All Charts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportChartAsSVG(priceCompRef, "price-comparison")}>
                  Price Comparison
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(trendRef, "price-trends")}>
                  Price Trends
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(bedroomRef, "bedroom-breakdown")}>
                  Bedroom Breakdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(typeRef, "property-type-mix")}>
                  Property Type Mix
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(yieldRef, "rental-yields")}>
                  Rental Yields
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(scatterRef, "price-vs-yield")}>
                  Price vs Yield
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(radarRef, "community-radar")}>
                  Community Radar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChartAsSVG(volumeRef, "transaction-volume")}>
                  Transaction Volume
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        {/* Filters Bar */}
        <div className="rounded-xl border bg-card p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-2 block">Communities</Label>
                <div className="flex flex-wrap gap-2">
                  {villaCommunities.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => toggleArea(c.slug)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedAreas.includes(c.slug)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Detail View</Label>
                  <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {villaCommunities.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg. Price/sqft</p>
              <p className="text-2xl font-bold mt-1">AED {community.marketData.avgPriceSqft.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium mt-1">+{community.marketData.avgPriceSqftChange}% YoY</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">YTD Transactions</p>
              <p className="text-2xl font-bold mt-1">{community.marketData.totalTransactionsYTD.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium mt-1">+{community.marketData.transactionsChange}% vs last year</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Rental Yield</p>
              <p className="text-2xl font-bold mt-1">{community.marketData.avgRentYield}%</p>
              <p className="text-xs text-muted-foreground mt-1">Gross annual yield</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Days on Market</p>
              <p className="text-2xl font-bold mt-1">{community.marketData.avgDaysOnMarket}</p>
              <p className="text-xs text-muted-foreground mt-1">Average listing duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 1. Price Comparison Across Areas */}
          <ChartCard
            title="Price Comparison"
            description="Average price per sqft across communities"
            chartRef={priceCompRef}
            onExport={() => exportChartAsSVG(priceCompRef, "price-comparison")}
          >
            <div ref={priceCompRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPriceComparisonData().filter((d) => selectedAreas.some((s) => villaCommunities.find((c) => c.slug === s)?.name.startsWith(d.fullName.substring(0, 5))))}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`AED ${Number(v ?? 0).toLocaleString()}`, "Price/sqft"]}
                    labelFormatter={(label) => {
                      const item = getPriceComparisonData().find((d) => d.name === label)
                      return item?.fullName || label
                    }}
                  />
                  <Bar dataKey="avgPriceSqft" radius={[4, 4, 0, 0]}>
                    {getPriceComparisonData().map((_entry, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 2. Price Trends Over Time */}
          <ChartCard
            title="Price Trends"
            description="Price/sqft trend comparison over 6 months"
            chartRef={trendRef}
            onExport={() => exportChartAsSVG(trendRef, "price-trends")}
          >
            <div ref={trendRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getPriceTrendData(selectedAreas)}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`AED ${Number(v ?? 0).toLocaleString()}`, "Price/sqft"]} />
                  <Legend />
                  {villaCommunities
                    .filter((c) => selectedAreas.includes(c.slug))
                    .map((c, i) => (
                      <Line
                        key={c.slug}
                        type="monotone"
                        dataKey={c.name}
                        stroke={colors[i % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 3. Bedroom Breakdown */}
          <ChartCard
            title={`Bedroom Mix - ${community.name}`}
            description="Distribution and average price by bedroom count"
            chartRef={bedroomRef}
            onExport={() => exportChartAsSVG(bedroomRef, "bedroom-breakdown")}
          >
            <div ref={bedroomRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={getBedroomData(community)}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis dataKey="bedrooms" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(v, name) => [
                      name === "percentage" ? `${v ?? 0}%` : formatPrice(Number(v ?? 0)),
                      name === "percentage" ? "Share" : "Avg Price",
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="percentage" name="Share %" radius={[4, 4, 0, 0]}>
                    {getBedroomData(community).map((_entry, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="avgPrice" name="Avg Price" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 4. Property Type Mix */}
          <ChartCard
            title={`Property Type Mix - ${community.name}`}
            description="Distribution by villa, townhouse, and other types"
            chartRef={typeRef}
            onExport={() => exportChartAsSVG(typeRef, "property-type-mix")}
          >
            <div ref={typeRef} className="h-72 flex items-center">
              <div className="w-3/5 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTypeData(community)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      dataKey="percentage"
                      nameKey="type"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {getTypeData(community).map((_entry, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v ?? 0}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-2/5 space-y-3">
                {getTypeData(community).map((t, i) => (
                  <div key={t.type} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                    <div>
                      <p className="text-sm font-medium">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.percentage}% &middot; {formatPrice(t.avgPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* 5. Rental Yield Comparison */}
          <ChartCard
            title={`Rental Yields - ${community.name}`}
            description="Gross rental yield by property type"
            chartRef={yieldRef}
            onExport={() => exportChartAsSVG(yieldRef, "rental-yields")}
          >
            <div ref={yieldRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={community.marketData.rentalYields} layout="vertical">
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, "Yield"]} />
                  <Bar dataKey="yield" radius={[0, 4, 4, 0]}>
                    {community.marketData.rentalYields.map((_entry, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 6. Price vs Yield Scatter */}
          <ChartCard
            title="Price vs Yield"
            description="Average price/sqft vs rental yield across communities"
            chartRef={scatterRef}
            onExport={() => exportChartAsSVG(scatterRef, "price-vs-yield")}
          >
            <div ref={scatterRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis type="number" dataKey="x" name="Price/sqft" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} label={{ value: "AED/sqft", position: "bottom", fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="Yield" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} label={{ value: "Yield %", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null
                      const d = payload[0].payload
                      return (
                        <div className="rounded-lg bg-white dark:bg-neutral-900 shadow-lg border p-3">
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-sm">AED {d.x.toLocaleString()}/sqft</p>
                          <p className="text-sm">{d.y}% yield</p>
                          <p className="text-sm text-muted-foreground">{d.z.toLocaleString()} transactions</p>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={getScatterData()} fill={colors[0]}>
                    {getScatterData().map((_entry, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} r={8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 7. Community Radar */}
          <ChartCard
            title="Community Radar"
            description="Multi-dimensional comparison (normalized scores)"
            chartRef={radarRef}
            onExport={() => exportChartAsSVG(radarRef, "community-radar")}
          >
            <div ref={radarRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} />
                  <Radar name="Price" dataKey="price" stroke={colors[0]} fill={colors[0]} fillOpacity={0.15} />
                  <Radar name="Yield" dataKey="yield" stroke={colors[1]} fill={colors[1]} fillOpacity={0.15} />
                  <Radar name="Volume" dataKey="volume" stroke={colors[2]} fill={colors[2]} fillOpacity={0.15} />
                  <Radar name="Growth" dataKey="growth" stroke={colors[3]} fill={colors[3]} fillOpacity={0.15} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 8. Transaction Volume */}
          <ChartCard
            title="Transaction Volume"
            description="Monthly transaction count across selected communities"
            chartRef={volumeRef}
            onExport={() => exportChartAsSVG(volumeRef, "transaction-volume")}
          >
            <div ref={volumeRef} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getPriceTrendData(selectedAreas).map((d, idx) => {
                  const point: Record<string, string | number> = { month: d.month }
                  villaCommunities.forEach((c) => {
                    if (selectedAreas.includes(c.slug) && c.marketData.priceHistory[idx]) {
                      point[c.name] = c.marketData.priceHistory[idx].transactions
                    }
                  })
                  return point
                })}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {villaCommunities
                    .filter((c) => selectedAreas.includes(c.slug))
                    .map((c, i) => (
                      <Area
                        key={c.slug}
                        type="monotone"
                        dataKey={c.name}
                        stroke={colors[i % colors.length]}
                        fill={colors[i % colors.length]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Price Guide Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Price Guide - {community.name}</CardTitle>
            <CardDescription>Indicative pricing by property type and bedrooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Bedrooms</th>
                    <th className="pb-3 pr-4">From</th>
                    <th className="pb-3 pr-4">Average</th>
                    <th className="pb-3">To</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {community.marketData.priceRanges.map((r, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-4 text-sm font-medium">{r.type}</td>
                      <td className="py-3 pr-4 text-sm">{r.bedrooms}</td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">{formatPrice(r.minPrice)}</td>
                      <td className="py-3 pr-4 text-sm font-semibold">{formatPrice(r.avgPrice)}</td>
                      <td className="py-3 text-sm text-muted-foreground">{formatPrice(r.maxPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function ChartCard({
  title,
  description,
  children,
  chartRef,
  onExport,
}: {
  title: string
  description: string
  children: React.ReactNode
  chartRef: React.RefObject<HTMLDivElement | null>
  onExport: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onExport} className="flex-shrink-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
