import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { sendSigningRequest } from '@/lib/documents/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createUntypedServerClient()

  // Fetch document with template
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*, templates(name)')
    .eq('id', id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (!doc.signer_email || !doc.signer_name) {
    return NextResponse.json({ error: 'Signer details missing' }, { status: 400 })
  }

  // Send the signing email
  try {
    await sendSigningRequest({
      signerEmail: doc.signer_email,
      signerName: doc.signer_name,
      agentName: doc.agent_name,
      documentName: (doc as unknown as { templates: { name: string } }).templates?.name || 'Document',
      signToken: doc.sign_token,
    })
  } catch (emailError) {
    console.error('Failed to send signing email:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Update document status to sent
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
