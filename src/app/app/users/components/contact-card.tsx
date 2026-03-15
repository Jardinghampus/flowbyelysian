"use client"

import { useState } from "react"
import { Phone, Mail, MapPin, MessageSquare, Copy, Check, ExternalLink, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export interface Contact {
  id: number
  name: string
  area: string
  role: "Leasing" | "Sales"
  whatsapp: string
  title: string
  email?: string
  notes?: string
  tags?: string[]
  lastContact?: string
  dealCount?: number
}

interface ContactCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: number) => void
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [copied, setCopied] = useState(false)

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(contact.whatsapp)
    setCopied(true)
    toast.success("Phone copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const roleColor = contact.role === "Sales"
    ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/10">
            <AvatarFallback className="text-sm font-semibold bg-primary/5">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{contact.title}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(contact)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(contact.id)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className={`text-[10px] ${roleColor}`}>
            {contact.role}
          </Badge>
          <Badge variant="outline" className="text-[10px] flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            {contact.area}
          </Badge>
          {contact.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats row */}
        {(contact.dealCount !== undefined || contact.lastContact) && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {contact.dealCount !== undefined && (
              <span>{contact.dealCount} deal{contact.dealCount !== 1 ? "s" : ""}</span>
            )}
            {contact.lastContact && (
              <span>Last: {contact.lastContact}</span>
            )}
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 rounded-md px-2 py-1.5">
            {contact.notes}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`, "_blank")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            WhatsApp
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => window.open(`tel:${contact.whatsapp}`, "_self")}
          >
            <Phone className="h-3.5 w-3.5 mr-1" />
            Call
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={copyPhone}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {contact.email && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.open(`mailto:${contact.email}`, "_self")}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
