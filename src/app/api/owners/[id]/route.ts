import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { emitActivityEvent, emitAuditLog } from "@/lib/audit/events"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import {
  fetchOwnerById, updateOwner, deleteOwner, hideOwner, restoreOwner,
  fetchOutreachLogs, fetchLinkedListings,
} from "@/app/app/data/_lib/supabase-queries"
import { updateOwnerSchema } from "@/app/app/data/_lib/schemas"

function asAuditData(value: unknown): Record<string, unknown> | null {
  return value ? (value as Record<string, unknown>) : null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const owner = await fetchOwnerById(id)
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 })
    }

    const [logs, linkedListings] = await Promise.all([
      fetchOutreachLogs(id),
      fetchLinkedListings(id),
    ])

    return NextResponse.json({ owner, logs, linkedListings })
  } catch (error) {
    console.error("Error fetching owner:", error)
    return NextResponse.json({ error: "Failed to fetch owner" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const before = await fetchOwnerById(id).catch(() => null)
    const auditClient = createUntypedServerClient()

    // Handle archive/restore actions
    if (body._action === "hide") {
      await hideOwner(id)
      await emitActivityEvent(auditClient, {
        actor: { userId },
        entityType: "owner",
        entityId: id,
        eventType: "owner.hidden",
        title: "Owner archived",
        source: "api",
      })
      await emitAuditLog(auditClient, {
        actor: { userId },
        action: "owner.hide",
        targetType: "owner",
        targetId: id,
        beforeData: asAuditData(before),
        metadata: { route: "/api/owners/[id]" },
      })
      return NextResponse.json({ success: true })
    }
    if (body._action === "restore") {
      await restoreOwner(id)
      await emitActivityEvent(auditClient, {
        actor: { userId },
        entityType: "owner",
        entityId: id,
        eventType: "owner.restored",
        title: "Owner restored",
        source: "api",
      })
      await emitAuditLog(auditClient, {
        actor: { userId },
        action: "owner.restore",
        targetType: "owner",
        targetId: id,
        beforeData: asAuditData(before),
        metadata: { route: "/api/owners/[id]" },
      })
      return NextResponse.json({ success: true })
    }

    const parsed = updateOwnerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const owner = await updateOwner(id, parsed.data as never)
    await emitActivityEvent(auditClient, {
      actor: { userId },
      entityType: "owner",
      entityId: id,
      eventType: "owner.updated",
      title: "Owner updated",
      source: "api",
      payload: { updatedFields: Object.keys(parsed.data) },
    })
    await emitAuditLog(auditClient, {
      actor: { userId },
      action: "owner.update",
      targetType: "owner",
      targetId: id,
      beforeData: asAuditData(before),
      afterData: asAuditData(owner),
      metadata: { updatedFields: Object.keys(parsed.data) },
    })
    return NextResponse.json({ owner })
  } catch (error) {
    console.error("Error updating owner:", error)
    return NextResponse.json({ error: "Failed to update owner" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const before = await fetchOwnerById(id).catch(() => null)
    await deleteOwner(id)
    const auditClient = createUntypedServerClient()
    await emitActivityEvent(auditClient, {
      actor: { userId },
      entityType: "owner",
      entityId: id,
      eventType: "owner.deleted",
      title: "Owner deleted",
      source: "api",
    })
    await emitAuditLog(auditClient, {
      actor: { userId },
      action: "owner.delete",
      targetType: "owner",
      targetId: id,
      beforeData: asAuditData(before),
      metadata: { route: "/api/owners/[id]" },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting owner:", error)
    return NextResponse.json({ error: "Failed to delete owner" }, { status: 500 })
  }
}
