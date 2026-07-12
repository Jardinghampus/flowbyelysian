"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar } from "./components/calendar"
import type { CalendarEvent } from "./types"

type ViewingEvent = {
  id: string
  title: string
  date: string
  status: string
  listingTitle?: string | null
  area?: string | null
}

export default function CalendarPage() {
  const [viewingEvents, setViewingEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const from = new Date()
        from.setMonth(from.getMonth() - 1)
        const to = new Date()
        to.setMonth(to.getMonth() + 2)
        const res = await fetch(
          `/api/calendar/viewings?from=${from.toISOString()}&to=${to.toISOString()}`
        )
        const data = await res.json()
        if (cancelled) return
        const mapped: CalendarEvent[] = (data.events || []).map((e: ViewingEvent, index: number) => {
          const date = new Date(e.date)
          const hh = String(date.getHours()).padStart(2, "0")
          const mm = String(date.getMinutes()).padStart(2, "0")
          return {
            id: 10_000 + index,
            title: e.title,
            date,
            time: `${hh}:${mm}`,
            duration: "1h",
            type: "meeting" as const,
            attendees: [],
            location: e.area || "",
            color: "#0ea5e9",
            description: [e.listingTitle, e.status].filter(Boolean).join(" · "),
          }
        })
        setViewingEvents(mapped)
      } catch {
        if (!cancelled) setViewingEvents([])
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const events = viewingEvents

  const eventDates = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of viewingEvents) {
      const key = e.date.toDateString()
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return Array.from(counts.entries()).map(([date, count]) => ({
      date: new Date(date),
      count,
    }))
  }, [viewingEvents])

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Viewings from CRM listings. Book from Landlord Report or listing detail — they show up here.
        </p>
      </div>
      <Calendar events={events} eventDates={eventDates} />
    </div>
  )
}
