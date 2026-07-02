import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/guards'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function POST(req: NextRequest) {
  const guard = await requireApiUser({ roles: ['admin', 'manager'] })
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()

  const formData = await req.formData()
  const file = formData.get('logo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)
  const ext = file.name.split('.').pop() || 'png'
  const fileName = `document-header-logo-${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('document-assets')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    // If bucket doesn't exist, create it and retry
    if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
      await supabase.storage.createBucket('document-assets', { public: true })
      const { error: retryError } = await supabase.storage
        .from('document-assets')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        })
      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('document-assets')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl, path: fileName })
}
