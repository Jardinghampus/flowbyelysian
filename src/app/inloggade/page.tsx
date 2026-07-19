"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/contexts/role-context"
import { isHampusEmail } from "@/lib/hampus-access"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

type TeamMember = {
  userId: string | null
  email: string
  fullName: string
  role: string
  lastLoginAt: string | null
  loginCount: number
  likelyActive: boolean
}

type LoginEvent = {
  id: string
  email: string
  full_name: string
  role: string
  ip_address: string | null
  user_agent: string | null
  logged_in_at: string
  outcome?: "login" | "not_you"
}

function formatWhen(iso: string | null) {
  if (!iso) return "Aldrig"
  return new Date(iso).toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function shortAgent(ua: string | null) {
  if (!ua) return "—"
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS"
  if (ua.includes("Android")) return "Android"
  if (ua.includes("Windows")) return "Windows"
  if (ua.includes("Mac")) return "Mac"
  if (ua.includes("Chrome")) return "Chrome"
  if (ua.includes("Safari")) return "Safari"
  return ua.slice(0, 40) + (ua.length > 40 ? "…" : "")
}

export default function InloggadePage() {
  const router = useRouter()
  const { userEmail, isLoaded } = useRole()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [events, setEvents] = useState<LoginEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login-events", { cache: "no-store" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Kunde inte hämta inloggningar")
      }
      const data = await res.json()
      setTeam(data.team || [])
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    if (!isHampusEmail(userEmail)) {
      router.replace("/app/dashboard")
      return
    }
    void load()
  }, [isLoaded, userEmail, router])

  if (!isLoaded || !isHampusEmail(userEmail)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const activeCount = team.filter((m) => m.likelyActive).length
  const notYouCount = events.filter((e) => e.outcome === "not_you").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Hampus only
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Inloggade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Teamstatus och inloggningshistorik. Sessioner gäller i 14 dagar.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Uppdatera
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team</CardDescription>
            <CardTitle className="text-3xl">{team.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Troligen inloggade nu</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inloggningar totalt</CardDescription>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not you (Hampus)</CardDescription>
            <CardTitle className="text-3xl text-red-600 dark:text-red-400">{notYouCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Teamöversikt
          </CardTitle>
          <CardDescription>Senaste inloggning per person</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between rounded-xl border border-neutral-200/80 dark:border-white/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Senast: {formatWhen(member.lastLoginAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={member.likelyActive ? "default" : "secondary"}>
                    {member.likelyActive ? "Aktiv session" : "Ej aktiv"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {member.loginCount} inloggning{member.loginCount === 1 ? "" : "ar"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inloggningslogg</CardTitle>
          <CardDescription>Lyckade inloggningar och misslyckade Hampus-försök</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && events.length === 0 ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Inga inloggningar loggade ännu. De syns här efter nästa lyckade inloggning.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Namn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Tid</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Enhet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const suspicious = event.outcome === "not_you"
                  return (
                  <TableRow
                    key={event.id}
                    className={suspicious ? "bg-red-50/80 dark:bg-red-950/20" : undefined}
                  >
                    <TableCell>
                      {suspicious ? (
                        <Badge variant="destructive">Not you</Badge>
                      ) : (
                        <Badge variant="outline">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{event.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{event.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {event.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatWhen(event.logged_in_at)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {event.ip_address || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {shortAgent(event.user_agent)}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
