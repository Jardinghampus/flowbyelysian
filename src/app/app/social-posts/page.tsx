"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toPng } from "html-to-image"
import {
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Target,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import { useRole } from "@/contexts/role-context"
import { isHampusEmail } from "@/lib/hampus-access"
import { SocialCard, type SocialCardTheme } from "@/components/kokonutui/social-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  formatAedCompact,
  roiRoleLabel,
  type BuiltSocialPost,
  type FocusCommunityId,
} from "@/lib/zaylo/social-focus"
import {
  BRAND_QUARTERLY_CHECK,
  HAMPUS_BRAND_BIBLE,
  LISTING_AS_BRAND_PITCH,
  REEL_SCRIPTS,
  fillCommunity,
} from "@/lib/zaylo/serhant-playbook"
import { MEDIA_DESK_DAILY_SOP, STORIES_OVERLAY_LINES } from "@/lib/zaylo/media-desk-sop"

type AgentPayload = {
  fullName: string
  phone: string
  profileImageUrl: string | null
  jobTitle: string
  company: string
  website: string
}

type Playbook = {
  dmReply: string
  liReply: string
  coldOwner: string
  coldBuyer: string
  ownerBrandPitch?: string
}

type ApiPayload = {
  agent: AgentPayload
  schedule: BuiltSocialPost[]
  today: BuiltSocialPost[]
  upcoming: BuiltSocialPost[]
  catchUp: BuiltSocialPost[]
  postedThisMonth: number
  postsPerCommunity: Record<FocusCommunityId, number>
  ideas: string[]
  playbook: Playbook
}

type ProofStats = {
  targetAed: number
  monthVolumeAed: number
  progressPct: number
  inboundLeads: number
  shortlistsCreated: number
  postsIg: number
  postsLi: number
}

