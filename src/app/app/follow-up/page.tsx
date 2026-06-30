"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  User,
  Building2,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Channel = "whatsapp" | "email" | "sms"
type MessageTone = "friendly" | "professional" | "urgent" | "followup"
type Scenario = "first_contact" | "price_drop" | "new_listing" | "buyer_match" | "market_update" | "custom"

const scenarios: { value: Scenario; label: string; desc: string }[] = [
  { value: "first_contact", label: "First Contact", desc: "Initial outreach to a new owner" },
  { value: "buyer_match", label: "Buyer Match", desc: "You have a qualified buyer for their property" },
  { value: "price_drop", label: "Price Drop Alert", desc: "Suggesting a price adjustment" },
  { value: "new_listing", label: "New Listing Intro", desc: "Introducing a new listing to your database" },
  { value: "market_update", label: "Market Update", desc: "Share market insights to build rapport" },
  { value: "custom", label: "Custom", desc: "Write your own context" },
]

const sampleMessages: Record<Channel, string> = {
  whatsapp: `Hi Ahmed,

I'm Sarah from Elysian Properties. I came across your unit in Marina Gate Tower 2 — beautiful property!

I have a pre-qualified buyer looking specifically for a 3BR in Dubai Marina with sea views, and your unit matches perfectly. They're ready to move quickly with a cash offer.

Would you be open to a brief call this week to discuss? I can share the current market valuation for your building — 3BRs in Marina Gate have appreciated 14% this quarter.

Best regards,
Sarah`,
  email: `Subject: Qualified Buyer Interested in Your Marina Gate Unit

Dear Ahmed,

I hope this message finds you well. My name is Sarah from Elysian Properties, and I'm reaching out regarding your 3-bedroom unit in Marina Gate Tower 2, Dubai Marina.

I am currently representing a pre-qualified buyer who has expressed strong interest in properties matching your unit's specifications — specifically a 3-bedroom apartment with sea views in Dubai Marina. The buyer has been vetted financially and is prepared to proceed with a cash transaction.

Key market context for your consideration:
• 3BR units in Marina Gate have seen a 14% price appreciation this quarter
• Average days on market for comparable units: 23 days
• Current demand-to-supply ratio in Marina: 3.2:1

I would welcome the opportunity to arrange a brief call at your convenience to discuss how I might be of service.

Warm regards,
Sarah
Elysian Properties
+971 XX XXX XXXX`,
  sms: `Hi Ahmed, this is Sarah from Elysian Properties. I have a cash buyer looking for a 3BR in Marina Gate — your unit is a perfect match. Can I call you briefly this week? 3BRs in your building are up 14% this quarter.`,
}

export default function FollowUpPage() {
  const [ownerName, setOwnerName] = useState("")
  const [propertyDesc, setPropertyDesc] = useState("")
  const [area, setArea] = useState("")
  const [scenario, setScenario] = useState<Scenario>("first_contact")
  const [channel, setChannel] = useState<Channel>("whatsapp")
  const [tone, setTone] = useState<MessageTone>("professional")
  const [customContext, setCustomContext] = useState("")
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!ownerName || !propertyDesc) {
      toast.error("Owner name and property description are required")
      return
    }

    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setMessage(sampleMessages[channel])
    setGenerating(false)
    toast.success("Message drafted!")
  }

  const handleCopy = async () => {
    if (!message) return
    await navigator.clipboard.writeText(message)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1500))
    setGenerating(false)
    toast.success("Regenerated with new variation")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Smart Follow-up Drafter
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-crafted outreach messages for WhatsApp, email, and SMS. Personalized for each owner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Left: Inputs */}
        <div className="space-y-5">
          {/* Owner & Property */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Owner & Property
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Owner Name *</Label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ahmed Hassan"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Area</Label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Dubai Marina"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Property Description *</Label>
              <Input
                value={propertyDesc}
                onChange={(e) => setPropertyDesc(e.target.value)}
                placeholder="3BR apartment in Marina Gate Tower 2, sea view"
                className="text-sm"
              />
            </div>
          </div>

          {/* Scenario */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Scenario</h3>
            <div className="grid grid-cols-2 gap-2">
              {scenarios.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setScenario(s.value)}
                  className={cn(
                    "text-left px-3 py-2.5 rounded-lg text-xs transition-colors border",
                    scenario === s.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{s.label}</div>
                  <div className={cn(
                    "text-[10px] mt-0.5",
                    scenario === s.value ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
            {scenario === "custom" && (
              <Textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Describe the context for this follow-up..."
                className="text-sm h-20 resize-none"
              />
            )}
          </div>

          {/* Channel & Tone */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Channel</Label>
              <div className="flex gap-2">
                {([
                  { value: "whatsapp" as Channel, label: "WhatsApp", icon: MessageSquare },
                  { value: "email" as Channel, label: "Email", icon: Mail },
                  { value: "sms" as Channel, label: "SMS", icon: Phone },
                ]).map((ch) => (
                  <button
                    key={ch.value}
                    onClick={() => setChannel(ch.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors border",
                      channel === ch.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    <ch.icon className="h-3.5 w-3.5" />
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tone</Label>
              <div className="flex gap-2">
                {([
                  { value: "friendly" as MessageTone, label: "Friendly" },
                  { value: "professional" as MessageTone, label: "Professional" },
                  { value: "urgent" as MessageTone, label: "Urgent" },
                  { value: "followup" as MessageTone, label: "Follow-up" },
                ]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border",
                      tone === t.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !ownerName || !propertyDesc}
            className="w-full h-11"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Draft Message
              </>
            )}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          {!message && !generating && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Your AI-drafted message will appear here.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Personalized based on owner data, property details, and your chosen scenario.
              </p>
            </div>
          )}

          {generating && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Crafting personalized message...</p>
            </div>
          )}

          {message && !generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {channel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      To: {ownerName || "Owner"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegenerate}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[300px] text-sm border-0 p-0 resize-none focus-visible:ring-0 shadow-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 h-10" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open in WhatsApp
                </Button>
                <Button className="flex-1 h-10">
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
