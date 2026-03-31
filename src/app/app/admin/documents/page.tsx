"use client"

import { useState, useEffect } from "react"
import { DocumentList } from "@/components/documents/DocumentList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Search, Clock, Trash2 } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [autoDeleteMonths, setAutoDeleteMonths] = useState<string>("none")
  const [showAutoDeleteConfirm, setShowAutoDeleteConfirm] = useState(false)
  const [pendingAutoDelete, setPendingAutoDelete] = useState<string>("none")
  const [deletingOld, setDeletingOld] = useState(false)

  useEffect(() => {
    fetchDocuments()
    loadAutoDeleteSetting()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents")
      const data = await res.json()
      if (Array.isArray(data)) setDocuments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadAutoDeleteSetting = async () => {
    try {
      const res = await fetch("/api/documents/auto-delete")
      if (res.ok) {
        const data = await res.json()
        setAutoDeleteMonths(data.auto_delete_months?.toString() || "none")
      }
    } catch {
      // Setting not yet configured - that's fine
    }
  }

  const handleAutoDeleteChange = (value: string) => {
    setPendingAutoDelete(value)
    setShowAutoDeleteConfirm(true)
  }

  const confirmAutoDelete = async () => {
    setDeletingOld(true)
    try {
      const res = await fetch("/api/documents/auto-delete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_delete_months: pendingAutoDelete === "none" ? null : parseInt(pendingAutoDelete) }),
      })
      if (res.ok) {
        setAutoDeleteMonths(pendingAutoDelete)
        // If a months value was set, also run cleanup now
        if (pendingAutoDelete !== "none") {
          const cleanupRes = await fetch("/api/documents/auto-delete", { method: "POST" })
          if (cleanupRes.ok) {
            const result = await cleanupRes.json()
            if (result.deleted_count > 0) {
              // Refresh document list after cleanup
              fetchDocuments()
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to update auto-delete setting:", err)
    } finally {
      setDeletingOld(false)
      setShowAutoDeleteConfirm(false)
    }
  }

  const handleDocumentDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d: any) => d.id !== id))
  }

  const filteredDocs = documents.filter((d: any) => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      d.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.signer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.signer_email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const signedDocs = documents.filter((d: any) => d.status === "signed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">All Documents</h1>
          <p className="text-sm text-muted-foreground">View all contracts across all agents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by agent, client, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as DocumentStatus | "all")}
        >
          <SelectTrigger className="w-[150px] bg-background border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["draft", "sent", "signed", "expired"] as DocumentStatus[]).map((status) => {
          const count = documents.filter((d: any) => d.status === status).length
          const colors: Record<string, string> = {
            draft: "text-neutral-400",
            sent: "text-amber-400",
            signed: "text-emerald-400",
            expired: "text-red-400",
          }
          return (
            <div key={status} className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-semibold">{count}</p>
              <p className={`text-xs capitalize ${colors[status]}`}>{status}</p>
            </div>
          )
        })}
      </div>

      {/* Auto-Delete Setting */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Auto-Delete Signed Documents</p>
              <p className="text-xs text-muted-foreground">
                Automatically delete signed documents after a set period
              </p>
            </div>
          </div>
          <Select value={autoDeleteMonths} onValueChange={handleAutoDeleteChange}>
            <SelectTrigger className="w-[180px] bg-background border-border">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Disabled</SelectItem>
              <SelectItem value="3">After 3 months</SelectItem>
              <SelectItem value="6">After 6 months</SelectItem>
              <SelectItem value="9">After 9 months</SelectItem>
              <SelectItem value="12">After 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {autoDeleteMonths !== "none" && (
          <p className="mt-2 text-xs text-muted-foreground ml-12">
            Signed documents older than {autoDeleteMonths} months will be automatically deleted.
          </p>
        )}
      </div>

      {/* Document list */}
      <DocumentList
        documents={filteredDocs}
        showAgent
        loading={loading}
        onDelete={handleDocumentDeleted}
      />

      {/* Signed Documents Section */}
      {signedDocs.length > 0 && statusFilter === "all" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Signed Documents</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
              {signedDocs.length}
            </span>
          </div>
          <DocumentList
            documents={signedDocs}
            showAgent
            onDelete={handleDocumentDeleted}
          />
        </div>
      )}

      {/* Auto-Delete Confirmation Dialog */}
      <AlertDialog open={showAutoDeleteConfirm} onOpenChange={setShowAutoDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAutoDelete === "none" ? "Disable Auto-Delete" : "Enable Auto-Delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAutoDelete === "none" ? (
                "Auto-delete will be disabled. Signed documents will no longer be automatically removed."
              ) : (
                <>
                  Signed documents older than{" "}
                  <span className="font-medium text-foreground">{pendingAutoDelete} months</span>{" "}
                  will be permanently deleted. This will also immediately clean up any existing documents that exceed the selected period. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingOld}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAutoDelete}
              disabled={deletingOld}
              className={pendingAutoDelete !== "none" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              {deletingOld ? "Applying..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
