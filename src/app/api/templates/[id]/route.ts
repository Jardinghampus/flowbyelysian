import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/guards'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { id } = await params
  const supabase = createUntypedServerClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser({ roles: ['admin', 'manager'] })
  if (!guard.ok) return guard.response

  const { id } = await params
  const supabase = createUntypedServerClient()
  const body = await req.json()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.content_json !== undefined) updateData.content_json = body.content_json
  if (body.variables !== undefined) updateData.variables = body.variables

  const { data, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
