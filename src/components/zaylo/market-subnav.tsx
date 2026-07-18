"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/app/market-listings", label: "Active Listings" },
  { href: "/app/market-transactions", label: "Transactions" },
] as const

export function MarketSubnav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
