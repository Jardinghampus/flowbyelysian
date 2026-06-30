"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SmartDocument, SmartChatMessage, SmartCollection } from "../types"
import { suggestedQuestions, featureLabels } from "../data"

interface ChatPanelProps {
  collection: SmartCollection | null
  documents: SmartDocument[]
  selectedDocuments: SmartDocument[]
  messages: SmartChatMessage[]
  onSendMessage: (content: string, documentIds: string[]) => void
  onClearChat: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  isLoading?: boolean
}

export function ChatPanel({
  collection,
  documents,
  selectedDocuments,
  messages,
  onSendMessage,
  onClearChat,
  isExpanded = false,
  onToggleExpand,
  isLoading = false,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const documentIds = selectedDocuments.length > 0
      ? selectedDocuments.map((d) => d.id)
      : documents.map((d) => d.id)

    onSendMessage(input.trim(), documentIds)
    setInput("")
    setShowSuggestions(false)
  }

  const handleSuggestion = (question: string) => {
    setInput(question)
    setShowSuggestions(false)
  }

  // Build context summary for the AI
  const getContextSummary = () => {
    const docs = selectedDocuments.length > 0 ? selectedDocuments : documents
    if (docs.length === 0) return null

    const totalSize = docs.reduce((sum, d) => sum + (d.analysis?.built_up_area || d.analysis?.plot_size || 0), 0)
    const types = [...new Set(docs.map((d) => d.document_type))]

    return {
      count: docs.length,
      totalSize,
      types,
    }
  }

  const context = getContextSummary()

  return (
    <div className={cn(
      "flex flex-col bg-background border rounded-lg overflow-hidden transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "h-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Smart AI</h3>
            <p className="text-xs text-muted-foreground">
              {collection ? collection.name : 'All Documents'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClearChat}
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onToggleExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Context Bar */}
      {context && (
        <div className="px-4 py-2 border-b bg-muted/20">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Analyzing {context.count} document{context.count !== 1 ? 's' : ''}
              {context.totalSize > 0 && ` • ${context.totalSize.toLocaleString()} sqft total`}
            </span>
          </div>
          {selectedDocuments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedDocuments.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="text-xs py-0 h-5">
                  {doc.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* AI Introduction */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm">
                      Hello! I&apos;m your Smart AI assistant. I can help you analyze and compare your documents.
                    </p>
                    <ul className="mt-2 text-sm list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Compare floor plans and plot sizes</li>
                      <li>Calculate areas and measurements</li>
                      <li>Find specific features and specs</li>
                      <li>Get investment insights</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Suggested Questions */}
              {showSuggestions && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-11">
                    Try asking:
                  </p>
                  <div className="flex flex-wrap gap-2 px-11">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1.5 px-2.5"
                        onClick={() => handleSuggestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Chat Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-lg p-3 text-sm max-w-[85%]",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.document_ids.length > 0 && message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-xs opacity-70 mb-1">Referenced documents:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.document_ids.map((id) => {
                          const doc = documents.find((d) => d.id === id)
                          return doc ? (
                            <Badge key={id} variant="secondary" className="text-xs py-0">
                              {doc.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing documents...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documents..."
            disabled={isLoading || documents.length === 0}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || documents.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {documents.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Upload documents to start chatting
          </p>
        )}
      </div>
    </div>
  )
}
