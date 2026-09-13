import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { business_id, method_type, visitor_hash } = await req.json()

    if (!business_id || !method_type || !visitor_hash) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('reveal_contact', {
      p_business_id: business_id,
      p_method_type: method_type,
      p_visitor_hash: visitor_hash,
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ...(data as object) })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
