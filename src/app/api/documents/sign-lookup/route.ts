import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const supabase = createUntypedServerClient()

  // Look up document by sign_token
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*, templates(name, type, content_json, variables)')
    .eq('sign_token', token)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Fetch fields
  const { data: fields } = await supabase
    .from('document_fields')
    .select('*')
    .eq('document_id', doc.id)

  return NextResponse.json({
    ...doc,
    fields: fields || [],
  })
}
