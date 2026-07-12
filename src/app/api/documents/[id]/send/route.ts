import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { emitActivityEvent } from "@/lib/audit/events"

/**
 * Activate signing via shareable link (primary flow).
 * Email is intentionally NOT sent — agents share the link via WhatsApp/SMS themselves.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { id } = await params
  const supabase = createUntypedServerClient()

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*, templates(name)")
    .eq("id", id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  if (doc.agent_id !== guard.context.userId && guard.context.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const signToken = doc.sign_token as string
  const origin = process.env.NEXT_PUBLIC_APP_URL || ""
  const signUrl = `${origin}/sign/${signToken}`

  await emitActivityEvent(supabase, {
    actor: {
      userId: guard.context.userId,
      role: guard.context.role,
      name: guard.context.fullName,
    },
    entityType: "document",
    entityId: id,
    eventType: "document.sign_link_activated",
    title: "Signing link activated",
    body: (doc.templates as { name?: string } | null)?.name || "Document",
    payload: {
      signerName: doc.signer_name,
      signerEmail: doc.signer_email,
      signToken,
    },
  })

  return NextResponse.json({
    success: true,
    signToken,
    signUrl,
  })
}
