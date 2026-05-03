"use client"

import Link from "next/link"
import {
  Building2, ClipboardList, Database, Phone, MessageSquare,
  Mail, Users, Smartphone, AlertTriangle, ArrowRight,
  Bell, TrendingUp, CalendarDays, CheckCircle2, Clock,
  Kanban, ExternalLink, Search, BarChart3, Home,
} from "lucide-react"
import { useUnifiedStats, type FollowUpOwner, type RecentOutreach } from "@/hooks/use-unified-stats"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const outreachIcons: Record<string, React.ElementType> = {
  call: Phone, whatsapp: MessageSquare, email: Mail, meeting: Users, sms: Smartphone,
}

function Num({ n, className }: { n: number; className?: string }) {
  return <span className={cn("font-mono tabular-nums font-bold", className)}>{n.toLocaleString()}</span>
}

function StatCell({ label, value, sub, href, accent }: { label: string; value: number; sub?: string; href: string; accent?: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-0.5 rounded-lg border border-border/50 bg-card px-3 py-2 hover:border-[#4B8EDB]/40 transition-colors">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <Num n={value} className={cn("text-xl", accent)} />
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </Link>
  )
}

function FollowUpRow({ owner, isOverdue }: { owner: FollowUpOwner; isOverdue: boolean }) {
  return (
    <Link
      href="/app/data"
      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors group"
    >
      <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", {
        "bg-red-500": owner.priority === "high",
        "bg-amber-400": owner.priority === "medium",
        "bg-neutral-400": owner.priority === "low",
      })} />
      <span className="text-xs font-medium truncate flex-1">{owner.name}</span>
      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{owner.area}</span>
      <span className={cn("text-[10px] font-mono", isOverdue ? "text-red-400" : "text-muted-foreground")}>
        {formatDistanceToNow(new Date(owner.follow_up_at), { addSuffix: true })}
      </span>
    </Link>
  )
}

