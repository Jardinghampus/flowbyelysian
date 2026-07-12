"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MessageCircle, Search, Users, Building2, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"
import {
  buildWhatsAppUrl,
  defaultOutreachMessage,
  normalizeWhatsAppNumber,
  openWhatsApp,
} from "@/lib/whatsapp"

type WaContact = {
  id: string
  name: string
  phone: string
  kind: "owner" | "lead"
  subtitle?: string
  area?: string | null
}

export default function WhatsAppPage() {
  const { userName } = useRole()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [owners, setOwners] = useState<WaContact[]>([])
  const [leads, setLeads] = useState<WaContact[]>([])
  const [draftMessage, setDraftMessage] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ownersRes, leadsRes] = await Promise.all([
        fetch("/api/owners?limit=200"),
        fetch("/api/opportunities?limit=200"),
      ])

      const ownersJson = ownersRes.ok ? await ownersRes.json() : { owners: [] }
      const leadsJson = leadsRes.ok ? await leadsRes.json() : { opportunities: [] }

      setOwners(
        (ownersJson.owners || ownersJson.data || [])
          .map((o: Record<string, unknown>) => {
            const phone = String(o.whatsapp_number || o.phone || "")
            if (!normalizeWhatsAppNumber(phone)) return null
            return {
              id: String(o.id),
              name: String(o.name || "Owner"),
              phone,
              kind: "owner" as const,
              subtitle: String(o.status || "owner"),
              area: (o.area as string) || null,
            }
          })
          .filter(Boolean) as WaContact[]
      )

      setLeads(
        (leadsJson.opportunities || leadsJson.leads || [])
          .map((l: Record<string, unknown>) => {
            const phone = String(l.whatsapp || l.phone || "")
            if (!normalizeWhatsAppNumber(phone)) return null
            return {
              id: String(l.id),
              name: String(l.full_name || l.name || "Lead"),
              phone,
              kind: "lead" as const,
              subtitle: String(l.type || l.status || "lead"),
              area: (l.area as string) || null,
            }
          })
          .filter(Boolean) as WaContact[]
      )
    } catch {
      toast.error("Could not load CRM contacts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filterContacts = (list: WaContact[]) => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.area || "").toLowerCase().includes(q)
    )
  }

  const filteredOwners = useMemo(() => filterContacts(owners), [owners, query])
  const filteredLeads = useMemo(() => filterContacts(leads), [leads, query])

  const sendTo = async (contact: WaContact) => {
    const message =
      draftMessage.trim() ||
      defaultOutreachMessage({
        contactName: contact.name,
        propertyTitle: contact.area,
        agentName: userName,
      })

    const opened = openWhatsApp({ phone: contact.phone, message })
    if (!opened) {
      toast.error("No valid WhatsApp number on this contact")
      return
    }

    // Log outreach for owners so CRM stays the source of truth
    if (contact.kind === "owner") {
      try {
        await fetch("/api/outreach-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner_id: contact.id,
            type: "whatsapp",
            outcome: "Opened WhatsApp from CRM",
          }),
        })
      } catch {
        // non-blocking
      }
    }

    toast.success(`Opening WhatsApp for ${contact.name}`)
  }

  const previewUrl = buildWhatsAppUrl({
    phone: filteredOwners[0]?.phone || filteredLeads[0]?.phone,
    message: draftMessage || "Preview",
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 lg:px-6">
      <div className="space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10">
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ingen inbyggd WhatsApp-API. Välj en kontakt från CRM — vi öppnar WhatsApp till det
          sparade numret med ditt meddelande. Chatten lever kvar i WhatsApp; CRM loggar uppföljningen.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Message draft</CardTitle>
          <CardDescription>Used when you tap Send WhatsApp on a contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Hi … Following up on your property…"
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
          />
          {previewUrl ? (
            <p className="truncate text-xs text-muted-foreground">
              Preview link pattern: <span className="font-mono">{previewUrl.slice(0, 64)}…</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name, phone, area…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="owners">
          <TabsList>
            <TabsTrigger value="owners" className="gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Owners ({filteredOwners.length})
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              Leads ({filteredLeads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owners" className="mt-4 space-y-2">
            {filteredOwners.length === 0 ? (
              <EmptyState text="No owners with WhatsApp numbers yet. Add phone numbers in Data." />
            ) : (
              filteredOwners.map((c) => (
                <ContactRow key={c.id} contact={c} onSend={() => void sendTo(c)} />
              ))
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-4 space-y-2">
            {filteredLeads.length === 0 ? (
              <EmptyState text="No leads with WhatsApp numbers yet." />
            ) : (
              filteredLeads.map((c) => (
                <ContactRow key={c.id} contact={c} onSend={() => void sendTo(c)} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function ContactRow({ contact, onSend }: { contact: WaContact; onSend: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{contact.name}</p>
          <Badge variant="outline" className="text-[10px] capitalize">
            {contact.kind}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {contact.phone}
          {contact.area ? ` · ${contact.area}` : ""}
          {contact.subtitle ? ` · ${contact.subtitle}` : ""}
        </p>
      </div>
      <Button size="sm" className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe57]" onClick={onSend}>
        <ExternalLink className="h-3.5 w-3.5" />
        Send WhatsApp
      </Button>
    </div>
  )
}
