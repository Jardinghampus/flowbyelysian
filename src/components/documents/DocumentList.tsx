"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import { Eye, Plus, Download } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

interface DocumentRow {
  id: string
  agent_name: string
  agent_email: string
  status: DocumentStatus
  signer_name: string | null
  signer_email: string | null
  created_at: string
  sent_at: string | null
  signed_at: string | null
  pdf_url: string | null
  templates?: { name: string; type: string } | null
}

interface DocumentListProps {
  documents: DocumentRow[]
  showAgent?: boolean
  loading?: boolean
}

export function DocumentList({ documents, showAgent = false, loading = false }: DocumentListProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading documents...</span>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">No documents yet</p>
        <Link href="/app/documents/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            {showAgent && <TableHead>Agent</TableHead>}
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="border-border">
              <TableCell className="font-medium">
                {doc.templates?.name || "Untitled"}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatTemplateType(doc.templates?.type)}
              </TableCell>
              {showAgent && (
                <TableCell className="text-sm">{doc.agent_name}</TableCell>
              )}
              <TableCell className="text-sm">
                {doc.signer_name || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatDate(doc.sent_at || doc.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/app/documents/${doc.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {doc.status === "signed" && doc.pdf_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatTemplateType(type?: string): string {
  switch (type) {
    case "marketing_leasing": return "Marketing & Leasing"
    case "socials_only": return "Socials Only"
    case "general": return "General"
    default: return "—"
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
