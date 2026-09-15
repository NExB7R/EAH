import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

const schema = z.object({
  business_id: z.string().uuid(),
  action: z.enum(['add', 'remove']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const { business_id, action } = parsed.data

    if (action === 'remove') {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', business_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, business_id })
      // ignore duplicate
      if (error && error.code !== '23505') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  return POST(request)
}
