"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  MessageSquare,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type MarketplaceProperty } from "@/lib/data/marketplace-listings"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AIAdvisorProps {
  isOpen: boolean
  onClose: () => void
  listings: MarketplaceProperty[]
}

const suggestedQuestions = [
  "Best area for 5M AED budget?",
  "Highest rental yield communities?",
  "Off-market deals available?",
  "Best for families with kids?",
  "Investment under 2M AED?",
  "Palm vs Tilal Al Ghaf?",
]

export function AIAdvisor({ isOpen, onClose, listings }: AIAdvisorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/marketplace-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          listings: listings.map((l) => ({
            title: l.title,
            area: l.area,
            type: l.type,
            transactionType: l.transactionType,
            price: l.price,
            size: l.size,
            bedrooms: l.bedrooms,
            category: l.category,
            aiSummary: l.aiSummary,
            vacancy: l.vacancy,
          })),
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
              m.id === assistantMessage.id
                ? { ...m, content: assistantMessage.content }
                : m
            )
          )
        }
      }
    } catch {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 flex flex-col",
              "w-full sm:w-[400px] md:w-[420px]",
              "bg-background border-l border-border shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Advisor</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Budget & preference matching
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    {/* Welcome */}
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm font-medium mb-1.5">
                            Hi! I&apos;m your AI property advisor.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tell me your budget, preferences, or what you&apos;re
                            looking for and I&apos;ll recommend the best matches from
                            our marketplace.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Quick questions
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors"
                          >
                            {q}
                          </button>
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
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5 text-primary" />
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
                      <div className="whitespace-pre-wrap text-xs leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about budget, areas, yields..."
                  disabled={isLoading}
                  className="flex-1 text-sm h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Floating button to open advisor
export function AIAdvisorTrigger({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "fixed bottom-6 right-6 z-30",
        "h-14 w-14 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "hover:shadow-xl transition-shadow"
      )}
    >
      <MessageSquare className="h-6 w-6" />
    </motion.button>
  )
}
