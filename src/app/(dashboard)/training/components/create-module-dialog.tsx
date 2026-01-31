"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TrainingModule } from "../page"

interface CreateModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (module: Omit<TrainingModule, "id" | "createdAt">) => void
}

export function CreateModuleDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateModuleDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoType, setVideoType] = useState<"youtube" | "loom" | "">("")
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([])
  const [newDocName, setNewDocName] = useState("")
  const [newDocUrl, setNewDocUrl] = useState("")

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setVideoUrl("")
    setVideoType("")
    setDocuments([])
    setNewDocName("")
    setNewDocUrl("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      title,
      description,
      videoUrl: videoUrl || undefined,
      videoType: videoType || undefined,
      documents,
    })

    resetForm()
  }

  const handleAddDocument = () => {
    if (newDocName && newDocUrl) {
      setDocuments([...documents, { name: newDocName, url: newDocUrl }])
      setNewDocName("")
      setNewDocUrl("")
    }
  }

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const convertToEmbedUrl = (url: string): string => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Convert youtu.be URLs to embed URLs
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Convert Loom share URLs to embed URLs
    if (url.includes("loom.com/share/")) {
      return url.replace("/share/", "/embed/")
    }
    return url
  }

  const handleVideoUrlChange = (url: string) => {
    const embedUrl = convertToEmbedUrl(url)
    setVideoUrl(embedUrl)

    // Auto-detect video type
    if (url.includes("youtube") || url.includes("youtu.be")) {
      setVideoType("youtube")
    } else if (url.includes("loom.com")) {
      setVideoType("loom")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Training Module</DialogTitle>
          <DialogDescription>
            Add a new training module with video and documents for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Getting Started Guide"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this training module covers..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Video (Optional)</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Input
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="Paste YouTube or Loom URL"
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={videoType}
                  onValueChange={(v) => setVideoType(v as "youtube" | "loom")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Video type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="loom">Loom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {videoUrl && (
              <div className="aspect-video max-w-md rounded-lg overflow-hidden border">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Documents (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Document name"
                className="flex-1"
              />
              <Input
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                placeholder="Document URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddDocument}
                disabled={!newDocName || !newDocUrl}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-2 rounded-md"
                  >
                    <span className="text-sm truncate">{doc.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || !description}>
              Create Module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