export default function MediaDeskPage() {
  const router = useRouter()
  const { userEmail, isLoaded } = useRole()
  const [data, setData] = useState<ApiPayload | null>(null)
  const [proof, setProof] = useState<ProofStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterCommunity, setFilterCommunity] = useState("all")
  const [theme, setTheme] = useState<SocialCardTheme>("instagram")
  const [exporting, setExporting] = useState(false)
  const [marking, setMarking] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const [inboundOpen, setInboundOpen] = useState(false)
  const [inbound, setInbound] = useState({
    name: "",
    phone: "",
    source: "instagram_dm",
    community: "Mudon",
    budgetAed: "",
    beds: "",
    intent: "buy",
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [res, proofRes] = await Promise.all([
        fetch("/api/zaylo/social-posts", { cache: "no-store" }),
        fetch("/api/zaylo/media-desk/proof", { cache: "no-store" }),
      ])
      if (!res.ok) throw new Error("Failed to load")
      const json = (await res.json()) as ApiPayload
      setData(json)
      if (proofRes.ok) setProof((await proofRes.json()) as ProofStats)
      const prefer = json.today[0] || json.catchUp[0] || json.upcoming[0] || json.schedule[0]
      setSelectedId((prev) => prev || prefer?.id || null)
    } catch {
      toast.error("Could not load Media Desk")
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
  const todayPost = data?.today[0] || null

  const weekStrip = useMemo(() => {
    const today = new Date().getDate()
    const start = Math.max(1, today - 3)
    return posts.filter((p) => (p.scheduleDay ?? 0) >= start && (p.scheduleDay ?? 0) <= today + 3)
  }, [posts])

  const copyCaption = async (platform: "ig" | "li") => {
    if (!selected) return
    const text = platform === "ig" ? selected.captionIg : selected.captionLi
    await navigator.clipboard.writeText(text)
    toast.success(platform === "ig" ? "IG caption copied" : "LinkedIn caption copied")
  }

  const downloadPng = async (platform: SocialCardTheme) => {
    if (!cardRef.current || !selected) return
    setTheme(platform)
    setExporting(true)
    // allow paint
    await new Promise((r) => setTimeout(r, 80))
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: SOCIAL_EXPORT_WIDTH,
        height: SOCIAL_EXPORT_HEIGHT,
        backgroundColor: platform === "linkedin" ? "#f7f5f0" : "#050505",
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `zaylo-${platform}-1080x1350-${selected.id}.png`
      a.click()
      toast.success(`${platform === "instagram" ? "IG" : "LI"} PNG downloaded`)
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const markPosted = async (platform: "instagram" | "linkedin" | "both") => {
    if (!selected) return
    setMarking(true)
    try {
      const res = await fetch("/api/zaylo/media-desk/mark-posted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleKey: selected.id,
          platform,
          captionIg: selected.captionIg,
          captionLi: selected.captionLi,
          hook: selected.hook,
          headline: selected.headline,
          communityId: selected.communityId,
          concept: selected.concept,
        }),
      })
      if (!res.ok) throw new Error("Mark failed")
      toast.success("Marked posted")
      await load()
    } catch {
      toast.error("Could not mark posted")
    } finally {
      setMarking(false)
    }
  }

  const logInbound = async () => {
    try {
      const res = await fetch("/api/zaylo/media-desk/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inbound.name,
          phone: inbound.phone,
          source: inbound.source,
          community: inbound.community,
          budgetAed: inbound.budgetAed ? Number(inbound.budgetAed) : undefined,
          beds: inbound.beds ? Number(inbound.beds) : undefined,
          intent: inbound.intent,
          mediaPostId: selected?.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Inbound lead logged → Leads")
      setInboundOpen(false)
      setInbound({ name: "", phone: "", source: "instagram_dm", community: "Mudon", budgetAed: "", beds: "", intent: "buy" })
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log lead")
    }
  }

  const copyPlaybook = async (key: keyof Playbook) => {
    if (!data?.playbook) return
    let text = data.playbook[key] || ""
    if (key === "ownerBrandPitch" && !text) {
      text = LISTING_AS_BRAND_PITCH.ownerPitchScript
    }
    if (!text) return
    if (selected) {
      text = text
        .replace(/\{community\}/g, selected.communityLabel)
        .replace(/\{name\}/g, "there")
      if (key === "coldOwner" || key === "coldBuyer") {
        text += `\n\n---\nProof snippet:\n${selected.captionIg.slice(0, 320)}\n(Post id: ${selected.id})`
      }
    }
    await navigator.clipboard.writeText(text)
    toast.success("Script copied")
  }

  if (!isLoaded || !isHampusEmail(userEmail)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Hampus · Media Desk OS
          </p>
          <h1 className="text-2xl font-bold tracking-tight">What to post · IG + LinkedIn</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Daily briefing, dual captions, mark posted, inbound DM → lead. Dark IG · light LI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/settings/user">
              <ImagePlus className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/leads">Leads</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/pipeline">Deal Board</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/market" target="_blank">
              Public magnet
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {proof ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>AED 10M target</CardDescription>
              <CardTitle className="text-xl font-mono">
                {(proof.monthVolumeAed / 1_000_000).toFixed(1)}M / 10M
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-[#1e3a5f]" style={{ width: `${proof.progressPct}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inbound this month</CardDescription>
              <CardTitle className="text-2xl">{proof.inboundLeads}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Shortlists</CardDescription>
              <CardTitle className="text-2xl">{proof.shortlistsCreated}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Posted IG / LI</CardDescription>
              <CardTitle className="text-2xl">
                {proof.postsIg} / {proof.postsLi}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Month desk posts</CardDescription>
              <CardTitle className="text-2xl">{data?.postedThisMonth ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      {/* Today briefing */}
      <Card className="border-[#1e3a5f]/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Today — post this
          </CardTitle>
          <CardDescription>
            {todayPost
              ? `${todayPost.scheduleLabel} · ${roiRoleLabel(todayPost.roiRole)} · ${todayPost.status === "ready" ? "Live data" : "Needs scrape"}`
              : "Rest day — pick catch-up or any ready post"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {todayPost ? (
            <Button size="sm" onClick={() => setSelectedId(todayPost.id)}>
              Open today&apos;s post
            </Button>
          ) : null}
          {(data?.catchUp || []).slice(0, 3).map((p) => (
            <Button key={p.id} size="sm" variant="outline" onClick={() => setSelectedId(p.id)}>
              Catch-up D{p.scheduleDay}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setInboundOpen((v) => !v)}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Log DM lead
          </Button>
        </CardContent>
      </Card>

      {inboundOpen ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Log inbound (DM / LinkedIn)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={inbound.name} onChange={(e) => setInbound({ ...inbound, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={inbound.phone} onChange={(e) => setInbound({ ...inbound, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Source</Label>
              <Select value={inbound.source} onValueChange={(v) => setInbound({ ...inbound, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram_dm">Instagram DM</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram_organic">IG organic</SelectItem>
                  <SelectItem value="cold_outreach">Cold outreach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Community</Label>
              <Input
                value={inbound.community}
                onChange={(e) => setInbound({ ...inbound, community: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Budget AED</Label>
              <Input
                value={inbound.budgetAed}
                onChange={(e) => setInbound({ ...inbound, budgetAed: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Beds</Label>
              <Input value={inbound.beds} onChange={(e) => setInbound({ ...inbound, beds: e.target.value })} />
            </div>
            <div className="sm:col-span-3">
              <Button onClick={() => void logInbound()} disabled={!inbound.name.trim()}>
                Save to Leads
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Week strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekStrip.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={`min-w-[110px] rounded-lg border px-2.5 py-2 text-left text-xs ${
              selected?.id === p.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <div className="font-bold">D{p.scheduleDay}</div>
            <div className="truncate text-muted-foreground">{p.communityLabel}</div>
            <div className="mt-1 flex gap-1">
              {p.postedIgAt ? <Badge className="text-[9px]">IG</Badge> : null}
              {p.postedLiAt ? <Badge className="text-[9px]" variant="secondary">LI</Badge> : null}
            </div>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : data ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_minmax(0,560px)]">
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="h-4 w-4" />
                    Monthly schedule
                  </CardTitle>
                  <CardDescription>Click → preview → download IG + LI</CardDescription>
                </div>
                <Select value={filterCommunity} onValueChange={setFilterCommunity}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="weekly">Weekly TX</SelectItem>
                    <SelectItem value="arabian-ranches">Arabian Ranches</SelectItem>
                    <SelectItem value="mira-oasis">Mira Oasis</SelectItem>
                    <SelectItem value="mudon">Mudon</SelectItem>
                    <SelectItem value="villanova">Villanova</SelectItem>
                    <SelectItem value="dubai-hills">Dubai Hills</SelectItem>
                    <SelectItem value="town-square">Town Square</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="max-h-[480px] space-y-1.5 overflow-y-auto">
                {filtered.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedId(post.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left ${
                      selected?.id === post.id ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
                      {post.scheduleDay}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="text-sm font-semibold">{post.communityLabel}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {conceptLabel(post.concept)}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          {roiRoleLabel(post.roiRole)}
                        </Badge>
                        <Badge variant={post.status === "ready" ? "default" : "secondary"} className="text-[9px]">
                          {post.status === "ready" ? "Live" : "Scrape"}
                        </Badge>
                        {post.postedIgAt ? <Badge className="text-[9px]">IG✓</Badge> : null}
                        {post.postedLiAt ? <Badge className="text-[9px]">LI✓</Badge> : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {post.hook}
                      </span>
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Playbook
                </CardTitle>
                <CardDescription>DM · LI · cold with proof · list-like-a-brand</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void copyPlaybook("dmReply")}>
                  Copy DM reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => void copyPlaybook("liReply")}>
                  Copy LI reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => void copyPlaybook("coldOwner")}>
                  Cold owner + proof
                </Button>
                <Button size="sm" variant="outline" onClick={() => void copyPlaybook("coldBuyer")}>
                  Cold buyer + proof
                </Button>
                <Button size="sm" variant="default" onClick={() => void copyPlaybook("ownerBrandPitch")}>
                  Owner brand pitch
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brand bible (Serhant Step 1)</CardTitle>
                <CardDescription>Identity · audience · 8-second rule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{HAMPUS_BRAND_BIBLE.identity}</p>
                <p className="text-muted-foreground">{HAMPUS_BRAND_BIBLE.superpower}</p>
                <p className="text-xs text-muted-foreground">{HAMPUS_BRAND_BIBLE.eightSecondHook}</p>
                <p className="text-xs text-muted-foreground">{HAMPUS_BRAND_BIBLE.consistencyRule}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {BRAND_QUARTERLY_CHECK.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">List like a brand</CardTitle>
                <CardDescription>Seller questions + luxury listing pillars</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
                  {LISTING_AS_BRAND_PITCH.sellerQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const community = selected?.communityLabel || "Mudon"
                    await navigator.clipboard.writeText(
                      fillCommunity(LISTING_AS_BRAND_PITCH.ownerPitchScript, community)
                    )
                    toast.success("Owner listing-brand script copied")
                  }}
                >
                  Copy full owner pitch
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reel scripts (video &gt; photos)</CardTitle>
                <CardDescription>15s educate + entertain — Serhant media presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {REEL_SCRIPTS.map((reel) => (
                  <div key={reel.id} className="rounded-lg border p-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{reel.title}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={async () => {
                          const community = selected?.communityLabel || "Dubai Land"
                          const text = [
                            reel.title,
                            "",
                            ...reel.beats,
                            "",
                            fillCommunity(reel.captionHook, community),
                          ].join("\n")
                          await navigator.clipboard.writeText(text)
                          toast.success("Reel script copied")
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      {reel.beats.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily SOP + Stories lines</CardTitle>
                <CardDescription>Broadcast consistently — then measure DMs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
                  {MEDIA_DESK_DAILY_SOP.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!selected) return
                    const sale = formatAedCompact(
                      selected.metrics.saleAvg ?? selected.metrics.saleMedian
                    )
                    const rent = formatAedCompact(
                      selected.metrics.rentAvg ?? selected.metrics.rentMedian
                    )
                    const lines = STORIES_OVERLAY_LINES(selected.communityLabel, sale, rent)
                    await navigator.clipboard.writeText(lines.join("\n"))
                    toast.success("Stories overlay lines copied")
                  }}
                >
                  Copy Stories overlays
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {selected && data.agent ? (
              <>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={theme === "instagram" ? "default" : "outline"}
                    onClick={() => setTheme("instagram")}
                  >
                    IG dark
                  </Button>
                  <Button
                    size="sm"
                    variant={theme === "linkedin" ? "default" : "outline"}
                    onClick={() => setTheme("linkedin")}
                  >
                    LI light
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-2xl border bg-neutral-950 p-3">
                  <div
                    className="mx-auto overflow-hidden"
                    style={{ width: SOCIAL_EXPORT_WIDTH / 2, height: SOCIAL_EXPORT_HEIGHT / 2 }}
                  >
                    <div
                      style={{
                        transform: "scale(0.5)",
                        transformOrigin: "top left",
                        width: SOCIAL_EXPORT_WIDTH,
                        height: SOCIAL_EXPORT_HEIGHT,
                      }}
                    >
                      <SocialCard post={selected} agent={data.agent} theme={theme} cardRef={cardRef} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => void downloadPng("instagram")} disabled={exporting}>
                    <Download className="mr-1.5 h-4 w-4" />
                    IG PNG
                  </Button>
                  <Button onClick={() => void downloadPng("linkedin")} disabled={exporting} variant="secondary">
                    <Download className="mr-1.5 h-4 w-4" />
                    LI PNG
                  </Button>
                  <Button variant="outline" onClick={() => void copyCaption("ig")}>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy IG
                  </Button>
                  <Button variant="outline" onClick={() => void copyCaption("li")}>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy LI
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void markPosted("instagram")} disabled={marking}>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Mark IG posted
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void markPosted("linkedin")} disabled={marking}>
                    Mark LI posted
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void markPosted("both")} disabled={marking}>
                    Mark both
                  </Button>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">IG caption</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-2 text-[11px]">
                      {selected.captionIg}
                    </pre>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">LinkedIn caption (long)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-2 text-[11px]">
                      {selected.captionLi}
                    </pre>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
