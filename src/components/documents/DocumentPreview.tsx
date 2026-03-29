"use client"

import { substituteVariables } from "@/lib/documents/pdf"

interface DocumentPreviewProps {
  content: string
  fields: Record<string, string>
}

export function DocumentPreview({ content, fields }: DocumentPreviewProps) {
  // Clean content — remove outer JSON quotes if present
  let cleanContent = content
  if (typeof cleanContent === 'string' && cleanContent.startsWith('"') && cleanContent.endsWith('"')) {
    try {
      cleanContent = JSON.parse(cleanContent)
    } catch {
      // keep as-is
    }
  }

  const rendered = substituteVariables(cleanContent, fields)
  const paragraphs = rendered.split('\n')

  return (
    <div className="rounded-lg border border-border bg-white dark:bg-neutral-950 p-8 max-h-[600px] overflow-y-auto">
      <div className="max-w-[650px] mx-auto font-mono text-sm leading-relaxed">
        {paragraphs.map((paragraph, i) => {
          if (paragraph.trim() === '') {
            return <div key={i} className="h-4" />
          }

          const isHeader = /^\d+\.\s/.test(paragraph.trim())
          const hasUnfilledVar = /\{\{[^}]+\}\}/.test(paragraph)

          return (
            <p
              key={i}
              className={`mb-1 text-neutral-800 dark:text-neutral-200 ${
                isHeader ? 'font-bold mt-4' : ''
              }`}
            >
              {hasUnfilledVar
                ? paragraph.split(/(\{\{[^}]+\}\})/).map((part, j) =>
                    /\{\{[^}]+\}\}/.test(part) ? (
                      <span key={j} className="bg-amber-500/20 text-amber-500 px-1 rounded">
                        {part}
                      </span>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )
                : paragraph}
            </p>
          )
        })}
      </div>
    </div>
  )
}
