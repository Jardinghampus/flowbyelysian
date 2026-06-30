import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET() {
  const supabase = createUntypedServerClient()

  const { data, error } = await supabase
    .from('document_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    // If no row exists yet, return defaults
    if (error.code === 'PGRST116') {
      return NextResponse.json({
        company_name: 'DERRICK SIGNATURE PROPERTIES L.L.C',
        company_phone: '+ 971 (0) 4 295 5397',
        company_email: 'info@derricksignatureproperties.ae',
        company_website: 'www.derricksignatureproperties.ae',
        company_address: 'Office 605, Al Barsha Business Square, Dubai, UAE',
        header_logo_url: null,
        header_display_name: 'ZFLOW',
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const supabase = createUntypedServerClient()
  const body = await req.json()

  // Check if a row exists
  const { data: existing } = await supabase
    .from('document_settings')
    .select('id')
    .limit(1)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('document_settings')
      .update({
        company_name: body.company_name,
        company_phone: body.company_phone,
        company_email: body.company_email,
        company_website: body.company_website,
        company_address: body.company_address,
        header_logo_url: body.header_logo_url,
        header_display_name: body.header_display_name || 'ZFLOW',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  // Create new row
  const { data, error } = await supabase
    .from('document_settings')
    .insert({
      company_name: body.company_name,
      company_phone: body.company_phone,
      company_email: body.company_email,
      company_website: body.company_website,
      company_address: body.company_address,
      header_logo_url: body.header_logo_url,
      header_display_name: body.header_display_name || 'ZFLOW',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
