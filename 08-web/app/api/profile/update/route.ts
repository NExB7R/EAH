import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const AVATAR_KEYS = ['av1','av2','av3','av4','av5','av6','av7','av8','av9','av10','av11','av12']

const schema = z.object({
  display_name: z.string().trim().min(2).max(40),
  bio: z.string().trim().max(200).nullable().optional(),
  gender: z.enum(['male', 'female']).nullable().optional(),
  avatar_key: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json(
        { ok: false, error: 'الجلسة انتهت — سجّل دخول تاني' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'البيانات مش مظبوطة', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const updates: Record<string, unknown> = {
      display_name: data.display_name,
      bio: data.bio || null,
      gender: data.gender || null,
    }

    // avatar_key أو avatar_url (واحد منهم)
    if (data.avatar_url) {
      updates.avatar_url = data.avatar_url
      updates.avatar_key = null
    } else if (data.avatar_key && AVATAR_KEYS.includes(data.avatar_key)) {
      updates.avatar_key = data.avatar_key
      updates.avatar_url = null
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateErr) {
      console.error('[profile/update] DB error:', updateErr)
      return NextResponse.json(
        { ok: false, error: updateErr.message, code: updateErr.code },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile/update] exception:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
