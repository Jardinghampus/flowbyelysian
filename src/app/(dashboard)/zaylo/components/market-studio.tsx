"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Copy, Download, ExternalLink, Film, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatAed, marketMetrics, socialDrafts, type MarketMetric } from "@/lib/zaylo/market-studio"
import { toast } from "sonner"

function statusVariant(status: MarketMetric["status"]) {
  return status === "live" || status === "manual" ? "default" : status === "draft" ? "secondary" : "outline"
}

export function MarketStudio() {
  const [selectedId, setSelectedId] = useState(marketMetrics[0]?.id ?? "")
  const selectedMetric = marketMetrics.find((metric) => metric.id === selectedId) ?? marketMetrics[0]
  const selectedDraft = socialDrafts.find((draft) => draft.metricId === selectedMetric?.id) ?? socialDrafts[0]

  const communities = useMemo(() => {
    return Array.from(new Set(marketMetrics.map((metric) => `${metric.community}, ${metric.subCommunity}`)))
  }, [])

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

  if (!selectedMetric || !selectedDraft) return null

  return (
    <div className="space-y-6">
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
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full lg:w-[360px]">
            <SelectValue placeholder="Select market segment" />
          </SelectTrigger>
          <SelectContent>
            {marketMetrics.map((metric) => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.community}, {metric.subCommunity} · {metric.beds}BR {metric.propertyType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Number</CardTitle>
              <CardDescription>{communities.length} communities prepared. Live refresh comes from Firecrawl/Supabase imports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <stop offset="0%" stopColor="#0b0f19" />
          <stop offset="48%" stopColor="#111827" />
          <stop offset="100%" stopColor="#052e2b" />
        </linearGradient>
      </defs>
      <rect width="1350" height="1080" fill="url(#zayloPostBg)" />
      <rect x="58" y="58" width="1234" height="964" rx="34" fill="none" stroke="#f8fafc" strokeOpacity="0.22" strokeWidth="2" />
      <text x="92" y="128" fill="#67e8f9" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">{warning}</text>
      <text x="92" y="216" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="78" fontWeight="900">{headline}</text>
      <text x="92" y="286" fill="#d1d5db" fontFamily="Inter, Arial" fontSize="42" fontWeight="700">{sub}</text>
      <rect x="92" y="372" width="552" height="230" rx="26" fill="#f8fafc" fillOpacity="0.08" stroke="#f8fafc" strokeOpacity="0.18" />
      <text x="128" y="440" fill="#a7f3d0" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">RENTAL AVG</text>
      <text x="128" y="535" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="74" fontWeight="950">{rent}</text>
      <rect x="706" y="372" width="552" height="230" rx="26" fill="#f8fafc" fillOpacity="0.08" stroke="#f8fafc" strokeOpacity="0.18" />
      <text x="742" y="440" fill="#bfdbfe" fontFamily="Inter, Arial" fontSize="34" fontWeight="800">SELLING AVG</text>
      <text x="742" y="535" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="74" fontWeight="950">{sale}</text>
      <text x="92" y="708" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="58" fontWeight="900">The headline number is not enough.</text>
      <text x="92" y="776" fill="#d1d5db" fontFamily="Inter, Arial" fontSize="34" fontWeight="600">The deal changes by layout, plot, street, and owner situation.</text>
      <rect x="92" y="860" width="752" height="86" rx="43" fill="#67e8f9" />
      <text x="136" y="916" fill="#082f49" fontFamily="Inter, Arial" fontSize="34" fontWeight="900">DM "{metric.subCommunity}" FOR THE RANGE</text>
      <text x="1046" y="916" fill="#f8fafc" fontFamily="Inter, Arial" fontSize="32" fontWeight="900">ZAYLO</text>
    </svg>
  )
}
