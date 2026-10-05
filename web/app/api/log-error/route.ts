import { NextResponse } from 'next/server'
import { logError } from '@/lib/logging/errors'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// ═══════════════════════════════════════════════════════════
// EAH — Client Error Logging Endpoint
//   • rate-limited ضمنياً بـ Next.js
//   • ياخد من الـ client (error boundaries)
// ═══════════════════════════════════════════════════════════

type Body = {
  message?: string
  stack?: string
  path?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // نجيب المستخدم لو مسجّل
    let userId: string | undefined
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    } catch {
      // مش مشكلة — زائر
    }

    const h = await headers()
    const userAgent = h.get('user-agent') ?? undefined

    await logError({
      severity: body.severity ?? 'medium',
      source: 'client',
      message: body.message,
      stack: body.stack,
      path: body.path,
      userId,
      metadata: { userAgent },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
