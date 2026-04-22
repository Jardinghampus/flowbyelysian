"use client"

import { useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { ArrowUpDown, Phone, MessageSquare, MoreHorizontal, ExternalLink, Archive, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Owner, OwnerStatus, OwnerPriority } from "../_lib/types"
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../_lib/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, differenceInDays, isPast, isToday } from "date-fns"

interface OwnerTableProps {
  owners: Owner[]
  loading: boolean
  onRowClick: (owner: Owner) => void
  onLogOutreach: (owner: Owner) => void
  onDelete: (owner: Owner) => void
  onArchive?: (owner: Owner) => void
  onRestore?: (owner: Owner) => void
  isAdmin?: boolean
  showHidden?: boolean
}

function StatusBadge({ status }: { status: OwnerStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", config.bg, config.color)}>
      {config.label}
    </span>
  )
}

function PriorityDot({ priority }: { priority: OwnerPriority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", config.color)} />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{config.label} priority</TooltipContent>
    </Tooltip>
  )
}

function FollowUpLabel({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground text-xs">—</span>

  const d = new Date(date)
  const days = differenceInDays(d, new Date())

  if (isPast(d) && !isToday(d)) {
    return <span className="text-xs font-medium text-red-400">Overdue {Math.abs(days)}d</span>
  }
  if (isToday(d)) {
    return <span className="text-xs font-medium text-amber-400">Today</span>
  }
  return <span className="text-xs text-emerald-400">In {days}d</span>
}

function LastContactedLabel({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground text-xs">Never</span>

  const days = differenceInDays(new Date(), new Date(date))
  let colorClass = "text-muted-foreground"
  if (days > 14) colorClass = "text-red-400"
  else if (days > 7) colorClass = "text-amber-400"

  return (
    <span className={cn("text-xs", colorClass)}>
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  )
}

export function OwnerTable({ owners, loading, onRowClick, onLogOutreach, onDelete, onArchive, onRestore, isAdmin, showHidden }: OwnerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Owner>[]>(
    () => [
      {
        accessorKey: "priority",
        header: "",
        size: 40,
        cell: ({ row }) => <PriorityDot priority={row.original.priority} />,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs" onClick={() => column.toggleSorting()}>
            Name <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-sm tabular-nums">{row.original.phone}</span>
            <a
              href={`https://wa.me/${row.original.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </a>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "area",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs" onClick={() => column.toggleSorting()}>
            Area <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-sm">{row.original.area}</span>,
      },
      {
        accessorKey: "unit_number",
        header: "Unit",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.unit_number || "—"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "bedrooms",
        header: "BR",
        size: 60,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.bedrooms || "—"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "last_contacted_at",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs" onClick={() => column.toggleSorting()}>
            Last Contact <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <LastContactedLabel date={row.original.last_contacted_at} />,
      },
      {
        accessorKey: "follow_up_at",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs" onClick={() => column.toggleSorting()}>
            Follow-up <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <FollowUpLabel date={row.original.follow_up_at} />,
      },
      {
        id: "outreach",
        header: "Outreach",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Phone className="h-3 w-3" /> {row.original.call_count}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" /> {row.original.whatsapp_count}
            </span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const notes = row.original.notes
          if (!notes) return <span className="text-muted-foreground text-xs">—</span>
          return (
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground max-w-[120px] truncate block">
                  {notes}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] text-xs whitespace-pre-wrap">
                {notes}
              </TooltipContent>
            </Tooltip>
          )
        },
        enableSorting: false,
      },
      {
        id: "actions",
        size: 50,
        cell: ({ row }) => {
          const owner = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRowClick(owner)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLogOutreach(owner)}>
                  <Phone className="h-3.5 w-3.5 mr-2" /> Log Outreach
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {showHidden && owner.is_hidden ? (
                  <DropdownMenuItem onClick={() => onRestore?.(owner)}>
                    <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onArchive?.(owner)}>
                    <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(owner)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Permanently
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
    ],
    [onRowClick, onLogOutreach, onDelete, onArchive, onRestore, isAdmin, showHidden]
  )

  const table = useReactTable({
    data: owners,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="rounded-xl border bg-background/50">
        <div className="p-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
            Loading owners...
          </div>
        </div>
      </div>
    )
  }

  if (owners.length === 0) {
    return (
      <div className="rounded-xl border bg-background/50">
        <div className="p-12 text-center">
          <p className="text-sm text-muted-foreground mb-1">No owners found</p>
          <p className="text-xs text-muted-foreground/60">Add your first owner or adjust filters</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border bg-background/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/30">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className={cn(
                    "border-b border-border/30 hover:bg-muted/20 cursor-pointer transition-colors",
                    row.original.is_hidden && "opacity-50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-2">
        {owners.map((owner) => (
          <div
            key={owner.id}
            onClick={() => onRowClick(owner)}
            className="rounded-xl border bg-background/50 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PriorityDot priority={owner.priority} />
                  <span className="font-medium text-sm truncate">{owner.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{owner.area} {owner.unit_number ? `· ${owner.unit_number}` : ""} {owner.bedrooms ? `· ${owner.bedrooms} BR` : ""}</p>
              </div>
              <StatusBadge status={owner.status} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
              <FollowUpLabel date={owner.follow_up_at} />
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${owner.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-500"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => { e.stopPropagation(); onLogOutreach(owner) }}
                >
                  Log
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
