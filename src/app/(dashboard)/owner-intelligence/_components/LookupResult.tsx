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
  resolved: { label: "Resolved", color: "text-green-400 bg-green-400/10", border: "border-l-[#C8922A]" },
  partial: { label: "Partial", color: "text-amber-400 bg-amber-400/10", border: "border-l-amber-500/30" },
  failed: { label: "Failed", color: "text-red-400 bg-red-400/10", border: "border-l-red-500/30" },
  pending: { label: "Pending", color: "text-blue-400 bg-blue-400/10", border: "border-l-blue-500/30" },
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
      className="p-1 rounded hover:bg-white/[0.06] transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-white/30 hover:text-white/60" />
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
        "rounded-lg border border-white/[0.07] bg-[#111111] border-l-[3px] overflow-hidden",
        status.border
      )}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          {contact.portal && <PortalBadge portal={contact.portal} />}
          <span className={cn("px-2 py-0.5 text-[10px] font-mono font-semibold rounded uppercase tracking-wider", status.color)}>
            {status.label}
          </span>
          {cached && (
            <span className="px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/[0.04] rounded">
              Cached {contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString() : ""}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-6">
        {/* Property Info */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-white/30">
            Property
          </h4>
          {contact.propertyName && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Building2 className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              {contact.propertyName}
            </div>
          )}
          {contact.buildingName && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Building2 className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              {contact.buildingName}
              {contact.unitNumber && (
                <span className="font-mono text-[#C8922A]">#{contact.unitNumber}</span>
              )}
            </div>
          )}
          {contact.zone && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <MapPin className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              {contact.zone}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            {contact.propertySize && (
              <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                <Maximize2 className="h-3 w-3" /> {contact.propertySize.toLocaleString()} sqft
              </span>
            )}
            {contact.propertyValue && (
              <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                <DollarSign className="h-3 w-3" /> AED{" "}
                {contact.propertyValue >= 1000000
                  ? `${(contact.propertyValue / 1000000).toFixed(1)}M`
                  : contact.propertyValue.toLocaleString()}
              </span>
            )}
            {contact.rooms && (
              <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                <Hash className="h-3 w-3" /> {contact.rooms} rooms
              </span>
            )}
          </div>
        </div>

        {/* Owner Contact */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-white/30">
            Owner
          </h4>

          {contact.ownerName ? (
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <User className="h-3.5 w-3.5 text-[#C8922A] flex-shrink-0" />
              {contact.ownerName}
            </div>
          ) : (
            <div className="text-sm text-white/20 italic">No owner data found</div>
          )}

          {contact.ownerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              <span className="font-mono text-white/80">{formatPhone(contact.ownerPhone)}</span>
              <span className="text-[9px] font-mono text-white/20 uppercase">Primary</span>
              <CopyButton text={contact.ownerPhone} label="Phone" />
              <a
                href={whatsAppUrl(contact.ownerPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-green-500/10 transition-colors"
                title="Open in WhatsApp"
              >
                <MessageSquare className="h-3.5 w-3.5 text-green-500/60 hover:text-green-400" />
              </a>
            </div>
          )}

          {contact.ownerPhone2 && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              <span className="font-mono text-white/80">{formatPhone(contact.ownerPhone2)}</span>
              <span className="text-[9px] font-mono text-white/20 uppercase">Secondary</span>
              <CopyButton text={contact.ownerPhone2} label="Phone 2" />
              <a
                href={whatsAppUrl(contact.ownerPhone2)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-green-500/10 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-green-500/60 hover:text-green-400" />
              </a>
            </div>
          )}

          {contact.ownerEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
              <span className="font-mono text-white/80">{contact.ownerEmail}</span>
              <CopyButton text={contact.ownerEmail} label="Email" />
            </div>
          )}

          {contact.ownerDate && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="font-mono">Owner since {new Date(contact.ownerDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
