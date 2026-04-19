"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MessageCircle, Briefcase, X, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Account = "personal" | "business"

const WA_URL = "https://web.whatsapp.com"
const POPUP_W = 420
const POPUP_H = 720

export default function WhatsAppPage() {
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    return () => {
      pollRef.current && clearInterval(pollRef.current)
    }
  }, [])

  const openPopup = useCallback((account: Account) => {
    if (isOpen && activeAccount === account && popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
      return
    }

    popupRef.current?.close()
    pollRef.current && clearInterval(pollRef.current)

    const left = window.screenX + window.outerWidth - POPUP_W - 12
    const top = window.screenY + Math.round((window.outerHeight - POPUP_H) / 2)

    const popup = window.open(
      WA_URL,
      `zflow_wa_${account}`,
      `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes`
    )

    if (!popup) {
      window.open(WA_URL, "_blank")
      return
    }

    popupRef.current = popup
    setActiveAccount(account)
    setIsOpen(true)
    popup.focus()

    pollRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        pollRef.current && clearInterval(pollRef.current)
        setIsOpen(false)
        setActiveAccount(null)
        popupRef.current = null
      }
    }, 500)
  }, [isOpen, activeAccount])

  const closePopup = useCallback(() => {
    pollRef.current && clearInterval(pollRef.current)
    popupRef.current?.close()
    popupRef.current = null
    setIsOpen(false)
    setActiveAccount(null)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#25D366]/10 mb-2">
          <MessageCircle className="h-8 w-8 text-[#25D366]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Öppnas som ett popup-fönster bredvid appen — precis som i Opera.
          Skanna QR-koden en gång, sedan sparas sessionen.
        </p>
      </div>

      {/* Account cards */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        <PopupCard
          label="Personal"
          icon={MessageCircle}
          color="#25D366"
          isActive={isOpen && activeAccount === "personal"}
          onClick={() => openPopup("personal")}
        />
        <PopupCard
          label="Business"
          icon={Briefcase}
          color="#128C7E"
          isActive={isOpen && activeAccount === "business"}
          onClick={() => openPopup("business")}
        />
      </div>

      {/* Active status bar */}
      {isOpen && activeAccount && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-muted/50">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm">
            WhatsApp {activeAccount === "personal" ? "Personal" : "Business"} är öppen
          </span>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Fokusera"
              onClick={() => popupRef.current?.focus()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Uppdatera"
              onClick={() => popupRef.current?.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              title="Stäng"
              onClick={closePopup}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function PopupCard({
  label,
  icon: Icon,
  color,
  isActive,
  onClick,
}: {
  label: string
  icon: React.ElementType
  color: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
        isActive
          ? "border-transparent text-white shadow-lg"
          : "border-border bg-background hover:bg-muted hover:border-muted-foreground/20"
      )}
      style={isActive ? { backgroundColor: color, borderColor: color } : {}}
    >
      <div
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
          isActive ? "bg-white/20" : ""
        )}
        style={!isActive ? { backgroundColor: `${color}15` } : {}}
      >
        <Icon className="h-5 w-5" style={isActive ? { color: "white" } : { color }} />
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className={cn("text-xs", isActive ? "text-white/80" : "text-muted-foreground")}>
          {isActive ? "Aktiv — klicka för att fokusera" : "Klicka för att öppna"}
        </p>
      </div>
    </button>
  )
}
