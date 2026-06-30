"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DocumentList } from "@/components/documents/DocumentList"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setDocuments(data)
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocs = statusFilter === "all"
    ? documents
    : documents.filter((d: any) => d.status === statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Documents</h1>
            <p className="text-sm text-muted-foreground">Manage contracts and agreements</p>
          </div>
        </div>
        <Link href="/app/documents/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {(["all", "draft", "sent", "signed", "expired"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
            {status !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                {documents.filter((d: any) => d.status === status).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Document list */}
      <DocumentList
        documents={filteredDocs}
        loading={loading}
        onDelete={(id) => setDocuments((prev) => prev.filter((d: any) => d.id !== id))}
      />
    </div>
  )
}
