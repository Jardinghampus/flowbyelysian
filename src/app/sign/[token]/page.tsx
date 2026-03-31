"use client"

import { useState, useEffect, use } from "react"
import { DocumentPreview } from "@/components/documents/DocumentPreview"
import { SignatureCanvas } from "@/components/documents/SignatureCanvas"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, FileText } from "lucide-react"

interface SignPageDocument {
  id: string
  status: string
  signer_name: string | null
  signer_email: string | null
  agent_name: string
  templates?: {
    name: string
    type: string
    content_json: string
    variables: any[]
  }
  fields: { field_key: string; field_value: string }[]
}

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [doc, setDoc] = useState<SignPageDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchDocument()
  }, [token])

  const fetchDocument = async () => {
    try {
      // Use the service role client via API to find document by token
      const res = await fetch(`/api/documents/sign-lookup?token=${token}`)
      if (!res.ok) {
        setError("Document not found or link has expired.")
        return
      }
      const data = await res.json()
      if (data.status !== "sent") {
        if (data.status === "signed") {
          setError("This document has already been signed.")
        } else {
          setError("This document is not available for signing.")
        }
        return
      }
      setDoc(data)
    } catch {
      setError("Failed to load document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSignature = async () => {
    if (!doc || !signatureData) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureBase64: signatureData,
          signerName: doc.signer_name,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit signature")

      const data = await res.json()
      setPdfUrl(data.pdfUrl)
      setSigned(true)
    } catch {
      setError("Failed to submit signature. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">{error}</h1>
          <p className="text-sm text-neutral-500">
            If you believe this is an error, please contact the sender.
          </p>
        </div>
      </div>
    )
  }

  // Signed success state
  if (signed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Document Signed!</h1>
          <p className="text-sm text-neutral-500">
            Thank you for signing. A confirmation has been sent to both parties.
          </p>
          {pdfUrl && (
            <Button
              onClick={() => window.open(pdfUrl, "_blank")}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Download Signed PDF
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Sign form
  const fieldMap: Record<string, string> = {}
  for (const f of doc?.fields || []) {
    fieldMap[f.field_key] = f.field_value
  }

  const templateContent = doc?.templates?.content_json
    ? typeof doc.templates.content_json === "string"
      ? doc.templates.content_json
      : JSON.stringify(doc.templates.content_json)
    : ""

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-neutral-900">ZFlow</span>
            <span className="text-xs text-neutral-400">Document Signing</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Document info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                {doc?.templates?.name || "Document"}
              </h1>
              <p className="text-sm text-neutral-500">
                From {doc?.agent_name} — Please review and sign below
              </p>
            </div>
          </div>
        </div>

        {/* Document content */}
        <DocumentPreview content={templateContent} fields={fieldMap} forceLightMode />

        {/* Signature area */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 space-y-6">
          <div>
            <h2 className="text-base font-medium text-neutral-900">Sign Document</h2>
            <p className="text-sm text-neutral-500 mt-1">
              By signing, you agree to the terms outlined in the document above.
            </p>
          </div>

          {doc?.signer_name && (
            <div>
              <p className="text-xs text-neutral-400">Signing as</p>
              <p className="text-sm text-neutral-900 font-medium">{doc.signer_name}</p>
            </div>
          )}

          <SignatureCanvas onSignatureChange={setSignatureData} />

          <Button
            onClick={handleSubmitSignature}
            disabled={!signatureData || submitting}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 h-12 text-base font-medium"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </div>
            ) : (
              "Submit Signature"
            )}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400">
          Powered by ZFlow — Secure document signing
        </p>
      </main>
    </div>
  )
}
