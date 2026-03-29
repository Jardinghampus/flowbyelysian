"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TemplateEditor } from "@/components/documents/TemplateEditor"
import { ArrowLeft, Save } from "lucide-react"
import type { Template, TemplateVariable } from "@/lib/documents/types"

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((res) => res.json())
      .then((data: Template) => {
        setTemplate(data)
        setName(data.name)

        // Handle content
        const c = data.content_json
        setContent(typeof c === "string" ? c : JSON.stringify(c))

        // Handle variables
        const vars = Array.isArray(data.variables)
          ? data.variables
          : JSON.parse(data.variables as unknown as string)
        setVariables(vars)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content_json: content,
          variables,
        }),
      })

      if (!res.ok) throw new Error("Failed to save")
      router.push("/app/admin/templates")
    } catch (err) {
      console.error("Failed to save template:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/admin/templates">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Edit Template</h1>
            <p className="text-sm text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Template name */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border max-w-md"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Type</Label>
          <p className="text-sm mt-1 capitalize">{template.type.replace(/_/g, " ")}</p>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-lg border border-border bg-card p-6">
        <TemplateEditor
          content={content}
          variables={variables}
          onContentChange={setContent}
          onVariablesChange={setVariables}
        />
      </div>
    </div>
  )
}
