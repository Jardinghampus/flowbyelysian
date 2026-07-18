"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { defaultOutreachMessage, openWhatsApp } from "@/lib/whatsapp"
import { toast } from "sonner"

type ListingContactButtonProps = {
  phone?: string | null
  contactName?: string | null
  propertyTitle?: string | null
  agentName?: string | null
  size?: "sm" | "default" | "icon"
  className?: string
  label?: string
}

export function ListingContactButton({
  phone,
  contactName,
  propertyTitle,
  agentName,
  size = "sm",
  className,
  label = "Contact",
}: ListingContactButtonProps) {
  if (!phone) return null

  return (
    <Button
      type="button"
      size={size}
      variant="default"
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        const ok = openWhatsApp({
          phone,
          message: defaultOutreachMessage({
            contactName,
            propertyTitle,
            agentName,
          }),
        })
        if (!ok) toast.error("No valid WhatsApp number on this contact")
      }}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