function OutreachRow({ log }: { log: RecentOutreach }) {
  const Icon = outreachIcons[log.type] || Phone
  return (
    <div className="flex items-center gap-2 py-1.5 px-2">
      <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <span className="text-xs truncate flex-1">
        <span className="font-medium">{log.owner_name}</span>
        {log.outcome && <span className="text-muted-foreground"> — {log.outcome}</span>}
      </span>
      {log.status_changed_to && (
        <span className="text-[10px] px-1 rounded bg-[#4B8EDB]/10 text-[#4B8EDB]">→ {log.status_changed_to}</span>
      )}
      <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
        {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
      </span>
    </div>
  )
}

const quickLinks = [
  { name: "Propertyfinder", url: "https://propertyfinder.ae", icon: Search, color: "text-red-500" },
  { name: "Propertymonitor", url: "https://propertymonitor.ae/v2", icon: BarChart3, color: "text-blue-500" },
  { name: "Holo", url: "https://www.useholo.com/en", icon: Home, color: "text-purple-500" },
]

export default function Page() {
  const { stats, loading } = useUnifiedStats(30_000)

  const totalFollowUps = stats.followUps.overdue.length + stats.followUps.dueToday.length + stats.followUps.dueSoon.length

  return (
    <div className="w-full space-y-3 -mt-1">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ZFlow Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded border border-transparent hover:border-border">
              <link.icon className={cn("h-3 w-3", link.color)} />
              {link.name}
              <ExternalLink className="h-2 w-2 opacity-40" />
            </Link>
          ))}
          {stats.unreadNotifications > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 px-1.5 py-1 rounded border border-amber-400/20 bg-amber-400/5">
              <Bell className="h-3 w-3" />
              {stats.unreadNotifications}
            </div>
          )}
        </div>
      </div>

      {/* ─── TOP TICKER ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <StatCell label="Listings" value={stats.listings.total} sub={`${stats.listings.live} live · ${stats.listings.pocket} pocket`} href="/app/inventory" />
        <StatCell label="Leads" value={stats.leads.total} sub={`${stats.leads.new} new · ${stats.leads.inProgress} active`} href="/app/leads" />
        <StatCell label="Owner Data" value={stats.owners.total} sub={`${stats.owners.considering} considering`} href="/app/data" />
        <StatCell label="Pipeline" value={stats.pipeline.total} sub={`${stats.pipeline.unassigned} unassigned`} href="/app/pipeline" accent={stats.pipeline.unassigned > 0 ? "text-amber-400" : undefined} />
        <StatCell
          label="Overdue"
          value={stats.owners.overdueFollowUps}
          sub="follow-ups past due"
          href="/app/data"
          accent={stats.owners.overdueFollowUps > 0 ? "text-red-400" : undefined}
        />
        <StatCell
          label="Today"
          value={stats.activity.callsToday + stats.activity.leadsToday + stats.activity.viewingsToday}
          sub={`${stats.activity.callsToday} calls · ${stats.activity.leadsToday} leads · ${stats.activity.viewingsToday} views`}
          href="/app/performance"
        />
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ── LEFT: Follow-ups ── */}
        <div className="lg:col-span-4 space-y-3">
          {/* Overdue */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-semibold">Overdue</span>
                {stats.followUps.overdue.length > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {stats.followUps.overdue.length}
                  </span>
                )}
              </div>
              <Link href="/app/data" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="max-h-[160px] overflow-y-auto">
              {stats.followUps.overdue.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">No overdue follow-ups</p>
              ) : (
                stats.followUps.overdue.map((o) => <FollowUpRow key={o.id} owner={o} isOverdue />)
              )}
            </div>
          </div>

          {/* Due Today */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-[#4B8EDB]" />
                <span className="text-xs font-semibold">Due Today</span>
                {stats.followUps.dueToday.length > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#4B8EDB] text-white text-[10px] font-bold flex items-center justify-center">
                    {stats.followUps.dueToday.length}
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-[120px] overflow-y-auto">
              {stats.followUps.dueToday.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">Nothing due today</p>
              ) : (
                stats.followUps.dueToday.map((o) => <FollowUpRow key={o.id} owner={o} isOverdue={false} />)
              )}
            </div>
          </div>

          {/* Due Soon (3 days) */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Coming Up</span>
                <span className="text-[10px] text-muted-foreground">(3 days)</span>
              </div>
            </div>
            <div className="max-h-[120px] overflow-y-auto">
              {stats.followUps.dueSoon.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">No upcoming follow-ups</p>
              ) : (
                stats.followUps.dueSoon.map((o) => <FollowUpRow key={o.id} owner={o} isOverdue={false} />)
              )}
            </div>
          </div>
        </div>

        {/* ── CENTER: Pipeline + Inventory ── */}
        <div className="lg:col-span-4 space-y-3">
          {/* Pipeline breakdown */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Kanban className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-semibold">Pipeline</span>
              </div>
              <Link href="/app/pipeline" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                Open <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "New / Unassigned", value: stats.leads.new, color: "bg-blue-400" },
                { label: "Contacted", value: stats.leads.contacted, color: "bg-amber-400" },
                { label: "In Progress", value: stats.leads.inProgress, color: "bg-purple-400" },
                { label: "Matched", value: stats.leads.matched, color: "bg-emerald-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", row.color)} />
                  <span className="text-xs text-muted-foreground flex-1">{row.label}</span>
                  <Num n={row.value} className="text-xs" />
                  {stats.leads.total > 0 && (
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", row.color)} style={{ width: `${Math.round((row.value / stats.leads.total) * 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold">Inventory</span>
              </div>
              <Link href="/app/inventory" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                Open <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              <div className="text-center rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2">
                <Num n={stats.listings.live} className="text-lg text-emerald-400" />
                <p className="text-[10px] text-muted-foreground">Live</p>
              </div>
              <div className="text-center rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                <Num n={stats.listings.pocket} className="text-lg text-amber-400" />
                <p className="text-[10px] text-muted-foreground">Pocket</p>
              </div>
              <div className="text-center rounded-lg bg-neutral-500/5 border border-neutral-500/10 p-2">
                <Num n={stats.listings.unofficial} className="text-lg" />
                <p className="text-[10px] text-muted-foreground">Unofficial</p>
              </div>
            </div>
          </div>

          {/* Owner Database */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-[#4B8EDB]" />
                <span className="text-xs font-semibold">Owner Database</span>
              </div>
              <Link href="/app/data" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                Open <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              <div className="text-center">
                <Num n={stats.owners.total} className="text-lg" />
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <Num n={stats.owners.considering} className="text-lg text-amber-400" />
                <p className="text-[10px] text-muted-foreground">Considering</p>
              </div>
              <div className="text-center">
                <Num n={stats.owners.listed} className="text-lg text-emerald-400" />
                <p className="text-[10px] text-muted-foreground">Listed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Activity + Performance ── */}
        <div className="lg:col-span-4 space-y-3">
          {/* Today's targets */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold">Today&apos;s Activity</span>
              </div>
              <Link href="/app/performance" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                Performance <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              <div className="text-center rounded-lg border p-2">
                <div className="flex items-center justify-center gap-1">
                  <Phone className="h-3 w-3 text-blue-400" />
                  <Num n={stats.activity.callsToday} className="text-lg" />
                </div>
                <p className="text-[10px] text-muted-foreground">Calls</p>
              </div>
              <div className="text-center rounded-lg border p-2">
                <div className="flex items-center justify-center gap-1">
                  <ClipboardList className="h-3 w-3 text-purple-400" />
                  <Num n={stats.activity.leadsToday} className="text-lg" />
                </div>
                <p className="text-[10px] text-muted-foreground">Leads</p>
              </div>
              <div className="text-center rounded-lg border p-2">
                <div className="flex items-center justify-center gap-1">
                  <Building2 className="h-3 w-3 text-emerald-400" />
                  <Num n={stats.activity.viewingsToday} className="text-lg" />
                </div>
                <p className="text-[10px] text-muted-foreground">Viewings</p>
              </div>
            </div>
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{stats.agents.activeToday} agent{stats.agents.activeToday !== 1 ? "s" : ""} active today</span>
                <span>{totalFollowUps} follow-ups pending</span>
              </div>
            </div>
          </div>

          {/* Recent outreach feed */}
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Recent Outreach</span>
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y divide-border/30">
              {stats.recentOutreach.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-6">No recent outreach</p>
              ) : (
                stats.recentOutreach.map((log) => <OutreachRow key={log.id} log={log} />)
              )}
            </div>
          </div>

          {/* Quick nav */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2 block">Quick Access</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Tasks", href: "/app/tasks", icon: CheckCircle2 },
                { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
                { label: "My Listings", href: "/app/my-listings", icon: Building2 },
                { label: "Exchange", href: "/app/exchange", icon: TrendingUp },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-[10px] text-muted-foreground bg-card border rounded-full px-3 py-1.5 shadow-lg">
          <div className="h-2 w-2 rounded-full bg-[#4B8EDB] animate-pulse" />
          Syncing...
        </div>
      )}
    </div>
  )
}
