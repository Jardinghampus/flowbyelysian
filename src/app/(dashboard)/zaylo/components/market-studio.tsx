"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Copy, Download, ExternalLink, Film, LinkIcon, Plus, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zayloAreaCatalog, zayloSourceLinks, type ZayloAreaCatalogItem, type ZayloBedroom, type ZayloSourceKind, type ZayloSourceLink } from "@/lib/zaylo/market-catalog"
import { formatAed, marketMetrics, socialDrafts, type MarketMetric } from "@/lib/zaylo/market-studio"
import { toast } from "sonner"

function statusVariant(status: MarketMetric["status"]) {
  return status === "live" || status === "manual" ? "default" : status === "draft" ? "secondary" : "outline"
}

export function MarketStudio() {
  const [selectedId, setSelectedId] = useState(marketMetrics[0]?.id ?? "")
  const [masterCommunity, setMasterCommunity] = useState("all")
  const [bedroomFilter, setBedroomFilter] = useState<"all" | `${ZayloBedroom}`>("all")
  const [areas, setAreas] = useState<ZayloAreaCatalogItem[]>(zayloAreaCatalog)
  const [sourceLinks, setSourceLinks] = useState<ZayloSourceLink[]>(zayloSourceLinks)
  const [metrics, setMetrics] = useState<MarketMetric[]>(marketMetrics)
  const [dataMode, setDataMode] = useState<"seed" | "supabase">("seed")
  const [warnings, setWarnings] = useState<string[]>([])
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [newLink, setNewLink] = useState({
    masterCommunity: "Mudon",
    subCommunity: "Al Ranim",
    kind: "manual" as ZayloSourceKind,
    label: "DXB Interact transactions",
    url: "",
  })

  // Deprecated as posting UI — Media Desk OS is source of truth for IG/LI posts.

  useEffect(() => {
    async function loadState() {
      try {
        const response = await fetch("/api/zaylo/market-studio", { cache: "no-store" })
        const data = await response.json()
        if (Array.isArray(data.areas)) setAreas(data.areas)
        if (Array.isArray(data.sourceLinks)) setSourceLinks(data.sourceLinks)
        if (Array.isArray(data.metrics)) setMetrics(data.metrics)
        if (data.dataMode === "supabase" || data.dataMode === "seed") setDataMode(data.dataMode)
        if (Array.isArray(data.warnings)) setWarnings(data.warnings)
      } catch {
        setWarnings(["Could not refresh Market Studio state. Using bundled seed catalog."])
      }
    }

    void loadState()
  }, [])

  const masterCommunities = useMemo(() => Array.from(new Set(areas.map((area) => area.masterCommunity))), [areas])
  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesCommunity = masterCommunity === "all" || metric.community === masterCommunity
      const matchesBedroom = bedroomFilter === "all" || metric.beds === Number(bedroomFilter)
      return matchesCommunity && matchesBedroom
    })
  }, [bedroomFilter, masterCommunity, metrics])

  const selectedMetric = filteredMetrics.find((metric) => metric.id === selectedId) ?? filteredMetrics[0] ?? metrics[0]
  const selectedDraft = socialDrafts.find((draft) => draft.metricId === selectedMetric?.id) ?? socialDrafts[0]

  const communities = useMemo(() => {
    return Array.from(new Set(areas.map((area) => `${area.community}, ${area.subCommunity}`)))
  }, [areas])

  const selectedArea = areas.find(
    (area) => area.community === selectedMetric?.community && area.subCommunity === selectedMetric?.subCommunity
  )
  const selectedLinks = sourceLinks.filter((link) => link.areaId === selectedArea?.id)

  async function copyCaption() {
    if (!selectedDraft) return
    await navigator.clipboard.writeText(selectedDraft.caption)
    toast.success("Caption copied")
  }

  function downloadSvg() {
    if (!selectedMetric || !selectedDraft) return
    const svg = document.querySelector("[data-market-post-svg]")?.outerHTML
    if (!svg) return
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedMetric.id}-1350x1080.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function addSourceLink() {
    if (!newLink.url.trim()) {
      toast.error("Paste a source URL first")
      return
    }

    const existingArea =
      areas.find(
        (area) =>
          area.masterCommunity === newLink.masterCommunity &&
          area.subCommunity.toLowerCase() === newLink.subCommunity.trim().toLowerCase()
      ) ?? areas.find((area) => area.masterCommunity === newLink.masterCommunity)

    if (!existingArea) {
      toast.error("Add the area to Supabase first")
      return
    }

    setIsAddingSource(true)
    const response = await fetch("/api/zaylo/source-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaSlug: existingArea.id,
        kind: newLink.kind,
        label: newLink.label.trim() || "Manual source",
        url: newLink.url.trim(),
      }),
    })
    const data = await response.json().catch(() => ({}))
    setIsAddingSource(false)

    if (!response.ok) {
      toast.error(data.error ?? "Could not save source link")
      return
    }

    if (data.sourceLink) setSourceLinks((current) => [data.sourceLink, ...current])
    setNewLink((current) => ({ ...current, url: "" }))
    setDataMode("supabase")
    toast.success("Source link saved to Supabase")
  }

  if (!selectedMetric || !selectedDraft) return null

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="py-4 text-sm">
          Posting UI moved to{" "}
          <a href="/app/social-posts" className="font-semibold underline">
            Media Desk OS
          </a>{" "}
          (IG + LinkedIn). This studio remains for source links and scrape control only.
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Villa community content machine</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Market Studio</h2>
          <p className="text-muted-foreground">
            Turn verified villa-community numbers into trust-building posts and captions.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={dataMode === "supabase" ? "default" : "secondary"}>{dataMode}</Badge>
            {warnings.slice(0, 2).map((warning) => (
              <Badge key={warning} variant="outline">{warning}</Badge>
            ))}
          </div>
        </div>
        <div className="grid w-full gap-2 lg:w-[560px] lg:grid-cols-[1fr_120px]">
          <Select value={masterCommunity} onValueChange={setMasterCommunity}>
            <SelectTrigger>
              <SelectValue placeholder="Master community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All communities</SelectItem>
              {masterCommunities.map((community) => (
                <SelectItem key={community} value={community}>
                  {community}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bedroomFilter} onValueChange={(value) => setBedroomFilter(value as "all" | `${ZayloBedroom}`)}>
            <SelectTrigger>
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All beds</SelectItem>
              <SelectItem value="3">3BR</SelectItem>
              <SelectItem value="4">4BR</SelectItem>
              <SelectItem value="5">5BR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Number</CardTitle>
              <CardDescription>
                {communities.length} communities, {filteredMetrics.length} visible 3BR/4BR/5BR segments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedMetric.id} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market segment" />
                </SelectTrigger>
                <SelectContent>
                  {filteredMetrics.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.community}, {metric.subCommunity} · {metric.beds}BR {metric.propertyType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(selectedMetric.status)}>{selectedMetric.status.replace("_", " ")}</Badge>
                <Badge variant="outline">{selectedMetric.beds}BR</Badge>
                <Badge variant="outline">{selectedMetric.propertyType}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Rental avg</div>
                  <div className="mt-1 text-2xl font-bold">{formatAed(selectedMetric.rentalAvgAed, true)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{selectedMetric.rentSampleSize} source rows</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Selling avg</div>
                  <div className="mt-1 text-2xl font-bold">{formatAed(selectedMetric.saleAvgAed, true)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{selectedMetric.saleSampleSize} source rows</div>
                </div>
              </div>

              {selectedMetric.status !== "live" && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>{selectedMetric.notes ?? "Validate this number before publishing externally."}</div>
                </div>
              )}

              {selectedMetric.sourceUrl && (
                <Button variant="outline" asChild>
                  <a href={selectedMetric.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open source
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source Links</CardTitle>
              <CardDescription>Links prepared for the scraper/import job. New links save to Supabase when configured.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {selectedLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <LinkIcon className="h-3.5 w-3.5" />
                        {link.label}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{link.url}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={link.active ? "default" : "outline"}>{link.kind.replaceAll("_", " ")}</Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Main area</Label>
                    <Select value={newLink.masterCommunity} onValueChange={(value) => setNewLink((current) => ({ ...current, masterCommunity: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {masterCommunities.map((community) => (
                          <SelectItem key={community} value={community}>
                            {community}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sub-area</Label>
                    <Input value={newLink.subCommunity} onChange={(event) => setNewLink((current) => ({ ...current, subCommunity: event.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <div className="space-y-1.5">
                    <Label>Source type</Label>
                    <Select value={newLink.kind} onValueChange={(value) => setNewLink((current) => ({ ...current, kind: value as ZayloSourceKind }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="bayut_rent_listings">Bayut rent</SelectItem>
                        <SelectItem value="bayut_sale_listings">Bayut sale</SelectItem>
                        <SelectItem value="bayut_rent_transactions">Bayut rent tx</SelectItem>
                        <SelectItem value="bayut_sale_transactions">Bayut sale tx</SelectItem>
                        <SelectItem value="dxb_interact_transactions">DXB Interact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Input value={newLink.label} onChange={(event) => setNewLink((current) => ({ ...current, label: event.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>URL</Label>
                  <Input placeholder="https://..." value={newLink.url} onChange={(event) => setNewLink((current) => ({ ...current, url: event.target.value }))} />
                </div>
                <Button onClick={addSourceLink} disabled={isAddingSource}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isAddingSource ? "Saving..." : "Add source link"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Caption</CardTitle>
              <CardDescription>Ready to paste after validating the numbers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={selectedDraft.caption} readOnly rows={10} className="resize-none text-sm" />
              <Button onClick={copyCaption} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy caption
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>1350 x 1080 Post Frame</CardTitle>
                <CardDescription>Animated preview. Export currently downloads SVG.</CardDescription>
              </div>
              <Badge variant="outline"><Film className="mr-1 h-3 w-3" /> Hyperframe</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-neutral-950 p-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMetric.id}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mx-auto aspect-[5/4] w-full max-w-[675px]"
                >
                  <PostSvg metric={selectedMetric} />
                </motion.div>
              </AnimatePresence>
            </div>
            <Button variant="outline" onClick={downloadSvg} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download 1350x1080 SVG
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PostSvg({ metric }: { metric: MarketMetric }) {
  const rent = formatAed(metric.rentalAvgAed, true)
  const sale = formatAed(metric.saleAvgAed, true)
  const headline = `${metric.community.toUpperCase()}`
  const sub = `${metric.subCommunity} · ${metric.beds}BR ${metric.propertyType.toUpperCase()}`
  const warning = metric.status === "live" || metric.status === "manual" ? "MARKET SIGNALS" : "DRAFT - VERIFY DATA"

  return (
    <svg data-market-post-svg viewBox="0 0 1350 1080" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id="zayloPostBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="48%" stopColor="#111827" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
      </defs>
      <rect width="1350" height="1080" fill="url(#zayloPostBg)" />
      <rect x="58" y="58" width="1234" height="964" rx="34" fill="none" stroke="#f8fafc" strokeOpacity="0.22" strokeWidth="2" />
      <text x="92" y="128" fill="#93c5fd" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">{warning}</text>
      <text x="92" y="216" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="78" fontWeight="900">{headline}</text>
      <text x="92" y="286" fill="#d1d5db" fontFamily="Inter, Arial" fontSize="42" fontWeight="700">{sub}</text>
      <rect x="92" y="372" width="552" height="230" rx="26" fill="#f8fafc" fillOpacity="0.08" stroke="#f8fafc" strokeOpacity="0.18" />
      <text x="128" y="440" fill="#93c5fd" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">RENTAL AVG</text>
      <text x="128" y="535" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="74" fontWeight="950">{rent}</text>
      <rect x="706" y="372" width="552" height="230" rx="26" fill="#f8fafc" fillOpacity="0.08" stroke="#f8fafc" strokeOpacity="0.18" />
      <text x="742" y="440" fill="#93c5fd" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">SELLING AVG</text>
      <text x="742" y="535" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="74" fontWeight="950">{sale}</text>
      <text x="92" y="708" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="58" fontWeight="900">The headline number is not enough.</text>
      <text x="92" y="776" fill="#d1d5db" fontFamily="Inter, Arial" fontSize="34" fontWeight="600">The deal changes by layout, plot, street, and owner situation.</text>
      <rect x="92" y="860" width="1166" height="86" rx="43" fill="#1e3a5f" />
      <text x="136" y="916" fill="#ffffff" fontFamily="Inter, Arial" fontSize="32" fontWeight="900">
        Write &quot;Market&quot; in DM and I&apos;ll get back to you
      </text>
    </svg>
  )
}
