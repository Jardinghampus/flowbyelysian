import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { generateDocumentPdf } from '@/lib/documents/pdf'
import { sendSignedConfirmation } from '@/lib/documents/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createUntypedServerClient()
  const { signatureBase64, signerName } = await req.json()

  // Get signer IP
  const signerIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Load document + template + fields
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*, templates(name, type, content_json, variables)')
    .eq('id', id)
    .single()

  if (docError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (doc.status !== 'sent') {
    return NextResponse.json({ error: 'Document is not available for signing' }, { status: 400 })
  }

  const { data: fields } = await supabase
    .from('document_fields')
    .select('*')
    .eq('document_id', id)

  // Build field map
  const fieldMap: Record<string, string> = {}
  for (const field of fields || []) {
    fieldMap[field.field_key] = field.field_value
  }

  // Get template content
  const template = (doc as unknown as { templates: { name: string; content_json: string } }).templates
  const templateContent = typeof template.content_json === 'string'
    ? template.content_json
    : JSON.stringify(template.content_json)

  // Clean content - remove outer quotes if wrapped as a JSON string
  let cleanContent = templateContent
  if (cleanContent.startsWith('"') && cleanContent.endsWith('"')) {
    try {
      cleanContent = JSON.parse(cleanContent)
    } catch {
      // keep as-is
    }
  }

  // Generate PDF with signature
  const pdfBytes = await generateDocumentPdf(cleanContent, fieldMap, signatureBase64)

  // Upload to Supabase Storage
  const fileName = `signed-${id}-${Date.now()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('signed-documents')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    // If bucket doesn't exist, try creating it
    if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
      await supabase.storage.createBucket('signed-documents', { public: false })
      await supabase.storage
        .from('signed-documents')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: false,
        })
    } else {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
    }
  }

  // Get signed URL
  const { data: signedUrl } = await supabase.storage
    .from('signed-documents')
    .createSignedUrl(fileName, 3600) // 1 hour

  const pdfUrl = signedUrl?.signedUrl || ''

  // Update document status
  await supabase
    .from('documents')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      pdf_url: fileName, // Store path, generate signed URLs on demand
    })
    .eq('id', id)

  // Save signature
  await supabase
    .from('signatures')
    .insert({
      document_id: id,
      image_base64: signatureBase64,
      signer_ip: signerIp,
    })

  // Send confirmation email to agent
  try {
    await sendSignedConfirmation({
      agentEmail: doc.agent_email,
      agentName: doc.agent_name,
      signerName: signerName || doc.signer_name || 'Client',
      documentName: template.name || 'Document',
      pdfUrl,
    })
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
    // Don't fail the signing flow for email errors
  }

  return NextResponse.json({ success: true, pdfUrl })
}
