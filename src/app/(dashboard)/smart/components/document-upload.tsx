"use client"

import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DocumentType, DOCUMENT_TYPES, SmartCollection } from "../types"

interface UploadingFile {
  id: string
  file: File
  name: string
  description: string
  document_type: DocumentType
  collection_id: string | null
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

interface DocumentUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: SmartCollection[]
  onUploadComplete?: (files: UploadingFile[]) => void
}

export function DocumentUpload({
  open,
  onOpenChange,
  collections,
  onUploadComplete,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: UploadingFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: '',
      document_type: guessDocumentType(file.name),
      collection_id: null,
      progress: 0,
      status: 'pending',
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const guessDocumentType = (filename: string): DocumentType => {
    const lower = filename.toLowerCase()
    if (lower.includes('floor') || lower.includes('layout')) return 'floor_plan'
    if (lower.includes('site') || lower.includes('master')) return 'site_plan'
    if (lower.includes('plot') || lower.includes('land')) return 'plot_map'
    if (lower.includes('brochure') || lower.includes('marketing')) return 'brochure'
    if (lower.includes('spec') || lower.includes('technical')) return 'spec_sheet'
    if (lower.includes('contract') || lower.includes('agreement')) return 'contract'
    if (lower.includes('legal') || lower.includes('title')) return 'legal'
    return 'other'
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = '' // Reset input
  }, [processFiles])

  const updateFile = useCallback((id: string, updates: Partial<UploadingFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const simulateUpload = async (file: UploadingFile) => {
    updateFile(file.id, { status: 'uploading', progress: 0 })

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      updateFile(file.id, { progress: i })
    }

    // Simulate processing
    updateFile(file.id, { status: 'processing', progress: 100 })
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Complete
    updateFile(file.id, { status: 'complete' })
  }

  const handleUpload = async () => {
    setIsUploading(true)

    const pendingFiles = files.filter((f) => f.status === 'pending')

    // Upload files sequentially for demo
    for (const file of pendingFiles) {
      try {
        await simulateUpload(file)
      } catch {
        updateFile(file.id, { status: 'error', error: 'Upload failed' })
      }
    }

    setIsUploading(false)

    // Notify parent after short delay to show completion state
    setTimeout(() => {
      onUploadComplete?.(files)
      setFiles([])
      onOpenChange(false)
    }, 1000)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const completedCount = files.filter((f) => f.status === 'complete').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload floor plans, plot maps, brochures, and other property documents for AI analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
            />
            <motion.div
              animate={{ scale: isDragging ? 1.05 : 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (PDF, PNG, JPG, DOC)
                </p>
              </div>
            </motion.div>
          </div>

          {/* File List */}
          <AnimatePresence mode="popLayout">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.file)
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{file.file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatFileSize(file.file.size)}
                        </span>
                        {file.status === 'complete' && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                        )}
                      </div>
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                          </p>
                        </div>
                      )}
                    </div>
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* File metadata (only show for pending files) */}
                  {file.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Document Name</Label>
                        <Input
                          value={file.name}
                          onChange={(e) => updateFile(file.id, { name: e.target.value })}
                          placeholder="Document name"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Document Type</Label>
                        <Select
                          value={file.document_type}
                          onValueChange={(value: DocumentType) =>
                            updateFile(file.id, { document_type: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs">Collection</Label>
                        <Select
                          value={file.collection_id || 'none'}
                          onValueChange={(value) =>
                            updateFile(file.id, {
                              collection_id: value === 'none' ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select collection" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No collection</SelectItem>
                            {collections.map((col) => (
                              <SelectItem key={col.id} value={col.id}>
                                {col.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                          value={file.description}
                          onChange={(e) => updateFile(file.id, { description: e.target.value })}
                          placeholder="Add notes about this document..."
                          className="text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && (
              <>
                {completedCount} of {files.length} uploaded
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([])
                onOpenChange(false)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={pendingCount === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {pendingCount > 0 && `(${pendingCount})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
