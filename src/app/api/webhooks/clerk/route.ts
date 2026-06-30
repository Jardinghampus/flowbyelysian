import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { clerkClient } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

type ClerkUserCreatedEvent = {
  type: "user.created"
  data: {
    id: string
    first_name: string | null
    last_name: string | null
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    image_url: string
    public_metadata: Record<string, unknown>
  }
}

type ClerkEvent = ClerkUserCreatedEvent | { type: string; data: unknown }

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  // Verify webhook signature
  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  const payload = await request.text()

  let event: ClerkEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true })
  }

  const { data } = event as ClerkUserCreatedEvent
  const userId = data.id
  const firstName = data.first_name || ""
  const lastName = data.last_name || ""
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown"
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address || data.email_addresses[0]?.email_address || ""

  try {
    const client = await clerkClient()

    // Ensure role is set — invitation metadata is auto-applied by Clerk,
    // but default to "agent" if somehow missing
    const existingRole = data.public_metadata?.role as string | undefined
    if (!existingRole) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...data.public_metadata,
          role: "agent",
        },
      })
    }

    const role = existingRole || "agent"
    const area = data.public_metadata?.area as string | undefined

    // Create contacts record in Supabase for the new user
    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("contacts")
      .upsert(
        {
          clerk_user_id: userId,
          name: fullName,
          email: primaryEmail,
          avatar_url: data.image_url || null,
          role: role === "admin" ? "Sales" : "Sales",
          title: role === "admin" ? "Administrator" : "Sales Agent",
        },
        { onConflict: "clerk_user_id" }
      )

    // Create default area assignment if area was set during invitation
    if (area) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: areaData } = await (supabase as any)
        .from("areas")
        .select("id")
        .eq("slug", area)
        .single()

      if (areaData?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("agent_area_assignments")
          .upsert(
            {
              agent_id: userId,
              area_id: areaData.id,
              is_primary: true,
            },
            { onConflict: "agent_id,area_id" }
          )
      }
    }

    console.log(`User ${userId} (${primaryEmail}) created with role: ${role}`)
    return NextResponse.json({ success: true, userId, role })
  } catch (error) {
    console.error("Error handling user.created webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
