"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { Send, Bot, User, Sparkles, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

// Sample listings data - in production this would come from your state/API
const sampleListings = [
  {
    title: "Luxury Villa with Pool",
    area: "Emirates Hills",
    type: "villa",
    transactionType: "sale",
    price: 15000000,
    size: 8500,
    bedrooms: 5,
    status: "live",
    ownerName: "Ahmed Hassan",
    notes: "Corner plot, upgraded kitchen, private pool",
  },
  {
    title: "Modern Apartment Downtown",
    area: "Downtown Dubai",
    type: "apartment",
    transactionType: "rent",
    price: 180000,
    size: 1800,
    bedrooms: 2,
    status: "live",
    ownerName: "Sarah Miller",
    notes: "Burj Khalifa view, high floor, yearly rent",
  },
  {
    title: "Family Villa in Murooj",
    area: "Al Murooj",
    type: "villa",
    transactionType: "sale",
    price: 8500000,
    size: 5200,
    bedrooms: 4,
    status: "pocket",
    ownerName: "Ahmed Hassan",
    notes: "Quiet community, near school, motivated seller",
  },
  {
    title: "Penthouse Marina",
    area: "Dubai Marina",
    type: "penthouse",
    transactionType: "rent",
    price: 450000,
    size: 4200,
    bedrooms: 3,
    status: "live",
    ownerName: "Omar Khan",
    notes: "Full sea view, private terrace, luxury finish",
  },
  {
    title: "Townhouse Arabian Ranches",
    area: "Arabian Ranches",
    type: "townhouse",
    transactionType: "sale",
    price: 5200000,
    size: 3800,
    bedrooms: 4,
    status: "live",
    ownerName: "Sarah Miller",
    notes: "Community pool access, landscaped garden",
  },
]

const suggestedQuestions = [
  "What are the RERA regulations for renting in Dubai?",
  "Show me villas for sale under 10M AED",
  "What is the transfer fee for buying property?",
  "Can foreigners buy property in Dubai Marina?",
  "What apartments are available for rent?",
  "Explain the Ejari registration process",
]

export default function AIAssistantPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          listings: sampleListings,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantMessage.content += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m
            )
          )
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    setShowSuggestions(false)
  }

  const clearChat = () => {
    setMessages([])
    setShowSuggestions(true)
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              RERA Assistant
            </h1>
            <p className="text-muted-foreground">
              AI-powered assistant for Dubai real estate regulations and listings
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-[600px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat
            </CardTitle>
            <CardDescription>
              Ask about RERA regulations, property laws, or search listings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && showSuggestions && (
                  <div className="space-y-4">
                    {/* Welcome Message */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm">
                            Hello! I&apos;m your RERA Assistant. I can help you with:
                          </p>
                          <ul className="mt-2 text-sm list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Dubai real estate regulations and laws</li>
                            <li>RERA registration and compliance</li>
                            <li>Tenancy laws and Ejari registration</li>
                            <li>Property transfer fees and procedures</li>
                            <li>Searching available listings</li>
                            <li>Freehold areas and ownership rules</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Questions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Try asking:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-2 px-3"
                            onClick={() => handleSuggestedQuestion(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Listings Preview */}
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Available Listings ({sampleListings.length})
                      </p>
                      <div className="grid gap-2">
                        {sampleListings.slice(0, 3).map((listing, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                          >
                            <div>
                              <p className="font-medium">{listing.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {listing.area} - {listing.bedrooms} BR - {listing.size.toLocaleString()} sqft
                              </p>
                            </div>
                            <Badge variant={listing.transactionType === "sale" ? "default" : "secondary"}>
                              {listing.transactionType === "sale"
                                ? `AED ${(listing.price / 1000000).toFixed(1)}M`
                                : `AED ${(listing.price / 1000).toFixed(0)}K/yr`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 rounded-lg p-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about RERA regulations or search listings..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
