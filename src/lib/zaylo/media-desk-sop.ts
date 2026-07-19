/**
 * Daily / weekly operating SOP for Media Desk (Hampus).
 * Serhant: consistent broadcast + measure what moves the needle.
 */

export const MEDIA_DESK_DAILY_SOP = [
  "Open Media Desk → Today briefing",
  "If Needs scrape → Dashboard Update scraper → run process-queue",
  "Download IG dark PNG + LI light PNG",
  "Copy IG caption → post Feed; Copy LI caption → post LinkedIn",
  "Optional: shoot 15s Reel from Reel scripts panel",
  "Mark IG + LI posted",
  "Reply every Market / Shortlist / Owner DM within hours → Log inbound",
  "Cold block: 10 owners with Owner brand pitch + this week's proof PNG",
]

export const MEDIA_DESK_WEEKLY_SOP = [
  "Mon: New transactions (5) — proof post",
  "Tue–Thu: Education / deep dive / pulse per schedule",
  "Fri: What I'd buy or List like a brand",
  "Sat: Optional viral / 8-second hook",
  "Sun: Catch-up or rest",
  "Friday review: DMs logged, shortlists sent, viewings, volume vs AED 10M",
  "Quarterly: run Brand bible checklist",
]

export const STORIES_OVERLAY_LINES = (community: string, sale: string, rent: string) => [
  `${community.toUpperCase()}`,
  `Sale ${sale}`,
  `Rent ${rent}`,
  `Pulse ≠ deal`,
  `DM Market`,
]
