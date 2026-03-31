"use client"

import { substituteVariables } from "@/lib/documents/pdf"
import Image from "next/image"
import { useDocumentSettings, type DocumentSettings } from "@/hooks/use-document-settings"

interface DocumentPreviewProps {
  content: string
  fields: Record<string, string>
  forceLightMode?: boolean
}

function DocumentHeader({ settings }: { settings: DocumentSettings }) {

  return (
    <div className="mb-6">
      <div className="flex items-start gap-6 pb-3 border-b-2 border-[#1a3a5c]">
        {/* Logo */}
        <div className="flex-shrink-0 w-[120px] h-[60px] flex items-center justify-center">
          {settings.header_logo_url ? (
            <Image
              src={settings.header_logo_url}
              alt="Company Logo"
              width={120}
              height={60}
              className="object-contain max-h-[60px]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 text-right">
          <h2 className="text-xs font-bold text-[#1a3a5c] tracking-wide">
            {settings.company_name}
          </h2>
          <div className="mt-0.5 space-y-0 text-[10px] text-neutral-500">
            {settings.company_phone && <p>{settings.company_phone}</p>}
            {settings.company_email && <p>{settings.company_email}</p>}
            {settings.company_website && <p>{settings.company_website}</p>}
            {settings.company_address && (
              <p className="mt-0.5">{settings.company_address}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocumentPreview({ content, fields, forceLightMode = false }: DocumentPreviewProps) {
  const { settings: headerSettings } = useDocumentSettings()

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
    <div className={`rounded-lg border border-border bg-white p-8 max-h-[600px] overflow-y-auto ${forceLightMode ? '' : 'dark:bg-neutral-950'}`}>
      <div className="max-w-[650px] mx-auto font-mono text-sm leading-relaxed">
        <DocumentHeader settings={headerSettings} />
        {paragraphs.map((paragraph, i) => {
          if (paragraph.trim() === '') {
            return <div key={i} className="h-4" />
          }

          const isHeader = /^\d+\.\s/.test(paragraph.trim())
          const hasUnfilledVar = /\{\{[^}]+\}\}/.test(paragraph)

          return (
            <p
              key={i}
              className={`mb-1 text-neutral-800 ${forceLightMode ? '' : 'dark:text-neutral-200'} ${
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
