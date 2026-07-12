import { NextResponse } from "next/server"
import { z } from "zod"
import { requireSocialAccess } from "@/lib/api/guards"
import { createZayloSourceLink } from "@/lib/zaylo/market-store"

const sourceLinkSchema = z.object({
  areaSlug: z.string().min(1),
  kind: z.enum([
    "bayut_rent_listings",
    "bayut_sale_listings",
    "bayut_rent_transactions",
    "bayut_sale_transactions",
    "dxb_interact_transactions",
    "manual",
  ]),
  label: z.string().min(1).max(120),
  url: z.string().url(),
})

export async function POST(request: Request) {
  const guard = await requireSocialAccess()
  if (!guard.ok) return guard.response

  const parsed = sourceLinkSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid source link payload", issues: parsed.error.flatten() }, { status: 400 })
  }

  const result = await createZayloSourceLink(parsed.data)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ sourceLink: result.sourceLink }, { status: result.status })
}
