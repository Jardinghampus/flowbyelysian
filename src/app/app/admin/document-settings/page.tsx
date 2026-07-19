"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, X, Loader2, Save, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { invalidateDocumentSettings } from "@/hooks/use-document-settings"

interface DocumentSettings {
  id?: string
  header_logo_url: string | null
  header_display_name: string
  company_name: string
  company_phone: string
  company_email: string
  company_website: string
  company_address: string
}

export default function DocumentSettingsPage() {
  const [settings, setSettings] = useState<DocumentSettings>({
    header_logo_url: null,
    header_display_name: "Zaylo",
    company_name: "DERRICK SIGNATURE PROPERTIES L.L.C",
    company_phone: "+ 971 (0) 4 295 5397",
    company_email: "info@derricksignatureproperties.ae",
    company_website: "www.derricksignatureproperties.ae",
    company_address: "Office 605, Al Barsha Business Square, Dubai, UAE",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/document-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const res = await fetch("/api/document-settings/upload-logo", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const { url } = await res.json()
      setSettings((prev) => ({ ...prev, header_logo_url: url }))
      toast.success("Logo uploaded successfully")
    } catch {
      toast.error("Failed to upload logo")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/document-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error("Save failed")
      invalidateDocumentSettings()
      toast.success("Document settings saved")
    } catch {
      toast.error("Failed to save settings")
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Document Header Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure the header that appears on all generated PDF documents
          </p>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Header Preview</CardTitle>
          <CardDescription>
            This header will appear at the top of every generated document (A4, 2.5cm side margins)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg bg-white p-6">
            {/* Simulate A4 header with 2.5cm margins proportionally */}
            <div className="mx-auto" style={{ maxWidth: "650px" }}>
              <div className="flex items-start gap-6 pb-4 border-b-2 border-[#1a3a5c]">
                {/* Logo */}
                <div className="flex-shrink-0 w-[140px] h-[70px] flex items-center justify-center">
                  {settings.header_logo_url ? (
                    <Image
                      src={settings.header_logo_url}
                      alt="Company Logo"
                      width={140}
                      height={70}
                      className="object-contain max-h-[70px]"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full rounded border-2 border-dashed border-neutral-300 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 text-right">
                  <h2 className="text-sm font-bold text-[#1a3a5c] tracking-wide">
                    {settings.company_name || "Company Name"}
                  </h2>
                  <div className="mt-1 space-y-0.5 text-xs text-neutral-600">
                    {settings.company_phone && <p>{settings.company_phone}</p>}
                    {settings.company_email && <p>{settings.company_email}</p>}
                    {settings.company_website && <p>{settings.company_website}</p>}
                    {settings.company_address && (
                      <p className="mt-1">{settings.company_address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Logo</CardTitle>
          <CardDescription>Upload your company logo for the document header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.header_logo_url ? (
            <div className="flex items-center gap-4">
              <div className="border rounded-lg p-3 bg-white">
                <Image
                  src={settings.header_logo_url}
                  alt="Logo"
                  width={160}
                  height={80}
                  className="object-contain max-h-[80px]"
                  unoptimized
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettings((prev) => ({ ...prev, header_logo_url: null }))}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
          ) : null}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {settings.header_logo_url ? "Replace Logo" : "Upload Logo"}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              PNG or JPG, max 5MB. Recommended: transparent background, landscape orientation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar / App Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">App Header</CardTitle>
          <CardDescription>The name shown in the sidebar header of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header_display_name">Header Text</Label>
            <Input
              id="header_display_name"
              value={settings.header_display_name}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, header_display_name: e.target.value }))
              }
              placeholder="Zaylo"
            />
            <p className="text-xs text-muted-foreground">
              This text appears next to the logo in the app sidebar. The logo uploaded above is also used in the sidebar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Details</CardTitle>
          <CardDescription>These details appear next to the logo in the document header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, company_name: e.target.value }))
                }
                placeholder="DERRICK SIGNATURE PROPERTIES L.L.C"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Phone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, company_phone: e.target.value }))
                }
                placeholder="+ 971 (0) 4 295 5397"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, company_email: e.target.value }))
                }
                placeholder="info@derricksignatureproperties.ae"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_website">Website</Label>
              <Input
                id="company_website"
                value={settings.company_website}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, company_website: e.target.value }))
                }
                placeholder="www.derricksignatureproperties.ae"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_address">Address</Label>
              <Input
                id="company_address"
                value={settings.company_address}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, company_address: e.target.value }))
                }
                placeholder="Office 605, Al Barsha Business Square, Dubai, UAE"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
