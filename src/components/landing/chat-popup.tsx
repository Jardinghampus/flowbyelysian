"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export function ChatPopup() {
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
            "Hello! Welcome to Elysian Real Estate.\n\nI can help you find your perfect property in Dubai. Tell me what you're looking for:\n\n• Location (Palm Jumeirah, Dubai Marina, etc.)\n• Number of bedrooms\n• Property type (villa, apartment)\n\nExample: '3 bedroom villa in Palm Jumeirah'",
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

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-white shadow-2xl hover:bg-neutral-800 transition-colors"
          >
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-neutral-900 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Elysian Assistant</h3>
                  <p className="text-xs text-neutral-400">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors"
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
                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-neutral-50">
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
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            msg.role === "user"
                              ? "bg-neutral-900"
                              : "bg-blue-500"
                          )}
                        >
                          {msg.role === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5",
                            msg.role === "user"
                              ? "bg-neutral-900 text-white"
                              : "bg-white text-neutral-800 border border-neutral-200"
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
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 border border-neutral-200">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.1s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white border-t border-neutral-100">
                    {["Palm Jumeirah villa", "Marina apartment", "Downtown 2BR"].map(
                      (prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(prompt)}
                          className="flex-shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 transition-colors"
                        >
                          {prompt}
                        </button>
                      )
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 p-4 bg-white border-t border-neutral-100">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border-neutral-200 focus-visible:ring-neutral-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-neutral-900 hover:bg-neutral-800"
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
