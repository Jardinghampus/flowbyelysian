"use client"

import type { ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BayutLinkRef } from "@/lib/zaylo/bayut-links"

type BayutLinkProps = {
  link: BayutLinkRef | null | undefined
  /** Compact table cell vs full mobile label */
  variant?: "table" | "inline" | "icon"
  className?: string
  children?: ReactNode
}

export function BayutLink({ link, variant = "table", className, children }: BayutLinkProps) {
  if (!link?.url) {
    return <span className={cn("text-muted-foreground", className)}>—</span>
  }

  const label = children ?? (variant === "inline" ? link.label || "Open" : "Open")

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.label || "Open on Bayut"}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline",
        variant === "icon" && "text-muted-foreground hover:text-primary",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {variant === "icon" ? (
        <ExternalLink className="h-4 w-4" />
      ) : (
        <>
          {label} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </>
      )}
    </a>
  )
}

type BayutTitleLinkProps = {
  href: string | null | undefined
  title: string
  subtitle?: string | null
  className?: string
}

/** Title that opens Bayut when a URL exists; plain text otherwise. */
export function BayutTitleLink({ href, title, subtitle, className }: BayutTitleLinkProps) {
  const content = (
    <>
      <div className="font-medium leading-snug line-clamp-2">{title || "—"}</div>
      {subtitle ? <div className="text-xs text-muted-foreground font-mono">{subtitle}</div> : null}
    </>
  )

  if (!href) {
    return <div className={cn("max-w-[220px]", className)}>{content}</div>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block max-w-[220px] hover:underline", className)}
      title="Open on Bayut"
    >
      {content}
    </a>
  )
}
