"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, Copy, Check, MessageSquare, Trash2, ChevronLeft, ChevronRight,
  ArrowUpDown, Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { OwnerContact, LookupStatus, PortalType } from "@/types/owner-intelligence"
import { PortalBadge } from "./PortalBadge"
import { ExportButton } from "./ExportButton"
import { cn } from "@/lib/utils"

const statusColors: Record<LookupStatus, string> = {
  resolved: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15",
  partial: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15",
  failed: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15",
  pending: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15",
}

const filterChips: { label: string; key: string }[] = [
  { label: "All", key: "" },
  { label: "Resolved", key: "resolved" },
  { label: "Partial", key: "partial" },
  { label: "Failed", key: "failed" },
]

const portalChips: { label: string; key: string }[] = [
  { label: "Bayut", key: "bayut" },
  { label: "PropertyFinder", key: "propertyfinder" },
  { label: "Dubizzle", key: "dubizzle" },
  { label: "Manual", key: "manual" },
]

function CopyCell({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-muted transition-colors">
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />}
    </button>
  )
}

export function ContactsTable() {
  const [contacts, setContacts] = useState<OwnerContact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [portalFilter, setPortalFilter] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const limit = 25
  const totalPages = Math.ceil(total / limit)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (portalFilter) params.set("portal", portalFilter)

      const res = await fetch(`/api/owner-intelligence/contacts?${params}`)
      const json = await res.json()
      setContacts(json.contacts || [])
      setTotal(json.total || 0)
    } catch {
      toast.error("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, portalFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Debounced search
  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(col)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map((c) => c.id!)))
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    setDeleting(true)
    const ids = Array.from(selected)

    setContacts((prev) => prev.filter((c) => !selected.has(c.id!)))
    setSelected(new Set())

    try {
      const res = await fetch("/api/owner-intelligence/contacts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${ids.length} contact${ids.length > 1 ? "s" : ""} deleted`)
      fetchContacts()
    } catch {
      toast.error("Delete failed")
      fetchContacts()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search owner, building, unit, zone..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete {selected.size}
            </Button>
          )}
          <ExportButton search={search} status={statusFilter} portal={portalFilter} />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => {
              setStatusFilter(chip.key)
              setPage(1)
            }}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded transition-colors",
              statusFilter === chip.key
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
          </button>
        ))}
        <div className="w-px h-5 bg-border self-center mx-1" />
        {portalChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => {
              setPortalFilter(portalFilter === chip.key ? "" : chip.key)
              setPage(1)
            }}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded transition-colors",
              portalFilter === chip.key
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={contacts.length > 0 && selected.size === contacts.length}
                  onChange={toggleSelectAll}
                  className="accent-primary"
                />
              </th>
              <th
                className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("owner_name")}
              >
                <span className="flex items-center gap-1">
                  Owner Name
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Phone</th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Building / Unit</th>
              <th
                className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("zone")}
              >
                <span className="flex items-center gap-1">
                  Zone
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th
                className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("property_value")}
              >
                <span className="flex items-center gap-1">
                  Value
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Source</th>
              <th
                className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("created_at")}
              >
                <span className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && contacts.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30 transition-colors",
                    selected.has(c.id!) && "bg-primary/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id!)}
                      onChange={() => toggleSelect(c.id!)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.ownerName || "—"}</span>
                      <span className={cn("px-1.5 py-0.5 text-[8px] uppercase rounded", statusColors[c.lookupStatus])}>
                        {c.lookupStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {c.ownerPhone ? (
                      <span className="flex items-center gap-1 text-foreground/70">
                        {c.ownerPhone}
                        <CopyCell text={c.ownerPhone} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.ownerEmail ? (
                      <span className="flex items-center gap-1 text-foreground/70">
                        <span className="truncate max-w-[140px]">{c.ownerEmail}</span>
                        <CopyCell text={c.ownerEmail} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-muted-foreground">
                      {c.buildingName || "—"}
                      {c.unitNumber && <span className="text-primary font-medium ml-1">#{c.unitNumber}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.zone || "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {c.propertyValue
                      ? `AED ${c.propertyValue >= 1000000 ? `${(c.propertyValue / 1000000).toFixed(1)}M` : c.propertyValue.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.portal ? <PortalBadge portal={c.portal} /> : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {c.ownerPhone && (
                        <a
                          href={`https://wa.me/${c.ownerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          setContacts((prev) => prev.filter((x) => x.id !== c.id))
                          try {
                            await fetch("/api/owner-intelligence/contacts", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ids: [c.id] }),
                            })
                            toast.success("Contact deleted")
                          } catch {
                            toast.error("Delete failed")
                            fetchContacts()
                          }
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500/50 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {total} contacts · Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
