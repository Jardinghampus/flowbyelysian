"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Video,
  Play,
  Download,
  Trash2,
  Loader2,
  Music,
  Type,
  Clock,
  Sparkles,
  GripVertical,
  Image as ImageIcon,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UploadedPhoto {
  id: string
  file: File
  preview: string
  label: string
}

type VideoLength = "15" | "30" | "60"
type MusicStyle = "ambient" | "luxury" | "upbeat" | "arabic" | "none"
type TransitionStyle = "kenburns" | "fade" | "slide" | "zoom"

const musicOptions: { value: MusicStyle; label: string }[] = [
  { value: "ambient", label: "Ambient" },
  { value: "luxury", label: "Luxury" },
  { value: "upbeat", label: "Upbeat" },
  { value: "arabic", label: "Arabic" },
  { value: "none", label: "No Music" },
]

const transitionOptions: { value: TransitionStyle; label: string }[] = [
  { value: "kenburns", label: "Ken Burns" },
  { value: "fade", label: "Crossfade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
]

const roomLabels = [
  "Exterior",
  "Living Room",
  "Kitchen",
  "Master Bedroom",
  "Bedroom",
  "Bathroom",
  "Balcony",
  "View",
  "Pool",
  "Lobby",
  "Other",
]

export default function ListingVideoPage() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [videoLength, setVideoLength] = useState<VideoLength>("30")
  const [musicStyle, setMusicStyle] = useState<MusicStyle>("luxury")
  const [transition, setTransition] = useState<TransitionStyle>("kenburns")
  const [overlayText, setOverlayText] = useState("")
  const [agentBranding, setAgentBranding] = useState("")
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList) => {
    const newPhotos: UploadedPhoto[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      newPhotos.push({
        id,
        file,
        preview: URL.createObjectURL(file),
        label: "Other",
      })
    })
    setPhotos((prev) => [...prev, ...newPhotos])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const updateLabel = (id: string, label: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)))
  }

  const handleGenerate = async () => {
    if (photos.length < 3) {
      toast.error("Upload at least 3 photos")
      return
    }

    setGenerating(true)
    setProgress(0)
    setVideoReady(false)

    // Simulate AI video generation progress
    const steps = [
      { pct: 10, msg: "Analyzing photos..." },
      { pct: 25, msg: "Classifying rooms..." },
      { pct: 40, msg: "Ordering sequence..." },
      { pct: 55, msg: "Applying Ken Burns motion..." },
      { pct: 70, msg: "Adding transitions..." },
      { pct: 85, msg: "Overlaying text & branding..." },
      { pct: 95, msg: "Encoding video..." },
      { pct: 100, msg: "Done!" },
    ]

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
      setProgress(step.pct)
    }

    setGenerating(false)
    setVideoReady(true)
    toast.success("Video generated successfully!")
  }

  const reset = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
    setVideoReady(false)
    setProgress(0)
    setOverlayText("")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          AI Listing Video Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Transform listing photos into stunning video tours for Instagram, TikTok & YouTube Shorts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload & Photos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragOver
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-muted-foreground/30 bg-card"
            )}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-1">
              Drop listing photos here or click to browse
            </p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              JPG, PNG, WEBP — Min 3 photos, max 20
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files)
              }}
            />
          </div>

          {/* Photo grid */}
          <AnimatePresence>
            {photos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded
                  </span>
                  <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear all
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative rounded-xl overflow-hidden border bg-card aspect-[4/3]"
                    >
                      <img
                        src={photo.preview}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removePhoto(photo.id)
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-white/70" />
                        </div>
                      </div>
                      {/* Order badge */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-0">
                          {i + 1}
                        </Badge>
                      </div>
                      {/* Room label */}
                      <div className="absolute bottom-1.5 right-1.5">
                        <select
                          value={photo.label}
                          onChange={(e) => updateLabel(photo.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white border-0 outline-none cursor-pointer"
                        >
                          {roomLabels.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Preview Area */}
          {videoReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center relative">
                {/* Simulated video preview using the first photo */}
                {photos[0] && (
                  <img
                    src={photos[0].preview}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                </div>
                {/* Overlay text preview */}
                {overlayText && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-white text-sm font-medium">{overlayText}</p>
                    </div>
                  </div>
                )}
                {/* Branding */}
                {agentBranding && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <p className="text-white text-xs font-medium">{agentBranding}</p>
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {videoLength}s
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {photos.length} frames
                  </span>
                  <span className="flex items-center gap-1">
                    <Music className="h-3.5 w-3.5" />
                    {musicStyle}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    MP4
                  </Button>
                  <Button size="sm" className="text-xs">
                    Share to Social
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Settings */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Video Settings
            </h3>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Duration</Label>
              <div className="flex gap-2">
                {(["15", "30", "60"] as VideoLength[]).map((len) => (
                  <button
                    key={len}
                    onClick={() => setVideoLength(len)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border",
                      videoLength === len
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {len}s
                  </button>
                ))}
              </div>
            </div>

            {/* Transition */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Transition Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {transitionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTransition(opt.value)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-medium transition-colors border",
                      transition === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Music */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Background Music</Label>
              <div className="flex flex-wrap gap-2">
                {musicOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMusicStyle(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                      musicStyle === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay text */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                <Type className="h-3.5 w-3.5 inline mr-1" />
                Text Overlay
              </Label>
              <Textarea
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="3 BR | 2,400 sqft | Marina View"
                className="text-xs h-16 resize-none"
              />
            </div>

            {/* Agent branding */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Agent Branding</Label>
              <Input
                value={agentBranding}
                onChange={(e) => setAgentBranding(e.target.value)}
                placeholder="Your Name — Elysian Properties"
                className="text-xs"
              />
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || photos.length < 3}
            className="w-full h-12"
            size="lg"
          >
            {generating ? (
              <div className="flex items-center gap-3 w-full">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-foreground rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-xs tabular-nums">{progress}%</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Video — {photos.length} Photos
              </>
            )}
          </Button>

          {photos.length > 0 && photos.length < 3 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Add {3 - photos.length} more photo{3 - photos.length !== 1 ? "s" : ""} to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
