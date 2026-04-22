"use client"

import { useState, useCallback, useEffect } from "react"
import { Database, ListChecks, BarChart3 } from "lucide-react"
import { StatsBar } from "./_components/StatsBar"
import { OwnerFilters } from "./_components/OwnerFilters"
import { OwnerTable } from "./_components/OwnerTable"
import { AddOwnerModal } from "./_components/AddOwnerModal"
import { LogOutreachModal } from "./_components/LogOutreachModal"
import { OwnerDetailPanel } from "./_components/OwnerDetailPanel"
import { TodoPanel } from "./_components/TodoPanel"
import { PerformancePanel } from "./_components/PerformancePanel"
import { useOwners, useOwnerStats, useOwnerDetail, useTodos, useAgentPerformance } from "./_hooks/useOwners"
import type { Owner, OwnerFiltersState } from "./_lib/types"
import { DUBAI_AREAS } from "./_lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Papa from "papaparse"

type SideTab = "todo" | "performance"

function useAreas() {
  const [areas, setAreas] = useState<string[]>([...DUBAI_AREAS])

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data) => {
        if (data.areas && data.areas.length > 0) {
          const names = data.areas.map((a: { name: string }) => a.name).sort()
          setAreas(names)
        }
      })
      .catch(() => {})
  }, [])

  return areas
}

export default function DataPage() {
  const areas = useAreas()

  const [filters, setFilters] = useState<OwnerFiltersState>({
    search: "",
    area: "",
    bedrooms: "",
    status: "",
    agent: "",
    dateFrom: "",
    dateTo: "",
  })

  const { owners, total, loading: ownersLoading, refetch: refetchOwners } = useOwners(filters)
  const { stats, loading: statsLoading, refetch: refetchStats } = useOwnerStats(filters)
  const { overdue, dueSoon, loading: todosLoading, refetch: refetchTodos } = useTodos()
  const { performance, loading: perfLoading } = useAgentPerformance()

  const [addOwnerOpen, setAddOwnerOpen] = useState(false)
  const [logOutreachOpen, setLogOutreachOpen] = useState(false)
  const [outreachOwner, setOutreachOwner] = useState<Owner | null>(null)

  const [detailOwnerId, setDetailOwnerId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { owner: detailOwner, logs: detailLogs, loading: detailLoading, refetch: refetchDetail } = useOwnerDetail(
    detailOpen ? detailOwnerId : null
  )

  const [sideTab, setSideTab] = useState<SideTab>("todo")

  const refreshAll = useCallback(() => {
    refetchOwners()
    refetchStats()
    refetchTodos()
  }, [refetchOwners, refetchStats, refetchTodos])

  const handleRowClick = (owner: Owner) => {
    setDetailOwnerId(owner.id)
    setDetailOpen(true)
  }

  const handleLogOutreach = (owner: Owner) => {
    setOutreachOwner(owner)
    setLogOutreachOpen(true)
  }

  const handleDelete = async (owner: Owner) => {
    if (!confirm(`Delete ${owner.name}? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/owners/${owner.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Owner deleted")
      refreshAll()
    } catch {
      toast.error("Failed to delete owner")
    }
  }

  const handleExport = () => {
    if (owners.length === 0) {
      toast.error("No data to export")
      return
    }

    const csvData = owners.map((o) => ({
      Name: o.name,
      Phone: o.phone,
      WhatsApp: o.whatsapp_number,
      Area: o.area,
      Unit: o.unit_number || "",
      Bedrooms: o.bedrooms || "",
      Status: o.status,
      Priority: o.priority,
      "Last Contacted": o.last_contacted_at || "",
      "Follow-up": o.follow_up_at || "",
      Calls: o.call_count,
      "WhatsApp Outreach": o.whatsapp_count,
      "Total Outreach": o.total_outreach,
      Notes: o.notes || "",
      Agent: o.assigned_agent_name || "",
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `owners-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${owners.length} owners`)
  }

  const handleTodoOwnerClick = (owner: Owner) => {
    setOutreachOwner(owner)
    setLogOutreachOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Main content */}
      <div className="flex-1 flex flex-col gap-5 p-6 overflow-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Data</h1>
              <p className="text-xs text-muted-foreground">
                Owner intelligence & outreach tracking — {total} owners
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Filters */}
        <OwnerFilters
          filters={filters}
          onFiltersChange={setFilters}
          onAddOwner={() => setAddOwnerOpen(true)}
          onLogOutreach={() => { setOutreachOwner(null); setLogOutreachOpen(true) }}
          onExport={handleExport}
          areas={areas}
        />

        {/* Table */}
        <OwnerTable
          owners={owners}
          loading={ownersLoading}
          onRowClick={handleRowClick}
          onLogOutreach={handleLogOutreach}
          onDelete={handleDelete}
        />
      </div>

      {/* Right sidebar */}
      <div className="hidden lg:flex flex-col w-[320px] border-l bg-background/30 overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b">
          <button
            onClick={() => setSideTab("todo")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors border-b-2",
              sideTab === "todo"
                ? "text-foreground border-[#C9A84C]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <ListChecks className="h-3.5 w-3.5" />
            Follow-ups
            {overdue.length > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {overdue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSideTab("performance")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors border-b-2",
              sideTab === "performance"
                ? "text-foreground border-[#C9A84C]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Performance
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-3">
          {sideTab === "todo" && (
            <TodoPanel
              overdue={overdue}
              dueSoon={dueSoon}
              loading={todosLoading}
              onOwnerClick={handleTodoOwnerClick}
            />
          )}
          {sideTab === "performance" && (
            <PerformancePanel performance={performance} loading={perfLoading} />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddOwnerModal open={addOwnerOpen} onOpenChange={setAddOwnerOpen} onSuccess={refreshAll} areas={areas} />

      <LogOutreachModal
        open={logOutreachOpen}
        onOpenChange={(v) => { setLogOutreachOpen(v); if (!v) setOutreachOwner(null) }}
        prefillOwner={outreachOwner}
        owners={owners}
        onSuccess={refreshAll}
      />

      <OwnerDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        owner={detailOwner}
        logs={detailLogs}
        loading={detailLoading}
        onRefresh={refetchDetail}
        onRefreshAll={refreshAll}
        areas={areas}
      />
    </div>
  )
}
