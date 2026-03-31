"use client"

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
import type { TemplateVariable } from "@/lib/documents/types"

interface FieldFormProps {
  variables: TemplateVariable[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
}

export function FieldForm({ variables, values, onChange, disabled = false }: FieldFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {variables.map((variable) => (
        <div key={variable.key} className="space-y-2">
          <Label htmlFor={variable.key} className="text-sm font-medium">
            {variable.label}
          </Label>
          {variable.key === 'exclusivity_type' ? (
            <Select
              value={values[variable.key] || ''}
              onValueChange={(value) => onChange(variable.key, value)}
              disabled={disabled}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select exclusivity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Exclusive">Exclusive</SelectItem>
                <SelectItem value="Non-Exclusive">Non-Exclusive</SelectItem>
              </SelectContent>
            </Select>
          ) : variable.type === 'text' && variable.key.includes('details') ? (
            <Textarea
              id={variable.key}
              value={values[variable.key] || ''}
              onChange={(e) => onChange(variable.key, e.target.value)}
              disabled={disabled}
              placeholder={variable.label}
              className="bg-background border-border"
              rows={4}
            />
          ) : (
            <Input
              id={variable.key}
              type={variable.type === 'date' ? 'date' : variable.type === 'email' ? 'email' : 'text'}
              value={values[variable.key] || ''}
              onChange={(e) => onChange(variable.key, e.target.value)}
              disabled={disabled}
              placeholder={variable.label}
              className="bg-background border-border"
            />
          )}
        </div>
      ))}
    </div>
  )
}
