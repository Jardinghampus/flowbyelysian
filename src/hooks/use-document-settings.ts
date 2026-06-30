"use client"

import { useState, useEffect } from "react"

export interface DocumentSettings {
  id?: string
  header_logo_url: string | null
  header_display_name: string
  company_name: string
  company_phone: string
  company_email: string
  company_website: string
  company_address: string
}

const DEFAULTS: DocumentSettings = {
  header_logo_url: null,
  header_display_name: "ZFLOW",
  company_name: "DERRICK SIGNATURE PROPERTIES L.L.C",
  company_phone: "+ 971 (0) 4 295 5397",
  company_email: "info@derricksignatureproperties.ae",
  company_website: "www.derricksignatureproperties.ae",
  company_address: "Office 605, Al Barsha Business Square, Dubai, UAE",
}

// Simple module-level cache so multiple components share the same data
let cachedSettings: DocumentSettings | null = null
let fetchPromise: Promise<DocumentSettings> | null = null

function fetchSettings(): Promise<DocumentSettings> {
  if (fetchPromise) return fetchPromise
  fetchPromise = fetch("/api/document-settings")
    .then((res) => res.json())
    .then((data) => {
      if (data && !data.error) {
        cachedSettings = { ...DEFAULTS, ...data }
      } else {
        cachedSettings = DEFAULTS
      }
      return cachedSettings as DocumentSettings
    })
    .catch(() => {
      cachedSettings = DEFAULTS
      return cachedSettings as DocumentSettings
    })
  return fetchPromise!
}

export function invalidateDocumentSettings() {
  cachedSettings = null
  fetchPromise = null
}

export function useDocumentSettings() {
  const [settings, setSettings] = useState<DocumentSettings>(cachedSettings ?? DEFAULTS)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }
    fetchSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}
