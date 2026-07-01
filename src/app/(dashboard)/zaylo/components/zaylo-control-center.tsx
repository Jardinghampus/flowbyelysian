"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  FolderOpen,
  Loader2,
  Megaphone,
  Play,
  RefreshCw,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MarketStudio } from "./market-studio"

type ZayloState = {
  root: string
  pdfImportDir: string
  connected: boolean
  generatedAt: string
  counts: {
    areas: number
    sourceLinks: number
    configuredSourceLinks: number
    listings: number
    activeListings: number
    newListings: number
    pdfFiles: number
    snapshots: number
    draftPosts: number
    approvedPosts: number
    reports: number
  }
  areas: { id: string; community: string; subArea: string; weeklySlot?: string; focus?: string[] }[]
  sourceLinks: { id: string; areaId: string; kind: string; label: string; url: string; active: boolean }[]
  latestSnapshots: {
    id: string
    areaId: string
    generatedAt: string
    headline?: string
    transactionCount?: number
    confidence?: string
    dataMode?: string
    rentalMedian3Br?: number | null
    rentalMedian4Br?: number | null
    saleMedian4Br?: number | null
  }[]
  recentPosts: { id: string; areaId: string; channel: string; status: string; title: string; createdAt: string }[]
  recentReports: { file: string; modifiedAt: string }[]
  recentPdfFiles: { file: string; modifiedAt: string }[]
  warnings: string[]
}

type Job = "scrape-listings" | "generate-week" | "build-zaylo" | "import-pdfs"

const jobLabels: Record<Job, string> = {
  "scrape-listings": "Run listing scraper",
  "generate-week": "Generate weekly content",
  "build-zaylo": "Build Zaylo",
  "import-pdfs": "Import PDFs",
}

function numberFormat(value: number | null | undefined) {
  if (!value) return "n/a"
  return new Intl.NumberFormat("en-AE").format(value)
}

