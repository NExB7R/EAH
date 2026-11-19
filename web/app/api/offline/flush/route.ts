import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Offline Queue Flush
// Idempotent: select+insert/delete (لا toggle — retry-safe)
// review/comment: form-data → 409 discard (لا يمكن حفظها)
// ═══════════════════════════════════════════════════════════

const PayloadSchema = z.object({
  type: z.enum(['favorite', 'follow', 'like', 'review', 'comment']),
  payload: z.record(z.string(), z.unknown()),
})

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit (30 flushes/min — كافٍ)
  const rl = await checkRateLimit(apiLimiter, `offline-flush:${user.id}`, { failClosed: true })
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: rl.error }, { status: 429 })
  }

  // 3. Parse + validate
  const body = await req.json().catch(() => null)
  const parsed = PayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  const { type, payload } = parsed.data

  // 4. review/comment — form-data, غير قابل للـ queue
  if (type === 'review' || type === 'comment') {
    return NextResponse.json(
      { ok: false, error: 'online_only', discard: true, code: 'FORM_DATA_NOT_QUEUEABLE' },
      { status: 409 },
    )
  }

  // 5. favorite/follow → business_activities
  if (type === 'favorite' || type === 'follow') {
    const { businessId, action } = payload as { businessId?: unknown; action?: unknown }
    if (typeof businessId !== 'string' || (action !== 'add' && action !== 'remove')) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }

    if (action === 'add') {
      const { data: existing } = await supabase
        .from('business_activities')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .eq('activity_type', type)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('business_activities').insert({
          business_id: businessId,
          user_id: user.id,
          activity_type: type,
        })
        if (error && error.code !== '23505') {
          return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
        }
      }
    } else {
      const { error } = await supabase
        .from('business_activities')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .eq('activity_type', type)
      if (error) {
        return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  }

  // 6. like → comment_likes
  if (type === 'like') {
    const { commentId, action } = payload as { commentId?: unknown; action?: unknown }
    if (typeof commentId !== 'string' || (action !== 'add' && action !== 'remove')) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }

    if (action === 'add') {
      const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id })
        if (error && error.code !== '23505') {
          return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
        }
      }
    } else {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
      if (error) {
        return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'unknown_type' }, { status: 400 })
}
