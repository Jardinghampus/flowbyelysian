import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createUntypedServerClient()

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*, templates(name, type, content_json, variables)')
    .eq('id', id)
    .single()

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 404 })
  }

  const { data: fields } = await supabase
    .from('document_fields')
    .select('*')
    .eq('document_id', id)

  const { data: signatures } = await supabase
    .from('signatures')
    .select('*')
    .eq('document_id', id)

  return NextResponse.json({
    ...doc,
    fields: fields || [],
    signatures: signatures || [],
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createUntypedServerClient()
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.signer_email !== undefined) updateData.signer_email = body.signer_email
  if (body.signer_name !== undefined) updateData.signer_name = body.signer_name
  if (body.sent_at !== undefined) updateData.sent_at = body.sent_at
  if (body.signed_at !== undefined) updateData.signed_at = body.signed_at
  if (body.pdf_url !== undefined) updateData.pdf_url = body.pdf_url

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
