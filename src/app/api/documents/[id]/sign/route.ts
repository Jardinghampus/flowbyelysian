import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { generateDocumentPdf } from '@/lib/documents/pdf'
import type { DocumentHeaderSettings } from '@/lib/documents/pdf'

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

  // Fetch document header settings (always use defaults as fallback)
  const defaultHeaderSettings: DocumentHeaderSettings = {
    header_logo_url: null,
    company_name: 'DERRICK SIGNATURE PROPERTIES L.L.C',
    company_phone: '+ 971 (0) 4 295 5397',
    company_email: 'info@derricksignatureproperties.ae',
    company_website: 'www.derricksignatureproperties.ae',
    company_address: 'Office 605, Al Barsha Business Square, Dubai, UAE',
  }
  let headerSettings: DocumentHeaderSettings = defaultHeaderSettings
  const { data: settingsData } = await supabase
    .from('document_settings')
    .select('*')
    .limit(1)
    .single()
  if (settingsData) {
    headerSettings = { ...defaultHeaderSettings, ...settingsData } as DocumentHeaderSettings
  }

  // Generate PDF with signature and header
  const pdfBytes = await generateDocumentPdf(cleanContent, fieldMap, signatureBase64, headerSettings)

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

  // Notify the agent that the document was signed
  if (doc.agent_id) {
    const templateName =
      (doc as { templates?: { name?: string } | null }).templates?.name || "Document"
    await supabase.from("notifications").insert({
      user_id: doc.agent_id,
      type: "document_signed",
      title: "Document signed",
      message: `${signerName || doc.signer_name || "Client"} signed "${templateName}"`,
      link: `/app/documents/${id}`,
      read: false,
      created_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ success: true, pdfUrl })
}
