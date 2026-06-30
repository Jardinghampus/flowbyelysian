"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Copy } from "lucide-react"
import type { TemplateVariable } from "@/lib/documents/types"

interface TemplateEditorProps {
  content: string
  variables: TemplateVariable[]
  onContentChange: (content: string) => void
  onVariablesChange: (variables: TemplateVariable[]) => void
}

export function TemplateEditor({
  content,
  variables,
  onContentChange,
  onVariablesChange,
}: TemplateEditorProps) {
  const [newVarKey, setNewVarKey] = useState("")
  const [newVarLabel, setNewVarLabel] = useState("")
  const [newVarType, setNewVarType] = useState<TemplateVariable["type"]>("text")

  // Clean content for editing — remove outer JSON quotes
  let editableContent = content
  if (typeof editableContent === 'string' && editableContent.startsWith('"') && editableContent.endsWith('"')) {
    try {
      editableContent = JSON.parse(editableContent)
    } catch {
      // keep as-is
    }
  }

  const addVariable = () => {
    if (!newVarKey || !newVarLabel) return

    const key = newVarKey.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
    onVariablesChange([
      ...variables,
      { key, label: newVarLabel, type: newVarType },
    ])
    setNewVarKey("")
    setNewVarLabel("")
    setNewVarType("text")
  }

  const removeVariable = (key: string) => {
    onVariablesChange(variables.filter((v) => v.key !== key))
  }

  const insertPlaceholder = (key: string) => {
    onContentChange(editableContent + `{{${key}}}`)
  }

  return (
    <div className="space-y-6">
      {/* Content Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Template Content</Label>
        <p className="text-xs text-muted-foreground">
          Use {"{{variable_key}}"} to insert placeholders. They will be replaced with actual values when the document is created.
        </p>
        <Textarea
          value={editableContent}
          onChange={(e) => onContentChange(e.target.value)}
          className="bg-background border-border font-mono text-sm min-h-[400px]"
          placeholder="Enter template content..."
        />
      </div>

      {/* Variable Manager */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Template Variables</Label>

        {/* Existing variables */}
        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.key}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-3"
            >
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {`{{${variable.key}}}`}
              </code>
              <span className="text-sm flex-1">{variable.label}</span>
              <span className="text-xs text-muted-foreground">{variable.type}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => insertPlaceholder(variable.key)}
                title="Insert into content"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => removeVariable(variable.key)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new variable */}
        <div className="flex items-end gap-2 p-3 rounded-lg border border-dashed border-border">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Key</Label>
            <Input
              value={newVarKey}
              onChange={(e) => setNewVarKey(e.target.value)}
              placeholder="e.g. client_name"
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Label</Label>
            <Input
              value={newVarLabel}
              onChange={(e) => setNewVarLabel(e.target.value)}
              placeholder="e.g. Client Full Name"
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="w-28 space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={newVarType} onValueChange={(v) => setNewVarType(v as TemplateVariable["type"])}>
              <SelectTrigger className="bg-background border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addVariable} size="sm" disabled={!newVarKey || !newVarLabel}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
