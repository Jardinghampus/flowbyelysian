"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Layers } from "lucide-react"
import type { Template, TemplateVariable } from "@/lib/documents/types"

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getVariableCount = (template: Template): number => {
    const vars = Array.isArray(template.variables)
      ? template.variables
      : JSON.parse(template.variables as unknown as string)
    return vars.length
  }

  const typeLabels: Record<string, string> = {
    marketing_leasing: "Marketing & Leasing",
    socials_only: "Socials Only",
    general: "General",
    property_marketing_auth: "Property Marketing Auth",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Document Templates</h1>
          <p className="text-sm text-muted-foreground">Manage contract templates and variables</p>
        </div>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-border bg-card p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                {typeLabels[template.type] || template.type}
              </span>
            </div>

            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {getVariableCount(template)} variables
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(template.updated_at).toLocaleDateString("en-AE")}
            </p>

            <Link href={`/app/admin/templates/${template.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit Template
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No templates found. The seed data may not have been applied yet.</p>
        </div>
      )}
    </div>
  )
}
