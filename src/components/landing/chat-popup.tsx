"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileMenu } from "@/contexts/mobile-menu-context"
import { SentimentIndicator } from "@/components/sentiment-indicator"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export function ChatPopup() {
  const { isMenuOpen } = useMobileMenu()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `demo-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasWelcomed, setHasWelcomed] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !hasWelcomed) {
      setMessages([
        {
          role: "bot",
          content:
            "Hello! Welcome to Zaylo Marketplace.\n\nI can help you find your perfect property in Dubai. Tell me what you're looking for:\n\n\u2022 Location (Palm Jumeirah, Dubai Marina, etc.)\n\u2022 Number of bedrooms\n\u2022 Property type (villa, apartment)\n\nExample: '3 bedroom villa in Palm Jumeirah'",
          timestamp: new Date(),
        },
      ])
      setHasWelcomed(true)
    }
  }, [isOpen, hasWelcomed])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ])

    try {
      const response = await fetch("/api/chat/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMessage }),
      })

      const data = await response.json()

      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.response, timestamp: new Date() },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I couldn't connect. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Hide chat when mobile menu is open
  if (isMenuOpen) return null

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          >
            {/* CTA Label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2 rounded-full shadow-lg shadow-black/5 text-sm font-medium flex items-center gap-2 border border-neutral-100 dark:border-neutral-800"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Try our AI Assistant
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl shadow-neutral-900/20 dark:shadow-black/30 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white ring-2 ring-white dark:ring-neutral-900">
                1
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl shadow-black/10 dark:shadow-black/40 border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-neutral-900 dark:bg-neutral-950 px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Zaylo Assistant</h3>
                  <p className="text-xs text-white/40">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                >
                  {/* Sentiment Bar */}
                  {messages.length >= 4 && (
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      <SentimentIndicator messages={messages} compact />
                    </div>
                  )}

                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                            msg.role === "user"
                              ? "bg-neutral-900 dark:bg-white"
                              : "bg-gradient-to-br from-blue-500 to-violet-500"
                          )}
                        >
                          {msg.role === "user" ? (
                            <User className="h-3.5 w-3.5 text-white dark:text-neutral-900" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5",
                            msg.role === "user"
                              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                              : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-800"
                          )}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-neutral-900 px-4 py-3 border border-neutral-100 dark:border-neutral-800">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300 dark:bg-neutral-600 [animation-delay:0.1s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300 dark:bg-neutral-600 [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                    {["Palm Jumeirah villa", "Marina apartment", "Downtown 2BR"].map(
                      (prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(prompt)}
                          className="flex-shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          {prompt}
                        </button>
                      )
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
