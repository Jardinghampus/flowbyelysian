"use client"

import { useState, useEffect } from "react"
import { substituteVariables } from "@/lib/documents/pdf"
import Image from "next/image"

interface DocumentHeaderSettings {
  header_logo_url: string | null
  company_name: string
  company_phone: string
  company_email: string
  company_website: string
  company_address: string
}

interface DocumentPreviewProps {
  content: string
  fields: Record<string, string>
}

function DocumentHeader({ settings }: { settings: DocumentHeaderSettings }) {
  if (!settings.company_name) return null

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

export function DocumentPreview({ content, fields }: DocumentPreviewProps) {
  const [headerSettings, setHeaderSettings] = useState<DocumentHeaderSettings | null>(null)

  useEffect(() => {
    fetch("/api/document-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.company_name) {
          setHeaderSettings(data)
        }
      })
      .catch(() => {})
  }, [])

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
        {headerSettings && <DocumentHeader settings={headerSettings} />}
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
