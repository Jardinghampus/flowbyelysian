"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Scale,
  ArrowRight,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Square,
  BedDouble,
  Bath,
  Car,
  Layers,
  Trees,
  Waves,
  MapPin,
  Sparkles,
  Download,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SmartDocument } from "../types"
import { featureLabels } from "../data"

interface ComparisonViewProps {
  documents: SmartDocument[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ComparisonMetric = {
  key: string
  label: string
  icon: typeof Building2
  getValue: (doc: SmartDocument) => number | null
  format: (value: number | null) => string
  higherIsBetter?: boolean
}

const metrics: ComparisonMetric[] = [
  {
    key: 'built_up_area',
    label: 'Built-up Area',
    icon: Building2,
    getValue: (doc) => doc.analysis?.built_up_area ?? null,
    format: (v) => v ? `${v.toLocaleString()} sqft` : '-',
    higherIsBetter: true,
  },
  {
    key: 'plot_size',
    label: 'Plot Size',
    icon: Square,
    getValue: (doc) => doc.analysis?.plot_size ?? null,
    format: (v) => v ? `${v.toLocaleString()} sqft` : '-',
    higherIsBetter: true,
  },
  {
    key: 'bedroom_count',
    label: 'Bedrooms',
    icon: BedDouble,
    getValue: (doc) => doc.analysis?.bedroom_count ?? null,
    format: (v) => v?.toString() ?? '-',
    higherIsBetter: true,
  },
  {
    key: 'bathroom_count',
    label: 'Bathrooms',
    icon: Bath,
    getValue: (doc) => doc.analysis?.bathroom_count ?? null,
    format: (v) => v?.toString() ?? '-',
    higherIsBetter: true,
  },
  {
    key: 'parking_spaces',
    label: 'Parking',
    icon: Car,
    getValue: (doc) => doc.analysis?.parking_spaces ?? null,
    format: (v) => v?.toString() ?? '-',
    higherIsBetter: true,
  },
  {
    key: 'floor_count',
    label: 'Floors',
    icon: Layers,
    getValue: (doc) => doc.analysis?.floor_count ?? null,
    format: (v) => v?.toString() ?? '-',
  },
  {
    key: 'garden_area',
    label: 'Garden',
    icon: Trees,
    getValue: (doc) => doc.analysis?.garden_area ?? null,
    format: (v) => v ? `${v.toLocaleString()} sqft` : '-',
    higherIsBetter: true,
  },
  {
    key: 'balcony_area',
    label: 'Balcony',
    icon: Square,
    getValue: (doc) => doc.analysis?.balcony_area ?? null,
    format: (v) => v ? `${v.toLocaleString()} sqft` : '-',
    higherIsBetter: true,
  },
]

export function ComparisonView({
  documents,
  open,
  onOpenChange,
}: ComparisonViewProps) {
  const [highlightBest, setHighlightBest] = useState(true)

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    return metrics.map((metric) => {
      const values = documents.map((doc) => ({
        id: doc.id,
        value: metric.getValue(doc),
      }))

      const validValues = values.filter((v) => v.value !== null) as {
        id: string
        value: number
      }[]

      let bestId: string | null = null
      let worstId: string | null = null

      if (validValues.length >= 2) {
        const sorted = [...validValues].sort((a, b) => a.value - b.value)
        if (metric.higherIsBetter) {
          bestId = sorted[sorted.length - 1].id
          worstId = sorted[0].id
        } else {
          bestId = sorted[0].id
          worstId = sorted[sorted.length - 1].id
        }
      }

      return {
        ...metric,
        values,
        bestId,
        worstId,
      }
    })
  }, [documents])

  // Get all unique features across documents
  const allFeatures = useMemo(() => {
    const featuresSet = new Set<string>()
    documents.forEach((doc) => {
      doc.analysis?.features?.forEach((f) => featuresSet.add(f))
    })
    return Array.from(featuresSet).sort()
  }, [documents])