function dateFormat(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function ZayloControlCenter({ initialState }: { initialState: ZayloState }) {
  const [state, setState] = useState(initialState)
  const [runningJob, setRunningJob] = useState<Job | null>(null)
  const [lastRun, setLastRun] = useState<string>("")

  const configuredByArea = useMemo(() => {
    const configured = new Map<string, number>()
    for (const link of state.sourceLinks) {
      if (link.active && link.url.trim()) {
        configured.set(link.areaId, (configured.get(link.areaId) ?? 0) + 1)
      }
    }
    return configured
  }, [state.sourceLinks])

  async function refreshState() {
    const response = await fetch("/api/zaylo/state", { cache: "no-store" })
    if (response.ok) {
      setState((await response.json()) as ZayloState)
    }
  }

  async function runJob(job: Job) {
    setRunningJob(job)
    setLastRun("")

    try {
      const response = await fetch("/api/zaylo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      })
      const payload = (await response.json()) as { run?: { logPath: string }; error?: string }
      setLastRun(response.ok ? `Started. Log: ${payload.run?.logPath}` : payload.error ?? "Could not start job")
      await refreshState()
    } finally {
      setRunningJob(null)
    }
  }

  return (
    <div className="space-y-6">
      <MarketStudio />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zaylo Intelligence</h1>
          <p className="text-muted-foreground">
            Listing scraper, PDF imports, market intel, reports, and social drafts inside Flow.
          </p>
        </div>
        <Button variant="outline" onClick={refreshState}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Listings" value={state.counts.listings} detail={`${state.counts.activeListings} active · ${state.counts.newListings} new`} icon={<Database className="h-4 w-4" />} />
        <Metric title="PDF files" value={state.counts.pdfFiles} detail="Ready in import folder" icon={<Upload className="h-4 w-4" />} />
        <Metric title="Market snapshots" value={state.counts.snapshots} detail={`${state.counts.configuredSourceLinks}/${state.counts.sourceLinks} live links`} icon={<FolderOpen className="h-4 w-4" />} />
        <Metric title="Content queue" value={state.counts.draftPosts} detail={`${state.counts.approvedPosts} approved · ${state.counts.reports} reports`} icon={<Megaphone className="h-4 w-4" />} />
      </div>

      {state.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Data Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            {state.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
            <CardDescription>Runs local Zaylo jobs from the CRM. Long browser jobs continue in the background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(jobLabels) as Job[]).map((job) => (
                <Button key={job} variant={job === "scrape-listings" ? "default" : "outline"} onClick={() => runJob(job)} disabled={runningJob !== null}>
                  {runningJob === job ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  {jobLabels[job]}
                </Button>
              ))}
            </div>
            {lastRun && <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{lastRun}</p>}
            <Separator />
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div><span className="font-medium text-foreground">Zaylo root:</span> {state.root}</div>
              <div><span className="font-medium text-foreground">PDF drop folder:</span> {state.pdfImportDir}</div>
              <div><span className="font-medium text-foreground">Last status refresh:</span> {dateFormat(state.generatedAt)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Area Coverage</CardTitle>
            <CardDescription>Weekly rhythm and source readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.areas.map((area) => {
              const configured = configuredByArea.get(area.id) ?? 0
              return (
                <div key={area.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{area.community}, {area.subArea}</div>
                    <div className="text-xs text-muted-foreground">{area.weeklySlot ?? "No slot"} · {(area.focus ?? []).join(", ")}</div>
                  </div>
                  <Badge variant={configured > 0 ? "default" : "secondary"}>{configured} links</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Latest Market Snapshots</CardTitle>
            <CardDescription>Use live/manual data only before publishing externally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.latestSnapshots.length === 0 ? (
              <EmptyState label="No snapshots generated yet." />
            ) : (
              state.latestSnapshots.map((snapshot) => (
                <div key={snapshot.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{snapshot.headline ?? snapshot.areaId}</div>
                      <div className="text-xs text-muted-foreground">{dateFormat(snapshot.generatedAt)} · {snapshot.transactionCount ?? 0} signals</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={snapshot.confidence === "high" ? "default" : "secondary"}>{snapshot.confidence ?? "unknown"}</Badge>
                      <Badge variant={snapshot.dataMode === "live" || snapshot.dataMode === "mixed" ? "default" : "outline"}>{snapshot.dataMode ?? "demo"}</Badge>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <Stat label="3BR rent" value={`AED ${numberFormat(snapshot.rentalMedian3Br)}`} />
                    <Stat label="4BR rent" value={`AED ${numberFormat(snapshot.rentalMedian4Br)}`} />
                    <Stat label="4BR sale" value={`AED ${numberFormat(snapshot.saleMedian4Br)}`} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PDF Imports</CardTitle>
            <CardDescription>Files waiting for listing number/property parsing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.recentPdfFiles.length === 0 ? (
              <EmptyState label="No PDFs in the import folder." />
            ) : (
              state.recentPdfFiles.map((file) => (
                <div key={file.file} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{file.file}</div>
                    <div className="text-xs text-muted-foreground">{dateFormat(file.modifiedAt)}</div>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Queue</CardTitle>
            <CardDescription>Drafts and approved pieces from Zaylo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.recentPosts.map((post) => (
              <div key={post.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <div className="font-medium">{post.title}</div>
                  <div className="text-xs text-muted-foreground">{post.channel} · {dateFormat(post.createdAt)}</div>
                </div>
                <Badge variant={post.status === "approved" ? "default" : "secondary"}>{post.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Client-ready Markdown reports generated by Zaylo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.recentReports.length === 0 ? (
              <EmptyState label="No reports generated yet." />
            ) : (
              state.recentReports.map((report) => (
                <div key={report.file} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{report.file}</div>
                    <div className="text-xs text-muted-foreground">{dateFormat(report.modifiedAt)}</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ title, value, detail, icon }: { title: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{label}</div>
}
