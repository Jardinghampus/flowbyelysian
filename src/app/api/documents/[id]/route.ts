import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { auth, currentUser } from '@/lib/demo-auth'

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createUntypedServerClient()

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'

  // Fetch the document first to verify ownership
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, agent_id, pdf_url')
    .eq('id', id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Only the owning agent or an admin can delete
  if (doc.agent_id !== userId && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete the signed PDF from storage if it exists
  if (doc.pdf_url) {
    await supabase.storage.from('signed-documents').remove([doc.pdf_url])
  }

  // Delete the document (cascades to document_fields and signatures)
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
