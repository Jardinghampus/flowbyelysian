import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/guards'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET(req: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agent_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('documents')
    .select('*, templates(name, type), document_fields(field_key, field_value)')
    .order('created_at', { ascending: false })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()
  const body = await req.json()

  // Create the document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      template_id: body.template_id,
      agent_id: body.agent_id,
      agent_email: body.agent_email,
      agent_name: body.agent_name,
      status: body.status || 'draft',
      signer_email: body.signer_email,
      signer_name: body.signer_name,
      sent_at: body.status === 'sent' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 })
  }

  // Insert field values
  if (body.fields && Object.keys(body.fields).length > 0) {
    const fieldRows = Object.entries(body.fields).map(([key, value]) => ({
      document_id: doc.id,
      field_key: key,
      field_value: value as string,
    }))

    const { error: fieldsError } = await supabase
      .from('document_fields')
      .insert(fieldRows)

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 })
    }
  }

  return NextResponse.json(doc, { status: 201 })
}
