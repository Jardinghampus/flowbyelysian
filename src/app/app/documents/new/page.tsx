"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldForm } from "@/components/documents/FieldForm"
import { DocumentPreview } from "@/components/documents/DocumentPreview"
import { ArrowLeft, Eye, Send, Save } from "lucide-react"
import Link from "next/link"
import type { Template, TemplateVariable } from "@/lib/documents/types"

type Step = "select" | "fill" | "preview"

export default function NewDocumentPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("select")
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then(setTemplates)
      .catch(console.error)
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      // Pre-populate agent fields from demo context
      const initial: Record<string, string> = {}
      const vars = Array.isArray(template.variables) ? template.variables : JSON.parse(template.variables as unknown as string)
      for (const v of vars) {
        if (v.key === "agent_name") initial[v.key] = "Demo Agent"
        else if (v.key === "agent_email") initial[v.key] = "agent@zflow.ae"
        else initial[v.key] = ""
      }
      setFieldValues(initial)
      setStep("fill")
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  const getTemplateVariables = (): TemplateVariable[] => {
    if (!selectedTemplate) return []
    return Array.isArray(selectedTemplate.variables)
      ? selectedTemplate.variables
      : JSON.parse(selectedTemplate.variables as unknown as string)
  }

  const getTemplateContent = (): string => {
    if (!selectedTemplate) return ""
    const c = selectedTemplate.content_json
    return typeof c === "string" ? c : JSON.stringify(c)
  }

  const handleSave = async (sendImmediately: boolean) => {
    if (!selectedTemplate) return
    setSaving(true)

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          agent_id: "demo-agent-id",
          agent_email: "agent@zflow.ae",
          agent_name: fieldValues.agent_name || "Demo Agent",
          status: sendImmediately ? "sent" : "draft",
          signer_email: signerEmail,
          signer_name: signerName,
          fields: fieldValues,
        }),
      })

      if (!res.ok) throw new Error("Failed to create document")

      const doc = await res.json()

      // Send signing email if requested
      if (sendImmediately && signerEmail) {
        await fetch(`/api/documents/${doc.id}/send`, { method: "POST" })
      }

      router.push(`/app/documents/${doc.id}`)
    } catch (err) {
      console.error("Failed to save document:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/documents">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">New Document</h1>
          <p className="text-sm text-muted-foreground">
            {step === "select" && "Choose a template"}
            {step === "fill" && "Fill in the fields"}
            {step === "preview" && "Review and send"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["select", "fill", "preview"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : s < step || (s === "select" && step !== "select")
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`w-12 h-px ${step !== "select" || i > 0 ? "bg-primary/30" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Select template */}
      {step === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {template.type.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                {(Array.isArray(template.variables) ? template.variables : JSON.parse(template.variables as unknown as string)).length} fields
              </p>
            </button>
          ))}
          {templates.length === 0 && (
            <div className="col-span-3 rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No templates available. Ask an admin to create templates first.</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Fill fields */}
      {step === "fill" && selectedTemplate && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">
            <h2 className="font-medium">Contract Fields</h2>
            <FieldForm
              variables={getTemplateVariables()}
              values={fieldValues}
              onChange={handleFieldChange}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-medium">Signer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Signer Name</Label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Full name of the person who will sign"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Signer Email</Label>
                <Input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="bg-background border-border"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("select")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep("preview")}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && selectedTemplate && (
        <div className="space-y-6">
          <DocumentPreview
            content={getTemplateContent()}
            fields={fieldValues}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("fill")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || !signerEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                {saving ? "Sending..." : "Send for Signing"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
