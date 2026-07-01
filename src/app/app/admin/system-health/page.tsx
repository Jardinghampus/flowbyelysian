"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type HealthStatus = "checking" | "ready" | "config_needed" | "error"

type HealthCheck = {
  id: string
  label: string
  description: string
  endpoint: string
  status: HealthStatus
  detail: string
  updatedAt?: string
}

const checks: Array<Omit<HealthCheck, "status" | "detail" | "updatedAt">> = [
  {
    id: "zaylo-market",
    label: "Zaylo Market Studio",
    description: "Area catalog, source links, 3BR/4BR/5BR metrics and social frames.",
    endpoint: "/api/zaylo/market-studio",
  },
  {
    id: "zaylo-state",
    label: "Legacy Zaylo Workspace",
    description: "Optional local Windows workspace bridge. Not required for CRM-native Market Studio.",
    endpoint: "/api/zaylo/state",
  },
  {
    id: "listings",
    label: "Listings API",
    description: "CRM listings data source and empty-state behavior.",
    endpoint: "/api/listings",
  },
  {
    id: "owners",
    label: "Owner Stats",
    description: "Owner intelligence summary endpoint.",
    endpoint: "/api/owners/stats",
  },
  {
    id: "news",
    label: "News API",
    description: "External news feed configuration.",
    endpoint: "/api/news",
  },
]

function classify(endpoint: string, payload: unknown): Pick<HealthCheck, "status" | "detail"> {
  const data = payload as Record<string, unknown>

  if (endpoint.includes("market-studio")) {
    const metrics = Array.isArray(data.metrics) ? data.metrics.length : 0
    const areas = Array.isArray(data.areas) ? data.areas.length : 0
    return metrics > 0
      ? { status: "ready", detail: `${areas} areas and ${metrics} market segments loaded.` }
      : { status: "config_needed", detail: "Market catalog returned no segments." }
  }

  if (endpoint.includes("zaylo/state")) {
    return data.connected
      ? { status: "ready", detail: "Legacy local workspace is connected." }
      : { status: "config_needed", detail: "Legacy local workspace is optional and not connected." }
  }

  if (endpoint.includes("listings")) {
    const warning = typeof data.warning === "string" ? data.warning : ""
    const total = typeof data.total === "number" ? data.total : 0
    return warning
      ? { status: "config_needed", detail: warning }
      : { status: "ready", detail: `${total} listings available.` }
  }

  if (endpoint.includes("owners")) {
    return { status: "ready", detail: `${Number(data.totalOwners ?? 0)} owners loaded.` }
  }

  if (endpoint.includes("news")) {
    return data.configured === false
      ? { status: "config_needed", detail: "NEWS_API_KEY is not configured." }
      : { status: "ready", detail: `${Number(data.totalResults ?? 0)} news results available.` }
  }

  return { status: "ready", detail: "Endpoint returned successfully." }
}

function statusBadge(status: HealthStatus) {
  if (status === "ready") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Ready</Badge>
  if (status === "config_needed") return <Badge variant="secondary">Config needed</Badge>
  if (status === "checking") return <Badge variant="outline">Checking</Badge>
  return <Badge variant="destructive">Error</Badge>
}

function statusIcon(status: HealthStatus) {
  if (status === "ready") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  if (status === "config_needed") return <AlertTriangle className="h-5 w-5 text-amber-600" />
  if (status === "checking") return <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
  return <XCircle className="h-5 w-5 text-destructive" />
}

export default function SystemHealthPage() {
  const [items, setItems] = useState<HealthCheck[]>(
    checks.map((check) => ({ ...check, status: "checking", detail: "Waiting for first check." }))
  )
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function refresh() {
    setIsRefreshing(true)
    const updated = await Promise.all(
      checks.map(async (check) => {
        try {
          const response = await fetch(check.endpoint, { cache: "no-store" })
          const payload = await response.json().catch(() => ({}))

          if (!response.ok) {
            return {
              ...check,
              status: "error" as const,
              detail: `HTTP ${response.status}`,
              updatedAt: new Date().toLocaleTimeString(),
            }
          }

          return {
            ...check,
            ...classify(check.endpoint, payload),
            updatedAt: new Date().toLocaleTimeString(),
          }
        } catch (error) {
          return {
            ...check,
            status: "error" as const,
            detail: error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date().toLocaleTimeString(),
          }
        }
      })
    )

    setItems(updated)
    setIsRefreshing(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const summary = useMemo(() => {
    return {
      ready: items.filter((item) => item.status === "ready").length,
      configNeeded: items.filter((item) => item.status === "config_needed").length,
      errors: items.filter((item) => item.status === "error").length,
    }
  }, [items])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Operational checks for the CRM, Zaylo, and external data setup.</p>
        </div>
        <Button onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh checks
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready</CardDescription>
            <CardTitle className="text-3xl">{summary.ready}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Config needed</CardDescription>
            <CardTitle className="text-3xl">{summary.configNeeded}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Errors</CardDescription>
            <CardTitle className="text-3xl">{summary.errors}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="mt-1">{statusIcon(item.status)}</div>
                  <div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
                {statusBadge(item.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">{item.detail}</div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{item.endpoint}</span>
                {item.updatedAt && <span>Checked {item.updatedAt}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
