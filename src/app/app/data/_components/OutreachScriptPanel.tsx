"use client"

import { useState, useCallback } from "react"
import { Copy, Check, Pin, PinOff, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface OutreachScriptPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerName?: string
  ownerArea?: string
  agentName?: string
}

type Script = { id: string; label: string; preview: string; message: string }

const SCRIPTS: Record<string, Script[]> = {
  cold: [
    {
      id: "c1",
      label: "Quick Intro",
      preview: "Hi {name} 👋 I'm {agent} from Flow by Elysian…",
      message:
        "Hi {name} 👋 I'm {agent} from Flow by Elysian. I specialise in {area} and would love to connect. Would you be open to a quick chat about the current market? No pressure at all 🙏",
    },
    {
      id: "c2",
      label: "Active Buyer",
      preview: "I have a qualified buyer looking in {area}…",
      message:
        "Hi {name}, this is {agent} from Flow by Elysian. I have a qualified buyer actively looking in {area} — would you be open to a conversation about your property? Happy to provide a free market valuation with no obligation.",
    },
    {
      id: "c3",
      label: "Market Update",
      preview: "{area} is seeing strong activity this quarter…",
      message:
        "Hi {name} 👋 {agent} here from Flow by Elysian. {area} has been seeing excellent activity this quarter — prices are very much in favour of owners right now. I'd love to share a free valuation whenever suits you!",
    },
    {
      id: "c4",
      label: "Soft Connect",
      preview: "I'd love to keep you in the loop with {area} updates…",
      message:
        "Hi {name}! I'm {agent}, a property consultant focusing on {area}. I'd love to keep you in the loop with market updates — no pressure, just thought it'd be useful to connect 😊",
    },
  ],
  followup: [
    {
      id: "f1",
      label: "Gentle Follow-up",
      preview: "Just following up on my last message…",
      message:
        "Hi {name} 👋 Just following up on my last message — totally understand if the timing isn't right. Whenever you're ready to discuss your property in {area}, I'm here. {agent} 🙏",
    },
    {
      id: "f2",
      label: "Post-Conversation",
      preview: "Really enjoyed speaking with you earlier…",
      message:
        "Hi {name}, {agent} here — really enjoyed speaking with you earlier! As promised, I'm putting together the market overview for {area} and will send it over shortly. Feel free to reach out anytime.",
    },
    {
      id: "f3",
      label: "Market Trigger",
      preview: "There was a notable transaction in {area}…",
      message:
        "Hi {name} 👋 {agent} again — there was a notable transaction in {area} I thought you'd want to know about. Could be very relevant for your property. Would you like me to share the details?",
    },
    {
      id: "f4",
      label: "Long-term Check-in",
      preview: "It's been a while — just wanted to check in…",
      message:
        "Hi {name}! {agent} from Flow by Elysian here. It's been a little while — just wanted to check in and see if anything has changed with your plans for {area}. Happy to connect anytime 😊",
    },
  ],
  custom: [
    {
      id: "x1",
      label: "Two-minute Ask",
      preview: "Do you have 2 minutes to chat about your property?",
      message:
        "Hi {name} 👋 {agent} here from Flow by Elysian. Just reaching out about your property in {area} — do you have 2 minutes for a quick chat?",
    },
    {
      id: "x2",
      label: "Free Valuation",
      preview: "I'd love to give you a complimentary property update…",
      message:
        "Hi {name}, {agent} from Flow by Elysian. I specialise in {area} and I'd love to give you a complimentary property update — no obligation, just useful market insight for you as an owner.",
    },
    {
      id: "x3",
      label: "Direct Ask",
      preview: "Are you open to exploring your options?",
      message:
        "Hi {name}, quick message from {agent} at Flow by Elysian. Are you open to exploring your options with your property in {area}? Demand is strong right now and it could be a great time.",
    },
    {
      id: "x4",
      label: "Warm Opener",
      preview: "I have some exciting updates that might interest you…",
      message:
        "Hi {name} 😊 This is {agent} from Flow by Elysian, reaching out about the market in {area}. I have some exciting updates that might interest you as an owner — would love to share!",
    },
  ],
}

function fill(template: string, name: string, area: string, agent: string) {
  return template
    .replace(/\{name\}/g, name || "there")
    .replace(/\{area\}/g, area || "your area")
    .replace(/\{agent\}/g, agent || "your agent")
}

