import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { business_id, method_type } = body

    if (!business_id || !method_type) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = await createClient()
    await supabase.from('page_view_events').insert({
      business_id,
      path: `contact-reveal:${method_type}`,
      event_scope: 'contact_reveal',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
