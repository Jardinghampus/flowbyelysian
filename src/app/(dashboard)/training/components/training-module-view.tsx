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
  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
            {line.replace("### ", "")}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-bold mt-8 mb-4">
            {line.replace("## ", "")}
          </h2>
        )
      }
      // List items
      if (line.startsWith("- ")) {
        const text = line.replace("- ", "")
        return (
          <li key={index} className="ml-4 mb-1">
            {renderInlineFormatting(text)}
          </li>
        )
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, "")
        return (
          <li key={index} className="ml-4 mb-1 list-decimal">
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
        <p key={index} className="mb-2">
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
    <div className="px-4 lg:px-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Training
      </Button>

      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{module.title}</h1>
            {module.videoType && (
              <Badge variant="secondary">
                {module.videoType === "youtube" ? "YouTube" : "Loom"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-2">{module.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {module.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {module.duration}
              </span>
            )}
            <span>Added {new Date(module.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Video */}
        {module.videoUrl && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  src={module.videoUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <Card className="mb-6">
          <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
            {renderContent(module.content)}
          </CardContent>
        </Card>

        {/* Documents */}
        {module.documents.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources & Documents</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {module.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
