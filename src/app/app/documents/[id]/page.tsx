"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/documents/StatusBadge"
import { DocumentPreview } from "@/components/documents/DocumentPreview"
import { ArrowLeft, Send, Download, Copy, ExternalLink } from "lucide-react"
import type { DocumentStatus } from "@/lib/documents/types"

interface DocumentDetail {
  id: string
  template_id: string
  agent_id: string
  agent_email: string
  agent_name: string
  status: DocumentStatus
  sign_token: string
  signer_email: string | null
  signer_name: string | null
  created_at: string
  sent_at: string | null
  signed_at: string | null
  pdf_url: string | null
  templates?: {
    name: string
    type: string
    content_json: string
    variables: any[]
  }
  fields: { field_key: string; field_value: string }[]
  signatures: { image_base64: string; signed_at: string; signer_ip: string }[]
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then(setDoc)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSendForSigning = async () => {
    if (!doc) return
    setSending(true)
    try {
      await fetch(`/api/documents/${id}/send`, { method: "POST" })
      // Refresh
      const res = await fetch(`/api/documents/${id}`)
      setDoc(await res.json())
    } catch (err) {
      console.error("Failed to send:", err)
    } finally {
      setSending(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!doc?.pdf_url) return
    // Get signed URL from storage
    const res = await fetch(`/api/documents/${id}`)
    const data = await res.json()
    if (data.pdf_url) {
      window.open(data.pdf_url, "_blank")
    }
  }

  const copySignLink = () => {
    if (!doc) return
    const signUrl = `${window.location.origin}/sign/${doc.sign_token}`
    navigator.clipboard.writeText(signUrl)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    )
  }

  const fieldMap: Record<string, string> = {}
  for (const f of doc.fields || []) {
    fieldMap[f.field_key] = f.field_value
  }

  const templateContent = doc.templates?.content_json
    ? typeof doc.templates.content_json === "string"
      ? doc.templates.content_json
      : JSON.stringify(doc.templates.content_json)
    : ""

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/documents">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">
                {doc.templates?.name || "Document"}
              </h1>
              <StatusBadge status={doc.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Created {new Date(doc.created_at).toLocaleDateString("en-AE")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {doc.status === "draft" && (
            <Button onClick={handleSendForSigning} disabled={sending || !doc.signer_email}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send for Signing"}
            </Button>
          )}
          {doc.status === "sent" && (
            <Button variant="outline" onClick={copySignLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Sign Link
            </Button>
          )}
          {doc.status === "signed" && doc.pdf_url && (
            <Button onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Document info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Agent</p>
          <p className="text-sm font-medium">{doc.agent_name}</p>
          <p className="text-xs text-muted-foreground">{doc.agent_email}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Client / Signer</p>
          <p className="text-sm font-medium">{doc.signer_name || "—"}</p>
          <p className="text-xs text-muted-foreground">{doc.signer_email || "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Timeline</p>
          {doc.sent_at && (
            <p className="text-xs">Sent: {new Date(doc.sent_at).toLocaleString("en-AE")}</p>
          )}
          {doc.signed_at && (
            <p className="text-xs text-emerald-400">Signed: {new Date(doc.signed_at).toLocaleString("en-AE")}</p>
          )}
          {!doc.sent_at && !doc.signed_at && (
            <p className="text-xs text-muted-foreground">Not sent yet</p>
          )}
        </div>
      </div>

      {/* Sign link (for sent documents) */}
      {doc.status === "sent" && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-400">Awaiting Signature</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign link sent to {doc.signer_email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copySignLink}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy Link
            </Button>
            <Link href={`/sign/${doc.sign_token}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Open
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Document preview */}
      {templateContent && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Document Preview</h2>
          <DocumentPreview content={templateContent} fields={fieldMap} />
        </div>
      )}

      {/* Signature display */}
      {doc.signatures && doc.signatures.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Signature</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doc.signatures[0].image_base64}
              alt="Signature"
              className="h-24 object-contain"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Signed at {new Date(doc.signatures[0].signed_at).toLocaleString("en-AE")}
              {doc.signatures[0].signer_ip && ` from ${doc.signatures[0].signer_ip}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
