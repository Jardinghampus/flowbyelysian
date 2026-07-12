"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useDroppable } from "@dnd-kit/core"
import {
  Plus, MoreHorizontal, Pencil, Trash2, Clock, Eye,
  MapPin, Building2, Bed, Maximize2, Camera,
  ArrowRight, Calendar, ChevronDown, GripVertical,
  CheckCircle2, AlertCircle, Timer, Sparkles,
  Phone, Mail, MessageSquare, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ───

interface TimelineEvent {
  id: string
  date: string
  action: string
  by: string
  note?: string
}

interface PipelineCard {
  id: string
  title: string
  area: string
  propertyType: string
  price: number
  size: number
  bedrooms: number
  image?: string
  agent: { name: string; avatar?: string }
  client?: { name: string; phone?: string; email?: string }
  priority: "high" | "medium" | "low"
  daysInStage: number
  timeline: TimelineEvent[]
  notes: string
  transactionType: "sale" | "rent"
}

interface PipelineColumn {
  id: string
  title: string
  color: string
  icon: React.ReactNode
  cards: PipelineCard[]
}

// ─── Initial data ───

const initialColumns: PipelineColumn[] = [
  {
    id: "new",
    title: "New Lead",
    color: "bg-blue-500",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    cards: [],
  },
  {
    id: "viewing",
    title: "Viewing Booked",
    color: "bg-amber-500",
    icon: <Eye className="h-3.5 w-3.5" />,
    cards: [],
  },
  {
    id: "negotiation",
    title: "Negotiation",
    color: "bg-purple-500",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    cards: [],
  },
  {
    id: "offer",
    title: "Offer Accepted",
    color: "bg-emerald-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cards: [],
  },
  {
    id: "closed",
    title: "Closed / Won",
    color: "bg-green-600",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cards: [],
  },
]

const priorityConfig = {
  high: { label: "High", class: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  medium: { label: "Med", class: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  low: { label: "Low", class: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
}

// ─── Card content (shared between draggable card and drag overlay) ───

function CardContent({ card }: { card: PipelineCard }) {
  const p = priorityConfig[card.priority]

  return (
    <>
      {/* Image strip */}
      {card.image && (
        <div className="relative h-24 rounded-t-xl overflow-hidden">
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-1.5 left-2 text-white text-[11px] font-semibold drop-shadow">
            AED {card.price >= 1000000 ? `${(card.price / 1000000).toFixed(1)}M` : card.price.toLocaleString()}
            {card.transactionType === "rent" ? "/yr" : ""}
          </span>
          <Badge className={`absolute top-1.5 right-1.5 text-[9px] ${p.class} border-0`}>
            {p.label}
          </Badge>
        </div>
      )}

      <div className="p-3 space-y-2">
        {!card.image && (
          <div className="flex items-start justify-between">
            <Badge className={`text-[9px] ${p.class} border-0`}>{p.label}</Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Timer className="h-2.5 w-2.5" /> {card.daysInStage}d
            </span>
          </div>
        )}

        <h4 className="font-semibold text-xs leading-snug">{card.title}</h4>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{card.area}</span>
          {card.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{card.bedrooms}</span>}
          <span className="flex items-center gap-0.5"><Maximize2 className="h-2.5 w-2.5" />{card.size.toLocaleString()}</span>
        </div>

        {/* Client */}
        {card.client && (
          <div className="flex items-center gap-2 text-[10px]">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[7px] bg-primary/10 text-primary">
                {card.client.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium truncate">{card.client.name}</span>
          </div>
        )}

        {/* Notes preview */}
        {card.notes && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 bg-muted/50 rounded px-1.5 py-1">
            {card.notes}
          </p>
        )}

        {/* Timeline count + days */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {card.timeline.length} event{card.timeline.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-2.5 w-2.5" /> {card.daysInStage}d in stage
          </span>
        </div>
      </div>
    </>
  )
}

// ─── Sortable Pipeline Card Component ───

function SortableCard({
  card,
  onViewTimeline,
}: {
  card: PipelineCard
  onViewTimeline: (card: PipelineCard) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow group relative",
        isDragging && "opacity-30"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-muted"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div onClick={() => onViewTimeline(card)} className="cursor-pointer">
        <CardContent card={card} />
      </div>
    </div>
  )
}

// ─── Droppable Column ───

function DroppableColumn({
  column,
  children,
  isOver,
}: {
  column: PipelineColumn
  children: React.ReactNode
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div
      key={column.id}
      className="w-[300px] flex flex-col bg-muted/30 dark:bg-neutral-950/30 rounded-xl border border-border/50"
    >
      {/* Column header */}
      <div className="px-3 py-3 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn("h-5 w-5 rounded-md flex items-center justify-center text-white", column.color)}>
            {column.icon}
          </div>
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
            {column.cards.length}
          </Badge>
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-2 space-y-2 transition-colors rounded-b-xl min-h-[100px]",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
        )}
      >
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        {column.cards.length === 0 && !isOver && (
          <div className="text-center py-8 text-muted-foreground/50 text-xs">
            No deals in this stage
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Timeline Detail Dialog ───

function TimelineDialog({
  card,
  open,
  onClose,
  onAddEvent,
}: {
  card: PipelineCard | null
  open: boolean
  onClose: () => void
  onAddEvent: (cardId: string, event: TimelineEvent) => void
}) {
  const [newNote, setNewNote] = useState("")
  const [newAction, setNewAction] = useState("")

  if (!card) return null

  const handleAdd = () => {
    if (!newAction.trim()) return
    onAddEvent(card.id, {
      id: `t-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      action: newAction,
      by: "You",
      note: newNote || undefined,
    })
    setNewAction("")
    setNewNote("")
    toast.success("Event added to timeline")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{card.title}</DialogTitle>
        </DialogHeader>

        {/* Property summary */}
        <div className="flex gap-3 items-start">
          {card.image && (
            <img src={card.image} alt="Property photo" className="h-16 w-24 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3" /> {card.area} · {card.propertyType}
              {card.bedrooms > 0 && <> · <Bed className="h-3 w-3" /> {card.bedrooms}</>}
            </div>
            <div className="font-bold text-sm">
              AED {card.price >= 1000000 ? `${(card.price / 1000000).toFixed(1)}M` : card.price.toLocaleString()}
              {card.transactionType === "rent" ? "/yr" : ""}
            </div>
            {card.client && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" /> {card.client.name}
                {card.client.phone && <> · <Phone className="h-3 w-3" /> {card.client.phone}</>}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {card.notes && (
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
            <strong>Notes:</strong> {card.notes}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-1">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> Timeline
          </h4>
          <div className="relative ml-3 border-l-2 border-primary/20 pl-4 space-y-4 py-2">
            {card.timeline.map((event, i) => (
              <div key={event.id} className="relative">
                <div className={cn(
                  "absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900",
                  i === card.timeline.length - 1 ? "bg-primary" : "bg-muted-foreground/30"
                )} />
                <div className="text-[10px] text-muted-foreground">{event.date} · {event.by}</div>
                <div className="text-xs font-medium">{event.action}</div>
                {event.note && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 bg-muted/50 rounded px-2 py-1">
                    {event.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add event */}
        <div className="space-y-2 border-t pt-3">
          <h4 className="font-semibold text-sm">Add Event</h4>
          <Input
            placeholder="Action (e.g. Follow-up call, Viewing done)"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
          />
          <Textarea
            placeholder="Optional note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[50px]"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newAction.trim()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add to Timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Pipeline Page ───

export default function PipelinePage() {
  const [columns, setColumns] = useState<PipelineColumn[]>(initialColumns)
  const [timelineCard, setTimelineCard] = useState<PipelineCard | null>(null)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [activeCard, setActiveCard] = useState<PipelineCard | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const findCardColumn = useCallback(
    (cardId: string) => columns.find((col) => col.cards.some((c) => c.id === cardId)),
    [columns]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cardId = event.active.id as string
      for (const col of columns) {
        const card = col.cards.find((c) => c.id === cardId)
        if (card) {
          setActiveCard(card)
          break
        }
      }
    },
    [columns]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      if (!over) {
        setOverColumnId(null)
        return
      }

      const overId = over.id as string
      // Check if hovering over a column directly
      const isColumn = columns.some((col) => col.id === overId)
      if (isColumn) {
        setOverColumnId(overId)
        return
      }
      // Otherwise hovering over a card — find its column
      const col = findCardColumn(overId)
      setOverColumnId(col?.id ?? null)
    },
    [columns, findCardColumn]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveCard(null)
      setOverColumnId(null)

      if (!over) return

      const cardId = active.id as string
      const overId = over.id as string

      // Determine target column
      const isColumn = columns.some((col) => col.id === overId)
      let targetColumnId: string
      if (isColumn) {
        targetColumnId = overId
      } else {
        const col = findCardColumn(overId)
        if (!col) return
        targetColumnId = col.id
      }

      const sourceCol = findCardColumn(cardId)
      if (!sourceCol) return

      // Same column — no reorder needed for now
      if (sourceCol.id === targetColumnId) return

      // Move card to target column
      setColumns((prev) => {
        let card: PipelineCard | undefined
        const next = prev.map((col) => {
          const found = col.cards.find((c) => c.id === cardId)
          if (found) card = { ...found, daysInStage: 0 }
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
        })
        if (!card) return prev

        // Find the target column and determine insert position
        const targetCol = columns.find((c) => c.id === targetColumnId)
        if (!isColumn && targetCol) {
          // Dropped on a card — insert near that card
          return next.map((col) => {
            if (col.id !== targetColumnId) return col
            const overIndex = col.cards.findIndex((c) => c.id === overId)
            const newCards = [...col.cards]
            newCards.splice(overIndex >= 0 ? overIndex + 1 : newCards.length, 0, card!)
            return { ...col, cards: newCards }
          })
        }

        return next.map((col) =>
          col.id === targetColumnId ? { ...col, cards: [...col.cards, card!] } : col
        )
      })

      const targetColTitle = columns.find((c) => c.id === targetColumnId)?.title
      toast.success(`Moved to ${targetColTitle}`)
    },
    [columns, findCardColumn]
  )

  const addTimelineEvent = useCallback((cardId: string, event: TimelineEvent) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === cardId ? { ...c, timeline: [...c.timeline, event] } : c
        ),
      }))
    )
    setTimelineCard((prev) =>
      prev?.id === cardId ? { ...prev, timeline: [...prev.timeline, event] } : prev
    )
  }, [])

  const openTimeline = (card: PipelineCard) => {
    setTimelineCard(card)
    setTimelineOpen(true)
  }

  const totalCards = columns.reduce((sum, c) => sum + c.cards.length, 0)
  const totalValue = columns.reduce(
    (sum, c) => sum + c.cards.reduce((s, card) => s + (card.transactionType === "sale" ? card.price : 0), 0),
    0
  )

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
            <p className="text-muted-foreground text-sm">
              Drag cards between stages or click for full timeline.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-muted rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Active deals:</span>{" "}
              <span className="font-bold">{totalCards}</span>
            </div>
            <div className="bg-muted rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Pipeline value:</span>{" "}
              <span className="font-bold">
                AED {(totalValue / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto px-6 pb-6">
          <div className="flex gap-4 min-w-max h-full">
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column} isOver={overColumnId === column.id}>
                {column.cards.map((card) => (
                  <SortableCard
                    key={card.id}
                    card={card}
                    onViewTimeline={openTimeline}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className="w-[280px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-white/[0.08] shadow-2xl rotate-2 opacity-90">
              <CardContent card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Timeline dialog */}
      <TimelineDialog
        card={timelineCard}
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        onAddEvent={addTimelineEvent}
      />
    </div>
  )
}
