import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(72),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'بيانات مش صحيحة' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ ok: false, error: 'الجلسة انتهت' }, { status: 401 })
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.current_password,
    })
    if (signInErr) {
      return NextResponse.json({ ok: false, error: 'كلمة المرور الحالية غلط' }, { status: 400 })
    }

    const { error: upErr } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
    })
    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 })
    }

    await supabase.auth.signOut({ scope: 'others' })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : 'حصل خطأ'
    }, { status: 500 })
  }
}
