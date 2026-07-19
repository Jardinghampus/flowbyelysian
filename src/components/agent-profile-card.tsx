"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  initialsFromName,
  TEAM_COMPANY_NAME,
  TEAM_COMPANY_WEBSITE,
  TEAM_COLOR,
  type AgentProfile,
} from "@/lib/brand"

export type AgentProfileCardProps = {
  profile: Partial<AgentProfile> & { fullName: string }
  size?: "sm" | "md" | "lg"
  showCompany?: boolean
  showWebsite?: boolean
  showRole?: boolean
  className?: string
}

const sizeMap = {
  sm: { avatar: "h-8 w-8", name: "text-xs", meta: "text-[10px]" },
  md: { avatar: "h-10 w-10", name: "text-sm", meta: "text-xs" },
  lg: { avatar: "h-14 w-14", name: "text-base", meta: "text-sm" },
}

export function AgentProfileCard({
  profile,
  size = "md",
  showCompany = true,
  showWebsite = false,
  showRole = false,
  className,
}: AgentProfileCardProps) {
  const s = sizeMap[size]
  const company = profile.company || TEAM_COMPANY_NAME
  const website = profile.website || TEAM_COMPANY_WEBSITE

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <Avatar
        className={cn(s.avatar, "rounded-full ring-2 ring-white/80 shadow-sm shrink-0")}
        style={{ boxShadow: `0 0 0 2px ${TEAM_COLOR}22` }}
      >
        <AvatarImage src={profile.profileImageUrl || undefined} alt={profile.fullName} />
        <AvatarFallback
          className="rounded-full text-white font-semibold"
          style={{ backgroundColor: TEAM_COLOR }}
        >
          {initialsFromName(profile.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className={cn("font-semibold leading-tight truncate", s.name)}>{profile.fullName}</p>
        {showRole && profile.jobTitle ? (
          <p className={cn("text-muted-foreground truncate", s.meta)}>{profile.jobTitle}</p>
        ) : null}
        {showCompany ? (
          <p className={cn("text-muted-foreground truncate", s.meta)}>{company}</p>
        ) : null}
        {showWebsite ? (
          <p className={cn("truncate", s.meta)} style={{ color: TEAM_COLOR }}>
            {website}
          </p>
        ) : null}
      </div>
    </div>
  )
}
