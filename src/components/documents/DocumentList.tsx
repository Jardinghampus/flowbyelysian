"use client"

import { useState } from "react"
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
import { StatusBadge } from "./StatusBadge"
import { Eye, Plus, Download, Share2, Check, Trash2 } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

interface DocumentRow {
  id: string
  agent_name: string
  agent_email: string
  status: DocumentStatus
  sign_token: string
  signer_name: string | null
  signer_email: string | null
  created_at: string
  sent_at: string | null
  signed_at: string | null
  pdf_url: string | null
  templates?: { name: string; type: string } | null
  document_fields?: { field_key: string; field_value: string }[] | null
}

interface DocumentListProps {
  documents: DocumentRow[]
  showAgent?: boolean
  loading?: boolean
  onDelete?: (id: string) => void
}

export function DocumentList({ documents, showAgent = false, loading = false, onDelete }: DocumentListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const copyShareLink = (doc: DocumentRow) => {
    const signUrl = `${window.location.origin}/sign/${doc.sign_token}`
    navigator.clipboard.writeText(signUrl)
    setCopiedId(doc.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getAddress = (doc: DocumentRow): string | null => {
    const field = doc.document_fields?.find((f) => f.field_key === "property_address")
    return field?.field_value || null
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        onDelete?.(deleteTarget.id)
      }
    } catch (err) {
      console.error("Failed to delete document:", err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

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
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Document</TableHead>
              <TableHead>Address</TableHead>
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
                <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                  {getAddress(doc) || <span className="text-muted-foreground">—</span>}
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
                    {(doc.status === "sent" || doc.status === "signed") && doc.sign_token && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyShareLink(doc)}
                        title="Copy signing link"
                      >
                        {copiedId === doc.id ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {doc.status === "signed" && doc.pdf_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => setDeleteTarget(doc)}
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.templates?.name || "this document"}
              </span>
              ? This will permanently remove the document, all field data, signatures, and the signed PDF. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
