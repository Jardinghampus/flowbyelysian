"use client"

import { useState } from "react"
import { FileText, Play, Trash2, ExternalLink } from "lucide-react"
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
import type { TrainingModule } from "../page"

interface TrainingModuleCardProps {
  module: TrainingModule
  isAdmin: boolean
  onDelete: (id: string) => void
}

export function TrainingModuleCard({
  module,
  isAdmin,
  onDelete,
}: TrainingModuleCardProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="line-clamp-1">{module.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
            {module.videoType && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                {module.videoType === "youtube" ? "YouTube" : "Loom"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {module.videoUrl && (
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowVideo(true)}
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Video
            </Button>
          )}

          {module.documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Documents
              </p>
              {module.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {doc.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground">
            Added {new Date(module.createdAt).toLocaleDateString()}
          </span>
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
