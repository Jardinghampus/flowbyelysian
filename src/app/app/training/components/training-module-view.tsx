"use client"

import { ArrowLeft, FileText, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { TrainingModule } from "../page"

interface TrainingModuleViewProps {
  module: TrainingModule
  onBack: () => void
}

export function TrainingModuleView({ module, onBack }: TrainingModuleViewProps) {
  // Safe access to module properties
  const title = module?.title || "Untitled Module"
  const description = module?.description || ""
  const content = module?.content || ""
  const videoUrl = module?.videoUrl
  const videoType = module?.videoType
  const duration = module?.duration
  const createdAt = module?.createdAt
  // Filter out invalid documents
  const documents = Array.isArray(module?.documents)
    ? module.documents.filter(
        (doc: any) => doc && typeof doc === "object" && doc.name && doc.url
      )
    : []

  // Simple markdown-like rendering
  const renderContent = (contentText: string) => {
    if (!contentText) return null
    const lines = contentText.split("\n")
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-8 mb-4">
            {line.replace("### ", "")}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-10 mb-5">
            {line.replace("## ", "")}
          </h2>
        )
      }
      // List items
      if (line.startsWith("- ")) {
        const text = line.replace("- ", "")
        return (
          <li key={index} className="ml-6 mb-2 text-base leading-relaxed">
            {renderInlineFormatting(text)}
          </li>
        )
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, "")
        return (
          <li key={index} className="ml-6 mb-2 list-decimal text-base leading-relaxed">
            {renderInlineFormatting(text)}
          </li>
        )
      }
      // Empty lines
      if (line.trim() === "") {
        return <br key={index} />
      }
      // Regular paragraphs
      return (
        <p key={index} className="mb-4 text-base leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      )
    })
  }

  const renderInlineFormatting = (text: string) => {
    // Bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </div>
      </div>

      {/* Centered content container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            {videoType && (
              <Badge variant="secondary" className="text-sm">
                {videoType === "youtube" ? "YouTube" : "Loom"}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
            )}
            {createdAt && (
              <span>Added {new Date(createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Video */}
        {videoUrl && (
          <Card className="mb-10 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {content && (
          <Card className="mb-10 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {renderContent(content)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="mb-10">
            <Separator className="mb-8" />
            <h3 className="text-xl font-semibold mb-6 text-center">Resources & Documents</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-lg border bg-card hover:bg-muted transition-colors shadow-sm"
                >
                  <FileText className="h-10 w-10 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">PDF Document</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom padding for comfortable reading */}
        <div className="h-20" />
      </div>
    </div>
  )
}
