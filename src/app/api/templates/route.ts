import { NextRequest, NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

export async function GET() {
  const supabase = createUntypedServerClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createUntypedServerClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: body.name,
      type: body.type,
      content_json: body.content_json,
      variables: body.variables,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
