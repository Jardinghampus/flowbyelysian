"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Building2,
  Send,
  Bot,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  Users,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export default function LandingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `demo-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message on mount
  useEffect(() => {
    if (showWelcome) {
      setMessages([
        {
          role: "bot",
          content:
            "Hello! Welcome to Flow by Elysian Real Estate.\n\nI can help you find your perfect property in Dubai. Just tell me what you're looking for:\n\n• Location (Palm Jumeirah, Dubai Marina, Downtown, etc.)\n• Number of bedrooms\n• Property type (villa, apartment, townhouse)\n\nFor example: 'Looking for a 3 bedroom villa in Palm Jumeirah'",
          timestamp: new Date(),
        },
      ])
      setShowWelcome(false)
    }
  }, [showWelcome])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message
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

  const quickPrompts = [
    "3 bedroom villa in Palm Jumeirah",
    "Apartment in Dubai Marina",
    "2BR for rent in Downtown",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-white font-bold text-xl">FLOW</span>
              <span className="text-gray-400 text-sm hidden sm:inline">by Elysian</span>
            </div>
            <Link href="/sign-in">
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <User className="h-4 w-4 mr-2" />
                Agent Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">AI-Powered Real Estate Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Find Your Dream Property
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                in Dubai
              </span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Experience the future of real estate with our AI assistant. Describe your ideal property
              and get instant matches from Dubai&apos;s premium listings.
            </p>
          </div>

          {/* Chat Demo Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Flow AI Assistant</h3>
                    <p className="text-gray-400 text-sm">Online • Powered by Elysian Real Estate</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        msg.role === "user"
                          ? "bg-purple-500"
                          : "bg-gradient-to-br from-cyan-400 to-purple-500"
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
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-100"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-6 py-3 border-t border-gray-800 flex gap-2 overflow-x-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your ideal property..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Flow?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most advanced real estate platform in Dubai, powered by AI and designed for results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Property Matching"
              description="Our AI understands your requirements and instantly matches you with the perfect properties."
            />
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Premium Dubai Listings"
              description="Access exclusive listings in Palm Jumeirah, Downtown, Marina, and all premium areas."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Expert Agent Network"
              description="Connect with Elysian's top-performing agents who specialize in luxury real estate."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Market Intelligence"
              description="Real-time market data and analytics to help you make informed decisions."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure & Private"
              description="Your data is protected with enterprise-grade security and privacy controls."
            />
            <FeatureCard
              icon={<Phone className="h-6 w-6" />}
              title="24/7 Support"
              description="Get help anytime via WhatsApp, chat, or phone from our dedicated team."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of satisfied clients who found their perfect home with Elysian Real Estate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Try the AI Assistant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto">
                  Agent Login
                  <User className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-white font-bold">FLOW</span>
              <span className="text-gray-500 text-sm">by Elysian Real Estate</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Elysian Real Estate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