  // Generate AI summary
  const aiSummary = useMemo(() => {
    if (documents.length < 2) return null

    const doc1 = documents[0]
    const doc2 = documents[1]

    const area1 = doc1.analysis?.built_up_area || doc1.analysis?.plot_size || 0
    const area2 = doc2.analysis?.built_up_area || doc2.analysis?.plot_size || 0

    const bigger = area1 > area2 ? doc1 : doc2
    const smaller = area1 > area2 ? doc2 : doc1
    const diff = Math.abs(area1 - area2)
    const diffPercent = Math.round((diff / Math.min(area1, area2)) * 100)

    const feat1 = new Set(doc1.analysis?.features || [])
    const feat2 = new Set(doc2.analysis?.features || [])
    const uniqueToDoc1 = [...feat1].filter((f) => !feat2.has(f))
    const uniqueToDoc2 = [...feat2].filter((f) => !feat1.has(f))

    return {
      bigger: bigger.name,
      smaller: smaller.name,
      diff: diff.toLocaleString(),
      diffPercent,
      uniqueFeatures: {
        [doc1.name]: uniqueToDoc1.map((f) => featureLabels[f] || f),
        [doc2.name]: uniqueToDoc2.map((f) => featureLabels[f] || f),
      },
    }
  }, [documents])

  if (documents.length < 2) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Compare Documents</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <Scale className="h-12 w-12 mb-4 opacity-50" />
            <p>Select at least 2 documents to compare</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Compare Documents
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlightBest(!highlightBest)}
              >
                {highlightBest ? 'Hide' : 'Show'} Best Values
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Document Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${documents.length}, 1fr)` }}>
              <div /> {/* Empty corner */}
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {doc.property_name || doc.area_name}
                      </p>
                      {doc.area_name && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {doc.area_name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-2">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>{aiSummary.bigger}</strong> is {aiSummary.diffPercent}% larger
                        ({aiSummary.diff} sqft more) than <strong>{aiSummary.smaller}</strong>.
                      </p>
                      {Object.entries(aiSummary.uniqueFeatures).map(([name, features]) => (
                        features.length > 0 && (
                          <p key={name} className="text-sm text-muted-foreground mt-1">
                            <strong>{name}</strong> has unique features: {features.join(', ')}.
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metrics Comparison */}
            <div className="space-y-2">
              {comparisonData.map((metric, index) => (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid gap-4 items-center py-3 border-b last:border-0"
                  style={{ gridTemplateColumns: `200px repeat(${documents.length}, 1fr)` }}
                >
                  {/* Metric Label */}
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>

                  {/* Values */}
                  {metric.values.map((v, i) => {
                    const isBest = highlightBest && v.id === metric.bestId
                    const isWorst = highlightBest && v.id === metric.worstId && metric.values.length > 1

                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "flex items-center justify-center p-2 rounded-lg text-center transition-colors",
                          isBest && "bg-green-500/10 text-green-600 dark:text-green-400",
                          isWorst && "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}
                      >
                        <span className={cn("font-medium", v.value === null && "text-muted-foreground")}>
                          {metric.format(v.value)}
                        </span>
                        {isBest && (
                          <TrendingUp className="h-4 w-4 ml-2" />
                        )}
                        {isWorst && (
                          <TrendingDown className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              ))}
            </div>

            {/* Features Comparison */}
            {allFeatures.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Features</h4>
                <div className="space-y-2">
                  {allFeatures.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.03 }}
                      className="grid gap-4 items-center py-2 border-b last:border-0"
                      style={{ gridTemplateColumns: `200px repeat(${documents.length}, 1fr)` }}
                    >
                      <span className="text-sm">
                        {featureLabels[feature] || feature.replace(/_/g, ' ')}
                      </span>
                      {documents.map((doc) => {
                        const hasFeature = doc.analysis?.features?.includes(feature)
                        return (
                          <div
                            key={doc.id}
                            className="flex justify-center"
                          >
                            {hasFeature ? (
                              <div className="p-1 rounded-full bg-green-500/10">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-full bg-muted">
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Dimensions Comparison (if available) */}
            {documents.some((d) => d.analysis?.room_dimensions?.length) && (
              <div className="space-y-4">
                <h4 className="font-semibold">Room Dimensions</h4>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${documents.length}, 1fr)` }}>
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">{doc.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {doc.analysis?.room_dimensions?.length ? (
                          <div className="space-y-2">
                            {doc.analysis.room_dimensions.slice(0, 5).map((room, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{room.name}</span>
                                <span className="font-medium">{room.area} sqft</span>
                              </div>
                            ))}
                            {doc.analysis.room_dimensions.length > 5 && (
                              <p className="text-xs text-muted-foreground">
                                +{doc.analysis.room_dimensions.length - 5} more rooms
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No room data</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
