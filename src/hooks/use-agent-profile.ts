"use client"

import { useEffect, useState } from "react"
import type { AgentProfile } from "@/lib/brand"

export function useAgentProfilesMap(userIds: string[]) {
  const [profiles, setProfiles] = useState<Record<string, AgentProfile>>({})

  useEffect(() => {
    const ids = [...new Set(userIds.filter(Boolean))]
    if (!ids.length) {
      setProfiles({})
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/user/profiles?ids=${encodeURIComponent(ids.join(","))}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = (await res.json()) as { profiles: Record<string, AgentProfile> }
        if (!cancelled) setProfiles(data.profiles || {})
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userIds.join(",")])

  return profiles
}

export function useMyAgentProfile() {
  const [profile, setProfile] = useState<AgentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { profile: AgentProfile }
        if (!cancelled) setProfile(data.profile)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, loading }
}
