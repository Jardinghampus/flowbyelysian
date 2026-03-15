"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Layout,
  Map,
  MapPin,
  Image,
  FileSignature,
  Scale,
  File,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { SmartDocument, DocumentType } from "../types"

const documentTypeIcons: Record<DocumentType, typeof FileText> = {
  floor_plan: Layout,
  site_plan: Map,
  plot_map: MapPin,
  brochure: Image,
  spec_sheet: FileText,
  contract: FileSignature,
  legal: Scale,
  other: File,
}

const documentTypeLabels: Record<DocumentType, string> = {
  floor_plan: 'Floor Plan',
  site_plan: 'Site Plan',
  plot_map: 'Plot Map',
  brochure: 'Brochure',
  spec_sheet: 'Spec Sheet',
  contract: 'Contract',
  legal: 'Legal',
  other: 'Document',
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Analyzed' },
  failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
}

interface DocumentCardProps {
  document: SmartDocument
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onView?: (document: SmartDocument) => void
  onDelete?: (id: string) => void
  onChat?: (document: SmartDocument) => void
}

export function DocumentCard({
  document,
  isSelected = false,
  onSelect,
  onView,
  onDelete,
  onChat,
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = documentTypeIcons[document.document_type]
  const status = statusConfig[document.analysis_status]
  const StatusIcon = status.icon

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-pointer group",
        isSelected && "ring-2 ring-primary",
        isHovered && "shadow-lg"
      )}>
        {/* Selection checkbox */}
        {onSelect && (
          <div className={cn(
            "absolute top-3 left-3 z-10 transition-opacity duration-200",
            isSelected || isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(document.id, !!checked)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
        )}

        {/* Document preview/thumbnail area */}
        <div
          className="relative h-40 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center"
          onClick={() => onView?.(document)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Icon className="h-16 w-16 text-muted-foreground/50" />

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className={cn("gap-1", status.bg, status.color)}>
              <StatusIcon className={cn(
                "h-3 w-3",
                document.analysis_status === 'processing' && "animate-spin"
              )} />
              {status.label}
            </Badge>
          </div>

          {/* Quick actions on hover */}
          <div className={cn(
            "absolute bottom-3 right-3 flex gap-2 transition-all duration-200",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); onView?.(document) }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {document.analysis_status === 'completed' && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); onChat?.(document) }}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{document.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {document.property_name || document.description || 'No description'}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(document)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChat?.(document)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask AI
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete?.(document.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs font-normal">
              {documentTypeLabels[document.document_type]}
            </Badge>
            <span>•</span>
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>{formatDate(document.created_at)}</span>
          </div>

          {/* Analysis summary preview */}
          {document.analysis?.summary && document.analysis_status === 'completed' && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex flex-wrap gap-1.5">
                {document.analysis.built_up_area && (
                  <Badge variant="secondary" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    {document.analysis.built_up_area.toLocaleString()} sqft
                  </Badge>
                )}
                {document.analysis.bedroom_count && (
                  <Badge variant="secondary" className="text-xs">
                    {document.analysis.bedroom_count} BR
                  </Badge>
                )}
                {document.analysis.plot_size && (
                  <Badge variant="secondary" className="text-xs">
                    Plot: {document.analysis.plot_size.toLocaleString()} sqft
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {document.area_name && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{document.area_name}</span>
              {document.developer && (
                <>
                  <span>•</span>
                  <span>{document.developer}</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
