/** Dubai office weeks = Monday → Sunday. Period chips for KPI board. */

export type KpiPeriodKey = "week" | "30d" | "60d" | "90d" | "ytd"

export type DateRange = {
  from: string // YYYY-MM-DD inclusive
  to: string // YYYY-MM-DD inclusive
  label: string
  key: KpiPeriodKey
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Monday 00:00 local of the week containing `date`. */
export function weekStartMonday(date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function weekEndSunday(weekStart: Date): Date {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d
}

export function formatWeekLabel(weekStart: Date): string {
  const end = weekEndSunday(weekStart)
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${weekStart.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`
}

export function resolveKpiRange(key: KpiPeriodKey, now = new Date()): DateRange {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const to = toIsoDate(today)

  if (key === "week") {
    const start = weekStartMonday(today)
    return {
      key,
      from: toIsoDate(start),
      to: toIsoDate(weekEndSunday(start)),
      label: `This week (${formatWeekLabel(start)})`,
    }
  }

  if (key === "ytd") {
    const start = new Date(today.getFullYear(), 0, 1)
    return {
      key,
      from: toIsoDate(start),
      to,
      label: `YTD ${today.getFullYear()}`,
    }
  }

  const days = key === "30d" ? 30 : key === "60d" ? 60 : 90
  const start = new Date(today)
  start.setDate(start.getDate() - (days - 1))
  return {
    key,
    from: toIsoDate(start),
    to,
    label: `Last ${days} days`,
  }
}

/** All Monday dates whose weeks overlap [from, to]. */
export function weekStartsInRange(from: string, to: string): string[] {
  const start = weekStartMonday(new Date(from + "T12:00:00"))
  const endBound = new Date(to + "T12:00:00")
  const out: string[] = []
  const cursor = new Date(start)
  while (cursor <= endBound) {
    out.push(toIsoDate(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return out
}

export const KPI_PERIOD_OPTIONS: { key: KpiPeriodKey; short: string }[] = [
  { key: "week", short: "This week" },
  { key: "30d", short: "30d" },
  { key: "60d", short: "60d" },
  { key: "90d", short: "90d" },
  { key: "ytd", short: "YTD" },
]
