"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MessageCircle, Briefcase, X, RefreshCw, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Account = "personal" | "business" | null

const WA_URL = "https://web.whatsapp.com"

const ACCOUNT_LABELS: Record<NonNullable<Account>, { label: string; color: string; bg: string }> = {
  personal: { label: "Personal", color: "text-[#25D366]", bg: "bg-[#25D366]" },
  business: { label: "Business", color: "text-[#128C7E]", bg: "bg-[#128C7E]" },
}

export default function WhatsAppPage() {
  const panelRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [active, setActive] = useState<Account>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Clean up popup and poll on unmount
  useEffect(() => {
    return () => {
      pollRef.current && clearInterval(pollRef.current)
      popupRef.current?.close()
    }
  }, [])

  const positionPopup = useCallback(() => {
    if (!popupRef.current || popupRef.current.closed || !panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    const screenLeft = window.screenX + rect.left
    const screenTop = window.screenY + (window.outerHeight - window.innerHeight) + rect.top
    try {
      popupRef.current.moveTo(Math.round(screenLeft), Math.round(screenTop))
      popupRef.current.resizeTo(Math.round(rect.width), Math.round(rect.height))
    } catch {
      // SecurityError if popup navigated to different origin – ignore
    }
  }, [])

  const closePanel = useCallback(() => {
    pollRef.current && clearInterval(pollRef.current)
    popupRef.current?.close()
    popupRef.current = null
    setIsOpen(false)
    setActive(null)
  }, [])

  const openPanel = useCallback((account: Account) => {
    if (!account) return

    // If same account already open, just focus it
    if (isOpen && active === account && popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
      return
    }

    // Close existing popup if switching accounts
    popupRef.current?.close()
    pollRef.current && clearInterval(pollRef.current)

    const rect = panelRef.current?.getBoundingClientRect()
    const w = rect ? Math.round(rect.width) : 420
    const h = rect ? Math.round(rect.height) : window.innerHeight
    const left = rect
      ? Math.round(window.screenX + rect.left)
      : Math.round(window.screenX + window.innerWidth - w)
    const top = rect
      ? Math.round(window.screenY + (window.outerHeight - window.innerHeight) + rect.top)
      : Math.round(window.screenY)

    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      "toolbar=no",
      "menubar=no",
      "location=no",
      "status=no",
      "scrollbars=yes",
      "resizable=no",
    ].join(",")

    const popup = window.open(WA_URL, `zflow_whatsapp_${account}`, features)
    if (!popup) {
      // Blocked by popup blocker – fall back to new tab
      window.open(WA_URL, "_blank")
      return
    }

    popupRef.current = popup
    setActive(account)
    setIsOpen(true)
    popup.focus()

    // Poll to detect if user closes the popup manually
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        pollRef.current && clearInterval(pollRef.current)
        setIsOpen(false)
        setActive(null)
        popupRef.current = null
      }
    }, 800)
  }, [active, isOpen])

  // Reposition popup when window resizes
  useEffect(() => {
    if (!isOpen) return
    const handler = () => positionPopup()
    window.addEventListener("resize", handler)
    window.addEventListener("scroll", handler)
    return () => {
      window.removeEventListener("resize", handler)
      window.removeEventListener("scroll", handler)
    }
  }, [isOpen, positionPopup])

  const refocusPopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      positionPopup()
      popupRef.current.focus()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -mx-4 lg:-mx-6 overflow-hidden">
      {/* ── LEFT: controls ── */}
      <div className="flex flex-col w-64 shrink-0 border-r bg-muted/30 p-5 gap-5">
        <div>
          <h1 className="text-lg font-bold tracking-tight">WhatsApp</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Öppna ett konto i panelen till höger
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <AccountButton
            label="Personal"
            icon={MessageCircle}
            color="#25D366"
            active={active === "personal" && isOpen}
            onClick={() => openPanel("personal")}
          />
          <AccountButton
            label="Business"
            icon={Briefcase}
            color="#128C7E"
            active={active === "business" && isOpen}
            onClick={() => openPanel("business")}
          />
        </div>

        {isOpen && active && (
          <div className="flex flex-col gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {ACCOUNT_LABELS[active].label} är öppen
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-xs h-8"
              onClick={refocusPopup}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Flytta till panel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-xs h-8"
              onClick={() => {
                popupRef.current?.location.reload()
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Uppdatera
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-xs h-8 text-destructive hover:text-destructive"
              onClick={closePanel}
            >
              <X className="h-3.5 w-3.5" />
              Stäng
            </Button>
          </div>
        )}
      </div>

      {/* ── RIGHT: panel area ── */}
      <div ref={panelRef} className="flex-1 relative bg-muted/10">
        {!isOpen ? (
          <Idle onOpen={openPanel} />
        ) : (
          <ActiveOverlay account={active} onRefocus={refocusPopup} />
        )}
      </div>
    </div>
  )
}

function AccountButton({
  label,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string
  icon: React.ElementType
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all",
        active
          ? "border-transparent text-white"
          : "border-border bg-background hover:bg-muted"
      )}
      style={active ? { backgroundColor: color, borderColor: color } : {}}
    >
      <Icon className="h-4 w-4 shrink-0" style={active ? {} : { color }} />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>
          WhatsApp {label}
        </p>
      </div>
      {active && (
        <Badge className="ml-auto bg-white/20 text-white text-[10px]">
          Aktiv
        </Badge>
      )}
    </button>
  )
}

function Idle({ onOpen }: { onOpen: (a: Account) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl bg-[#25D366]/10 flex items-center justify-center">
          <MessageCircle className="h-12 w-12 text-[#25D366]" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-[#128C7E]/10 flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-[#128C7E]" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">WhatsApp-panel</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Välj ett konto till vänster. WhatsApp öppnas direkt i detta område — skanna QR-koden en gång, sedan sparas sessionen.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onOpen("personal")}
          className="gap-2"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-4 w-4" />
          Öppna Personal
        </Button>
        <Button
          onClick={() => onOpen("business")}
          variant="outline"
          className="gap-2 border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E]/10"
        >
          <Briefcase className="h-4 w-4" />
          Öppna Business
        </Button>
      </div>
    </div>
  )
}

function ActiveOverlay({
  account,
  onRefocus,
}: {
  account: Account
  onRefocus: () => void
}) {
  if (!account) return null
  const info = ACCOUNT_LABELS[account]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: account === "personal" ? "#25D366" : "#128C7E" }}
      >
        {account === "personal" ? (
          <MessageCircle className="h-8 w-8 text-white" />
        ) : (
          <Briefcase className="h-8 w-8 text-white" />
        )}
      </div>
      <div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">WhatsApp {info.label} är öppen</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          Panelen är öppen bredvid fönstret. Klicka nedan om den hamnat ur position.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRefocus} className="gap-2">
        <Maximize2 className="h-3.5 w-3.5" />
        Snäpp tillbaka panelen
      </Button>
    </div>
  )
}
