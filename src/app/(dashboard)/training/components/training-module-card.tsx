"use client"

import { useState } from "react"
import { FileText, Play, Trash2, ExternalLink, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { TrainingModule, TrainingCategory } from "../page"

interface TrainingModuleCardProps {
  module: TrainingModule
  isAdmin: boolean
  onDelete: (id: string) => void
  onView: () => void
}

const categoryLabels: Record<TrainingCategory, string> = {
  "rera": "RERA",
  "tips": "Tips",
  "way-of-work": "Way of Work",
}

const categoryColors: Record<TrainingCategory, string> = {
  "rera": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "tips": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "way-of-work": "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

export function TrainingModuleCard({
  module,
  isAdmin,
  onDelete,
  onView,
}: TrainingModuleCardProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <Card className="flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`shrink-0 text-xs ${categoryColors[module.category]}`}>
                  {categoryLabels[module.category]}
                </Badge>
                {module.videoType && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {module.videoType === "youtube" ? "YouTube" : "Loom"}
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-1">{module.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 mb-4">
            <Button
              variant="default"
              className="flex-1"
              onClick={onView}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Start Training
            </Button>
            {module.videoUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowVideo(true)}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>

          {(module.documents?.length || 0) > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {module.documents.length} Document{module.documents.length > 1 ? "s" : ""}
              </p>
              {module.documents.slice(0, 2).map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-4 w-4" />
                  {doc.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
              {module.documents.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{module.documents.length - 2} more
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {module.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {module.duration}
              </span>
            )}
            <span>
              {new Date(module.createdAt).toLocaleDateString()}
            </span>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Video Dialog */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{module.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {module.videoUrl && (
              <iframe
                src={module.videoUrl}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{module.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(module.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
