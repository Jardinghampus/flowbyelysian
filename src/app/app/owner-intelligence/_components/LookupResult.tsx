"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Copy, Check, Phone, Mail, MessageSquare, Building2,
  MapPin, Maximize2, DollarSign, Hash, User, Calendar,
} from "lucide-react"
import { toast } from "sonner"
import type { OwnerContact, LookupStatus } from "@/types/owner-intelligence"
import { PortalBadge } from "./PortalBadge"
import { cn } from "@/lib/utils"

const statusConfig: Record<LookupStatus, { label: string; color: string; border: string }> = {
  resolved: { label: "Resolved", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15", border: "border-l-emerald-500" },
  partial: { label: "Partial", color: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15", border: "border-l-amber-500" },
  failed: { label: "Failed", color: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15", border: "border-l-red-500" },
  pending: { label: "Pending", color: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15", border: "border-l-blue-500" },
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      )}
    </button>
  )
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("971") && digits.length >= 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  return phone
}

function whatsAppUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`
}

export function LookupResult({
  contact,
  cached,
}: {
  contact: OwnerContact
  cached?: boolean
}) {
  const status = statusConfig[contact.lookupStatus]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-xl border bg-card border-l-[3px] overflow-hidden",
        status.border
      )}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          {contact.portal && <PortalBadge portal={contact.portal} />}
          <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider", status.color)}>
            {status.label}
          </span>
          {cached && (
            <span className="px-2 py-0.5 text-[10px] text-muted-foreground bg-muted rounded">
              Cached {contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString() : ""}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-6">
        {/* Property Info */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Property
          </h4>
          {contact.propertyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {contact.propertyName}
            </div>
          )}
          {contact.buildingName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {contact.buildingName}
              {contact.unitNumber && (
                <span className="font-semibold text-primary">#{contact.unitNumber}</span>
              )}
            </div>
          )}
          {contact.zone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {contact.zone}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            {contact.propertySize && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Maximize2 className="h-3 w-3" /> {contact.propertySize.toLocaleString()} sqft
              </span>
            )}
            {contact.propertyValue && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" /> AED{" "}
                {contact.propertyValue >= 1000000
                  ? `${(contact.propertyValue / 1000000).toFixed(1)}M`
                  : contact.propertyValue.toLocaleString()}
              </span>
            )}
            {contact.rooms && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" /> {contact.rooms} rooms
              </span>
            )}
          </div>
        </div>

        {/* Owner Contact */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Owner
          </h4>

          {contact.ownerName ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              {contact.ownerName}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">No owner data found</div>
          )}

          {contact.ownerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-mono">{formatPhone(contact.ownerPhone)}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Primary</span>
              <CopyButton text={contact.ownerPhone} label="Phone" />
              <a
                href={whatsAppUrl(contact.ownerPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                title="Open in WhatsApp"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </a>
            </div>
          )}

          {contact.ownerPhone2 && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-mono">{formatPhone(contact.ownerPhone2)}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Secondary</span>
              <CopyButton text={contact.ownerPhone2} label="Phone 2" />
              <a
                href={whatsAppUrl(contact.ownerPhone2)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </a>
            </div>
          )}

          {contact.ownerEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-mono">{contact.ownerEmail}</span>
              <CopyButton text={contact.ownerEmail} label="Email" />
            </div>
          )}

          {contact.ownerDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              Owner since {new Date(contact.ownerDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
