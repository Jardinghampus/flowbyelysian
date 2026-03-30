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
import { FileText, Search } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDocuments(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredDocs = documents.filter((d: any) => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      d.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.signer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.signer_email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

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

      {/* Document list */}
      <DocumentList documents={filteredDocs} showAgent loading={loading} />
    </div>
  )
}