function ScriptCard({
  script,
  ownerName,
  ownerArea,
  agentName,
  onCopy,
}: {
  script: Script
  ownerName: string
  ownerArea: string
  agentName: string
  onCopy: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const text = fill(script.message, ownerName, ownerArea, agentName)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      onCopy()
    })
  }, [script.message, ownerName, ownerArea, agentName, onCopy])

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all duration-150",
        "bg-neutral-900 border-neutral-800 hover:border-[#4B8EDB]/50 hover:bg-neutral-800/80",
        copied && "border-emerald-500/50 bg-emerald-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-neutral-200 leading-none">{script.label}</span>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all",
            copied
              ? "bg-emerald-500 text-white"
              : "bg-neutral-800 text-neutral-500 group-hover:bg-[#4B8EDB]/20 group-hover:text-[#4B8EDB]"
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-neutral-500 line-clamp-2">
        {fill(script.preview, ownerName, ownerArea, agentName)}
      </p>
    </button>
  )
}

export function OutreachScriptPanel({
  open,
  onOpenChange,
  ownerName: ownerNameProp,
  ownerArea: ownerAreaProp,
  agentName: agentNameProp,
}: OutreachScriptPanelProps) {
  const [isPinned, setIsPinned] = useState(false)
  // Local editable fields — used when no owner is pre-loaded
  const [localName, setLocalName] = useState("")
  const [localArea, setLocalArea] = useState("")

  const isGlobal = !ownerNameProp
  const ownerName = ownerNameProp ?? localName
  const ownerArea = ownerAreaProp ?? localArea
  const agentName = agentNameProp ?? ""

  const handleCopy = useCallback(() => {
    toast.success("Copied to clipboard")
    if (!isPinned) {
      setTimeout(() => onOpenChange(false), 350)
    }
  }, [isPinned, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm p-0 gap-0 bg-neutral-950 border-neutral-800 shadow-2xl"
        onInteractOutside={isPinned ? (e) => e.preventDefault() : undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
          <Zap className="h-3.5 w-3.5 text-[#4B8EDB] shrink-0" />
          <span className="text-sm font-semibold text-white">Message Scripts</span>
          {ownerNameProp && (
            <span className="ml-1 text-xs text-neutral-500 truncate">{ownerNameProp}</span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-full",
                isPinned
                  ? "text-[#4B8EDB] hover:text-[#4B8EDB]/80"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
              onClick={() => setIsPinned((p) => !p)}
              title={isPinned ? "Unpin — closes after copy" : "Pin — stays open after copy"}
            >
              {isPinned ? <Pin className="h-3.5 w-3.5 fill-current" /> : <PinOff className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-neutral-500 hover:text-neutral-300"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Global mode — inline name + area inputs */}
        {isGlobal && (
          <div className="px-4 py-2.5 border-b border-neutral-800 flex gap-2">
            <Input
              placeholder="Owner name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="h-7 text-xs bg-neutral-900 border-neutral-700 placeholder:text-neutral-600"
            />
            <Input
              placeholder="Area"
              value={localArea}
              onChange={(e) => setLocalArea(e.target.value)}
              className="h-7 text-xs bg-neutral-900 border-neutral-700 placeholder:text-neutral-600"
            />
          </div>
        )}

        {/* Pin hint */}
        <div className={cn(
          "px-4 py-1 text-[10px] border-b border-neutral-800/50",
          isPinned ? "text-[#4B8EDB]/70 bg-[#4B8EDB]/5" : "text-neutral-600"
        )}>
          {isPinned ? "Pinned — stays open after copying" : "Tap a card to copy · Pin to keep open"}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cold" className="w-full">
          <TabsList className="w-full rounded-none border-b border-neutral-800 bg-transparent h-9 px-3 gap-0.5">
            {[
              { value: "cold", label: "Cold Outreach" },
              { value: "followup", label: "Follow Up" },
              { value: "custom", label: "Custom" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex-1 h-7 rounded-md px-2 text-[11px] font-medium data-[state=active]:bg-[#4B8EDB]/15 data-[state=active]:text-[#4B8EDB] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(["cold", "followup", "custom"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0 p-3">
              <div className="grid grid-cols-2 gap-2">
                {SCRIPTS[tab].map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    ownerName={ownerName}
                    ownerArea={ownerArea}
                    agentName={agentName}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
