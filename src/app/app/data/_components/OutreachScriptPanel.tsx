"use client"

import { useState, useCallback } from "react"
import { Copy, Check, Pin, PinOff, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface OutreachScriptPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerName: string
  ownerArea: string
  agentName: string
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
      preview: "Hi {name}, I have a qualified buyer looking in {area}…",
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
      preview: "There was a notable sale in {area} I thought you'd want to know…",
      message:
        "Hi {name} 👋 {agent} again — there was a notable transaction in {area} I thought you'd want to know about. It could be very relevant for your property. Would you like me to share the details?",
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
      label: "Complimentary Valuation",
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
    .replace(/\{name\}/g, name)
    .replace(/\{area\}/g, area)
    .replace(/\{agent\}/g, agent)
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
        "bg-neutral-900 border-neutral-800 hover:border-[#C9A84C]/60 hover:bg-neutral-800",
        copied && "border-emerald-500/60 bg-emerald-500/5"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-300">{script.label}</span>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full transition-all",
            copied
              ? "bg-emerald-500 text-white"
              : "bg-neutral-800 text-neutral-500 group-hover:bg-[#C9A84C]/20 group-hover:text-[#C9A84C]"
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
  ownerName,
  ownerArea,
  agentName,
}: OutreachScriptPanelProps) {
  const [isPinned, setIsPinned] = useState(false)

  const handleCopy = useCallback(() => {
    toast.success("Copied to clipboard")
    if (!isPinned) {
      setTimeout(() => onOpenChange(false), 400)
    }
  }, [isPinned, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm p-0 gap-0 bg-neutral-950 border-neutral-800 shadow-2xl"
        // Remove the default close button — we have our own
        onInteractOutside={isPinned ? (e) => e.preventDefault() : undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
          <Zap className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span className="text-sm font-semibold text-white">Message Scripts</span>
          <span className="ml-1 text-xs text-neutral-500 truncate max-w-[100px]">{ownerName}</span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-full",
                isPinned
                  ? "text-[#C9A84C] hover:text-[#C9A84C]/80"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
              onClick={() => setIsPinned((p) => !p)}
              title={isPinned ? "Unpin — close after copy" : "Pin — stay open after copy"}
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

        {/* Pin hint */}
        <div className={cn(
          "px-4 py-1.5 text-[10px] border-b border-neutral-800/50 transition-colors",
          isPinned ? "text-[#C9A84C]/70 bg-[#C9A84C]/5" : "text-neutral-600"
        )}>
          {isPinned ? "Pinned — panel stays open after copying" : "Click a card to copy · Pin to keep open"}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cold" className="w-full">
          <TabsList className="w-full rounded-none border-b border-neutral-800 bg-transparent h-9 px-4 gap-1">
            <TabsTrigger
              value="cold"
              className="h-7 rounded-md px-3 text-xs data-[state=active]:bg-[#C9A84C]/15 data-[state=active]:text-[#C9A84C] text-neutral-500"
            >
              Cold Outreach
            </TabsTrigger>
            <TabsTrigger
              value="followup"
              className="h-7 rounded-md px-3 text-xs data-[state=active]:bg-[#C9A84C]/15 data-[state=active]:text-[#C9A84C] text-neutral-500"
            >
              Follow Up
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="h-7 rounded-md px-3 text-xs data-[state=active]:bg-[#C9A84C]/15 data-[state=active]:text-[#C9A84C] text-neutral-500"
            >
              Custom
            </TabsTrigger>
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
