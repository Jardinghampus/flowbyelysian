"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toPng } from "html-to-image"
import {
  CalendarDays,
  Check,
  Copy,
  Download,
  ImagePlus,
  Lightbulb,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"
import { isHampusEmail } from "@/lib/hampus-access"
import { SocialCard } from "@/components/kokonutui/social-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SOCIAL_EXPORT_HEIGHT,
  SOCIAL_EXPORT_WIDTH,
  conceptLabel,
  type BuiltSocialPost,
  type FocusCommunityId,
} from "@/lib/zaylo/social-focus"
import Link from "next/link"

type AgentPayload = {
  fullName: string
  phone: string
  profileImageUrl: string | null
  jobTitle: string
  company: string
  website: string
}

type ApiPayload = {
  agent: AgentPayload
  schedule: BuiltSocialPost[]
  communityCards: Array<{ post: BuiltSocialPost }>
  today: BuiltSocialPost[]
  upcoming: BuiltSocialPost[]
  postsPerCommunity: Record<FocusCommunityId, number>
  ideas: string[]
  conceptLabels: Record<string, string>
}

export default function SocialPostsPage() {
  const router = useRouter()
  const { userEmail, isLoaded } = useRole()
  const [data, setData] = useState<ApiPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterCommunity, setFilterCommunity] = useState<string>("all")
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/zaylo/social-posts", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load")
      const json = (await res.json()) as ApiPayload
      setData(json)
      const prefer = json.today[0] || json.upcoming[0] || json.schedule[0]
      setSelectedId((prev) => prev || prefer?.id || null)
    } catch {
      toast.error("Could not load social posts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (!isHampusEmail(userEmail)) {
      router.replace("/app/dashboard")
      return
    }
    void load()
  }, [isLoaded, userEmail, router, load])

  const posts = data?.schedule || []
  const filtered =
    filterCommunity === "all" ? posts : posts.filter((p) => p.communityId === filterCommunity)
  const selected = posts.find((p) => p.id === selectedId) || filtered[0] || null

  const copyCaption = async () => {
    if (!selected) return
    await navigator.clipboard.writeText(selected.caption)
    setCopied(true)
    toast.success("Caption copied — paste into IG/LinkedIn")
    setTimeout(() => setCopied(false), 1800)
  }

  const downloadPng = async () => {
    if (!cardRef.current || !selected) return
    setExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: SOCIAL_EXPORT_WIDTH,
        height: SOCIAL_EXPORT_HEIGHT,
        backgroundColor: "#050505",
        style: {
          transform: "none",
          width: `${SOCIAL_EXPORT_WIDTH}px`,
          height: `${SOCIAL_EXPORT_HEIGHT}px`,
        },
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `zaylo-1080x1350-${selected.communityId}-${selected.concept}-day${selected.scheduleDay || "x"}.png`
      a.click()
      toast.success("PNG 1080×1350 downloaded — ready to post")
    } catch {
      toast.error("Export failed — try again")
    } finally {
      setExporting(false)
    }
  }

  if (!isLoaded || !isHampusEmail(userEmail)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Hampus · Social OS
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Social Posts</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            1080×1350 posts from live transactions. Area pulses ≥2× / month + weekly “New
            transactions” (5 desk picks). Download → paste caption → post.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/settings/user">
              <ImagePlus className="mr-2 h-4 w-4" />
              Profile photo
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh data
          </Button>
        </div>
      </div>

      {!data?.agent.profileImageUrl ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Add your <strong>profile photo</strong> so it shows on every post. Settings → Upload photo
              → Save.
            </p>
            <Button asChild size="sm">
              <Link href="/app/settings/user">Open settings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!data?.agent.phone ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm">
            Add your <strong>phone number</strong> in Settings so CTAs on the card include it.
          </CardContent>
        </Card>
      ) : null}

      {loading && !data ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Posts this month</CardDescription>
                <CardTitle className="text-3xl">{data.schedule.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Today</CardDescription>
                <CardTitle className="text-lg">
                  {data.today.length ? data.today[0]!.scheduleLabel : "Rest day — pick any post"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Per community</CardDescription>
                <CardTitle className="text-sm font-medium leading-relaxed">
                  {Object.entries(data.postsPerCommunity)
                    .map(([id, n]) => `${id.replace(/-/g, " ")}: ${n}`)
                    .join(" · ")}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Workflow</CardDescription>
                <CardTitle className="text-sm font-medium">1. Download PNG · 2. Copy caption · 3. Post</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,560px)]">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarDays className="h-4 w-4" />
                      Monthly schedule
                    </CardTitle>
                    <CardDescription>Click a day → preview → download 1080×1350</CardDescription>
                  </div>
                  <Select value={filterCommunity} onValueChange={setFilterCommunity}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="weekly">Weekly · New TX</SelectItem>
                      <SelectItem value="arabian-ranches">Arabian Ranches</SelectItem>
                      <SelectItem value="mira-oasis">Mira Oasis</SelectItem>
                      <SelectItem value="mudon">Mudon</SelectItem>
                      <SelectItem value="villanova">Villanova</SelectItem>
                      <SelectItem value="dubai-hills">Dubai Hills</SelectItem>
                      <SelectItem value="town-square">Town Square</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="max-h-[520px] space-y-2 overflow-y-auto">
                  {filtered.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setSelectedId(post.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        selected?.id === post.id
                          ? "border-primary/40 bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                        {post.scheduleDay}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold">{post.communityLabel}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {conceptLabel(post.concept)}
                          </Badge>
                          <Badge
                            variant={post.status === "ready" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {post.status === "ready" ? "Live data" : "Needs scrape"}
                          </Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {post.scheduleLabel} · {post.hook}
                        </span>
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4" />
                    More concepts
                  </CardTitle>
                  <CardDescription>Extra ideas beyond the monthly calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {data.ideas.map((idea) => (
                      <li key={idea} className="flex gap-2">
                        <span className="text-primary">·</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {selected && data.agent ? (
                <>
                  <div className="overflow-x-auto rounded-2xl border bg-neutral-950 p-4">
                    <div
                      className="mx-auto overflow-hidden"
                      style={{
                        width: SOCIAL_EXPORT_WIDTH / 2,
                        height: SOCIAL_EXPORT_HEIGHT / 2,
                      }}
                    >
                      <div
                        style={{
                          transform: "scale(0.5)",
                          transformOrigin: "top left",
                          width: SOCIAL_EXPORT_WIDTH,
                          height: SOCIAL_EXPORT_HEIGHT,
                        }}
                      >
                        <SocialCard post={selected} agent={data.agent} cardRef={cardRef} />
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-white/40">
                      Preview 50% · export {SOCIAL_EXPORT_WIDTH}×{SOCIAL_EXPORT_HEIGHT}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void downloadPng()} disabled={exporting} className="flex-1">
                      {exporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download 1080×1350
                    </Button>
                    <Button variant="outline" onClick={() => void copyCaption()} className="flex-1">
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      Copy caption
                    </Button>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Caption (edit after paste if you want)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-xs leading-relaxed">
                        {selected.caption}
                      </pre>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
