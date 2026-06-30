"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  X,
  FileText,
  MapPin,
  Building2,
  BedDouble,
  Bath,
  Car,
  Layers,
  Square,
  Trees,
  Waves,
  Sparkles,
  Download,
  Share2,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SmartDocument, DOCUMENT_TYPES } from "../types"
import { featureLabels } from "../data"

interface DocumentDetailProps {
  document: SmartDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChat?: (document: SmartDocument) => void
}

export function DocumentDetail({
  document,
  open,
  onOpenChange,
  onChat,
}: DocumentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!document) return null

  const analysis = document.analysis
  const docType = DOCUMENT_TYPES.find((t) => t.value === document.document_type)

  const formatNumber = (num: number | null | undefined) => {
    if (num == null) return '-'
    return num.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">{document.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {docType?.label || document.document_type}
                </Badge>
                {document.area_name && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {document.area_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Rooms
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="m-0 p-6 space-y-6">
              {/* Document Preview */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
              </div>

              {/* Quick Stats */}
              {analysis && (
                <div className="grid grid-cols-2 gap-3">
                  {analysis.built_up_area && (
                    <StatCard
                      icon={Building2}
                      label="Built-up Area"
                      value={`${formatNumber(analysis.built_up_area)} sqft`}
                    />
                  )}
                  {analysis.plot_size && (
                    <StatCard
                      icon={Square}
                      label="Plot Size"
                      value={`${formatNumber(analysis.plot_size)} sqft`}
                    />
                  )}
                  {analysis.bedroom_count && (
                    <StatCard
                      icon={BedDouble}
                      label="Bedrooms"
                      value={analysis.bedroom_count.toString()}
                    />
                  )}
                  {analysis.bathroom_count && (
                    <StatCard
                      icon={Bath}
                      label="Bathrooms"
                      value={analysis.bathroom_count.toString()}
                    />
                  )}
                  {analysis.parking_spaces && (
                    <StatCard
                      icon={Car}
                      label="Parking"
                      value={analysis.parking_spaces.toString()}
                    />
                  )}
                  {analysis.floor_count && (
                    <StatCard
                      icon={Layers}
                      label="Floors"
                      value={analysis.floor_count.toString()}
                    />
                  )}
                </div>
              )}

              {/* AI Summary */}
              {analysis?.summary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">AI Summary</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.extraction_confidence && (
                    <div className="flex items-center gap-2 mt-2">
                      <Progress
                        value={analysis.extraction_confidence * 100}
                        className="h-1.5 flex-1 max-w-32"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(analysis.extraction_confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Property Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Property Details</h4>
                <div className="space-y-2 text-sm">
                  {document.property_name && (
                    <InfoRow label="Property" value={document.property_name} />
                  )}
                  {document.developer && (
                    <InfoRow label="Developer" value={document.developer} />
                  )}
                  {document.project_name && (
                    <InfoRow label="Project" value={document.project_name} />
                  )}
                  {document.address && (
                    <InfoRow label="Address" value={document.address} />
                  )}
                </div>
              </div>

              {/* Document Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Document Info</h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="File Name" value={document.file_name} />
                  <InfoRow
                    label="Size"
                    value={document.file_size ? `${(document.file_size / (1024 * 1024)).toFixed(1)} MB` : '-'}
                  />
                  <InfoRow label="Uploaded" value={formatDate(document.created_at)} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    onOpenChange(false)
                    onChat?.(document)
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="m-0 p-6 space-y-6">
              {/* Features */}
              {analysis?.features && analysis.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Features Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {featureLabels[feature] || feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Areas */}
              {analysis && (analysis.balcony_area || analysis.terrace_area || analysis.garden_area || analysis.pool_size) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Additional Areas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.balcony_area && (
                      <StatCard
                        icon={Square}
                        label="Balcony"
                        value={`${formatNumber(analysis.balcony_area)} sqft`}
                        small
                      />
                    )}
                    {analysis.terrace_area && (
                      <StatCard
                        icon={Square}
                        label="Terrace"
                        value={`${formatNumber(analysis.terrace_area)} sqft`}
                        small
                      />
                    )}
                    {analysis.garden_area && (
                      <StatCard
                        icon={Trees}
                        label="Garden"
                        value={`${formatNumber(analysis.garden_area)} sqft`}
                        small
                      />
                    )}
                    {analysis.pool_size && (
                      <StatCard
                        icon={Waves}
                        label="Pool"
                        value={analysis.pool_size}
                        small
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Processing Info */}
              {analysis && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground">Processing Details</h4>
                  <div className="space-y-2 text-sm">
                    {analysis.model_used && (
                      <InfoRow label="AI Model" value={analysis.model_used} />
                    )}
                    {analysis.processing_time_ms && (
                      <InfoRow
                        label="Processing Time"
                        value={`${(analysis.processing_time_ms / 1000).toFixed(1)}s`}
                      />
                    )}
                    {analysis.processed_at && (
                      <InfoRow
                        label="Analyzed"
                        value={formatDate(analysis.processed_at)}
                      />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rooms" className="m-0 p-6 space-y-4">
              {analysis?.room_dimensions && analysis.room_dimensions.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    {analysis.room_dimensions.length} rooms detected
                  </div>
                  <div className="space-y-2">
                    {analysis.room_dimensions.map((room, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{room.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {room.width}&apos; x {room.length}&apos;
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {room.area} sqft
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Room Area</span>
                      <span className="font-medium">
                        {formatNumber(
                          analysis.room_dimensions.reduce((sum, r) => sum + r.area, 0)
                        )} sqft
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Square className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No room dimensions available</p>
                  <p className="text-xs mt-1">Room data will appear here when detected</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  small = false,
}: {
  icon: typeof Building2
  label: string
  value: string
  small?: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
      small && "p-2"
    )}>
      <div className={cn(
        "p-2 rounded-lg bg-background",
        small && "p-1.5"
      )}>
        <Icon className={cn("h-4 w-4 text-muted-foreground", small && "h-3.5 w-3.5")} />
      </div>
      <div>
        <p className={cn("font-semibold", small && "text-sm")}>{value}</p>
        <p className={cn("text-xs text-muted-foreground", small && "text-[10px]")}>{label}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
