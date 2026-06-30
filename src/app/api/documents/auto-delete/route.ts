import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { auth, currentUser } from '@/lib/demo-auth'

// GET - retrieve the current auto-delete setting
export async function GET() {
  const supabase = createUntypedServerClient()

  const { data, error } = await supabase
    .from('document_settings')
    .select('auto_delete_months')
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ auto_delete_months: null })
  }

  return NextResponse.json({ auto_delete_months: data?.auto_delete_months ?? null })
}

// PUT - update the auto-delete setting (admin only)
export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createUntypedServerClient()
  const body = await req.json()
  const autoDeleteMonths = body.auto_delete_months

  // Validate
  if (autoDeleteMonths !== null && ![3, 6, 9, 12].includes(autoDeleteMonths)) {
    return NextResponse.json({ error: 'Invalid value. Must be 3, 6, 9, 12, or null.' }, { status: 400 })
  }

  // Update the singleton document_settings row
  const { data: existing } = await supabase
    .from('document_settings')
    .select('id')
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('document_settings')
      .update({ auto_delete_months: autoDeleteMonths })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('document_settings')
      .insert({ auto_delete_months: autoDeleteMonths })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, auto_delete_months: autoDeleteMonths })
}

// POST - run cleanup now (delete signed docs older than the configured threshold)
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createUntypedServerClient()

  // Get the auto-delete setting
  const { data: settings } = await supabase
    .from('document_settings')
    .select('auto_delete_months')
    .limit(1)
    .single()

  const months = settings?.auto_delete_months
  if (!months) {
    return NextResponse.json({ deleted_count: 0, message: 'Auto-delete is disabled' })
  }

  // Calculate cutoff date
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)

  // Find signed documents older than cutoff
  const { data: oldDocs, error: fetchError } = await supabase
    .from('documents')
    .select('id, pdf_url')
    .eq('status', 'signed')
    .lt('signed_at', cutoff.toISOString())

  if (fetchError || !oldDocs || oldDocs.length === 0) {
    return NextResponse.json({ deleted_count: 0 })
  }

  // Delete PDFs from storage
  const pdfPaths = oldDocs
    .map((d: any) => d.pdf_url)
    .filter(Boolean)

  if (pdfPaths.length > 0) {
    await supabase.storage.from('signed-documents').remove(pdfPaths)
  }

  // Delete the documents (cascades to fields and signatures)
  const ids = oldDocs.map((d: any) => d.id)
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .in('id', ids)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ deleted_count: ids.length })
}
