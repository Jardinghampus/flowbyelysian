"use client"

import { useState } from "react"
import { ExternalLink, MessageCircle, Briefcase, Monitor, ArrowRight, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const WHATSAPP_WEB_URL = "https://web.whatsapp.com"
const WHATSAPP_BUSINESS_URL = "https://web.whatsapp.com"

function WhatsAppCard({
  title,
  description,
  icon: Icon,
  url,
  badge: badgeText,
  color,
}: {
  title: string
  description: string
  icon: React.ElementType
  url: string
  badge: string
  color: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {badgeText}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full group"
          onClick={(e) => {
            e.stopPropagation()
            window.open(url, "_blank", "noopener,noreferrer")
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open WhatsApp Web
          <ArrowRight className={`ml-auto h-4 w-4 transition-transform ${isHovered ? "translate-x-0.5" : ""}`} />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground">
          Quick access to WhatsApp Web – connect with your clients directly
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WhatsAppCard
          title="WhatsApp Personal"
          description="Connect your personal WhatsApp account to communicate with clients and contacts"
          icon={MessageCircle}
          url={WHATSAPP_WEB_URL}
          badge="Personal"
          color="bg-[#25D366]"
        />
        <WhatsAppCard
          title="WhatsApp Business"
          description="Use your WhatsApp Business account for professional client communication"
          icon={Briefcase}
          url={WHATSAPP_BUSINESS_URL}
          badge="Business"
          color="bg-[#128C7E]"
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Desktop Widget</h3>
                  <p className="text-sm text-muted-foreground">
                    For a sidebar experience like Opera, use our Electron app
                  </p>
                </div>
              </div>
              <div className="pl-[52px] space-y-2">
                <p className="text-sm text-muted-foreground">Run locally:</p>
                <code className="block text-xs bg-background border rounded-lg p-3 font-mono">
                  cd electron-whatsapp && npm install && npm start
                </code>
                <p className="text-xs text-muted-foreground">
                  Persistent sessions, native notifications, sidebar toggle (<kbd className="px-1.5 py-0.5 rounded border bg-background text-xs">Ctrl+Shift+W</kbd>)
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">How it works</h3>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp Web mirrors your phone
                  </p>
                </div>
              </div>
              <ul className="pl-[52px] space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                <li>Scan the QR code with your phone</li>
                <li>Your messages sync in real-time</li>
                <li>Works with both Personal & Business accounts</li>
                <li>End-to-end encrypted</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
