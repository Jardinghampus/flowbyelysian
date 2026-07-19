"use client"

import { useState, useEffect } from "react"
import { Mail } from "./components/mail"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail as MailIcon, Loader2, LogOut } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

interface GmailMessage {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
}

interface GmailData {
  connected: boolean
  email?: string
  messages?: GmailMessage[]
  error?: string
}

export default function MailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [gmailData, setGmailData] = useState<GmailData | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const searchParams = useSearchParams()

  // Check for connection status from URL params
  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("error")

    if (connected === "true") {
      toast.success("Gmail Connected", {
        description: "Your Gmail account has been connected successfully.",
      })
    }

    if (error) {
      toast.error("Connection Failed", {
        description: error === "token_error" ? "Failed to authenticate with Google." : error,
      })
    }
  }, [searchParams])

  // Fetch Gmail data
  useEffect(() => {
    const fetchGmailData = async () => {
      try {
        const response = await fetch("/api/gmail/messages")
        const data = await response.json()
        setGmailData(data)
      } catch {
        setGmailData({ connected: false })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGmailData()
  }, [])

  const handleConnect = () => {
    setIsConnecting(true)
    window.location.href = "/api/gmail/auth"
  }

  const handleDisconnect = async () => {
    try {
      await fetch("/api/gmail/disconnect", { method: "POST" })
      setGmailData({ connected: false })
      toast.success("Gmail Disconnected", {
        description: "Your Gmail account has been disconnected.",
      })
    } catch {
      toast.error("Error", {
        description: "Failed to disconnect Gmail account.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not connected - show connection screen
  if (!gmailData?.connected) {
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MailIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect Your Gmail</CardTitle>
            <CardDescription>
              Connect your Gmail account to view and manage your emails directly from Zaylo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Read and organize your emails
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Send emails directly from Zaylo
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Secure OAuth 2.0 authentication
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Connect with Google
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We only request read and send permissions. Your data is secure.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Connected - show mail interface
  const accounts = [
    {
      label: gmailData.email?.split("@")[0] || "Gmail",
      email: gmailData.email || "",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
  ]

  // Transform Gmail messages to the Mail component format
  const mails = (gmailData.messages || []).map((msg) => ({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    text: msg.text,
    date: msg.date,
    read: msg.read,
    labels: msg.labels.filter((l) => !["INBOX", "UNREAD", "CATEGORY_PERSONAL", "CATEGORY_UPDATES", "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_FORUMS"].includes(l)),
  }))

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b">
        <div className="flex items-center gap-2">
          <MailIcon className="h-5 w-5 text-primary" />
          <span className="font-medium">{gmailData.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
      <div className="h-[calc(100vh-8rem)] px-4 md:px-6">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={[20, 32, 48]}
          defaultCollapsed={false}
          navCollapsedSize={4}
        />
      </div>
    </div>
  )
}
