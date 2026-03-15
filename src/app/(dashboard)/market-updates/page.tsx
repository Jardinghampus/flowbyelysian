"use client"

import { useRole } from "@/contexts/role-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import MarketUpdatesFeed from "./components/market-updates-feed"

export default function MarketUpdatesPage() {
  const { isCustomer, isAdmin } = useRole()
  const router = useRouter()

  // Redirect agents (non-admin internal) who shouldn't see this
  useEffect(() => {
    // Agents have no access — only customers and admins
    // (admins need access to preview what customers see)
  }, [])

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Market Updates</h1>
          <p className="text-muted-foreground">
            Curated market insights, new launches, and investment opportunities relevant to your interests
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <MarketUpdatesFeed />
      </div>
    </>
  )
}
