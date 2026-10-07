import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/server'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { reviewQualityScore } from '@/lib/review-dimensions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Offline Flush Endpoint
// يبعت العمليات المعلقة لما النت يرجع
// ═══════════════════════════════════════════════════════════

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('review'),
    payload: z.object({
      businessId: z.string().uuid(),
      slug: z.string(),
      dimensions: z.record(z.string(), z.number().int().min(1).max(5)),
      comment: z.string().min(10).max(500),
    }),
  }),
  z.object({
    type: z.literal('comment'),
    payload: z.object({
      businessId: z.string().uuid(),
      slug: z.string(),
      content: z.string().min(1).max(500),
      parentId: z.string().uuid().nullable().optional(),
    }),
  }),
  z.object({
    type: z.literal('favorite'),
    payload: z.object({ businessId: z.string().uuid(), action: z.enum(['add', 'remove']) }),
  }),
  z.object({
    type: z.literal('follow'),
    payload: z.object({ businessId: z.string().uuid(), action: z.enum(['add', 'remove']) }),
  }),
  z.object({
    type: z.literal('like'),
    payload: z.object({
      commentId: z.string().uuid(),
      action: z.enum(['add', 'remove']),
    }),
  }),
])

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(strictLimiter, `flush:${user.id}`)
    if (!rl.ok) {
      return NextResponse.json({ error: rl.error }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }

    const { type, payload } = parsed.data

    // ─── Review ───
    if (type === 'review') {
      const { data: existing } = await supabase
        .from('business_reviews')
        .select('id')
        .eq('business_id', payload.businessId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) return NextResponse.json({ ok: true, skipped: 'already_reviewed' })

      const quality = reviewQualityScore(payload.comment, false)
      const { error } = await supabase.from('business_reviews').insert({
        business_id: payload.businessId,
        user_id: user.id,
        dimensions: payload.dimensions,
        comment: payload.comment,
        status: 'pending',
        review_quality_score: quality,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await supabase.from('business_activities').insert({
        business_id: payload.businessId,
        user_id: user.id,
        activity_type: 'comment',
        metadata: { source: 'offline_flush' },
      })

      const { data: biz } = await supabase
        .from('businesses')
        .select('owner_profile_id, name')
        .eq('id', payload.businessId)
        .maybeSingle()

      if (biz?.owner_profile_id) {
        void createNotification({
          userId: biz.owner_profile_id,
          type: 'review',
          title: 'تقييم جديد على نشاطك',
          body: `${biz.name}: حد كتب تقييم جديد (تم إرساله بعد انقطاع)`,
          deepLink: `/businesses/${payload.slug}#reviews-section`,
          pushTag: 'review',
        }).catch(() => {})
      }
      return NextResponse.json({ ok: true })
    }

    // ─── Comment ───
    if (type === 'comment') {
      const { error } = await supabase.from('business_comments').insert({
        business_id: payload.businessId,
        user_id: user.id,
        parent_id: payload.parentId ?? null,
        content: payload.content,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await supabase.from('business_activities').insert({
        business_id: payload.businessId,
        user_id: user.id,
        activity_type: 'comment',
        metadata: { source: 'offline_flush' },
      })
      return NextResponse.json({ ok: true })
    }

    // ─── Favorite ───
    if (type === 'favorite') {
      if (payload.action === 'add') {
        await supabase
          .from('favorites')
          .upsert(
            { business_id: payload.businessId, user_id: user.id },
            { onConflict: 'business_id,user_id', ignoreDuplicates: true },
          )
        await supabase.from('business_activities').insert({
          business_id: payload.businessId,
          user_id: user.id,
          activity_type: 'favorite',
          metadata: { source: 'offline_flush' },
        })
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('business_id', payload.businessId)
          .eq('user_id', user.id)
      }
      return NextResponse.json({ ok: true })
    }

    // ─── Follow ───
    if (type === 'follow') {
      if (payload.action === 'add') {
        await supabase
          .from('business_follows')
          .upsert(
            { business_id: payload.businessId, user_id: user.id },
            { onConflict: 'business_id,user_id', ignoreDuplicates: true },
          )
        await supabase.from('business_activities').insert({
          business_id: payload.businessId,
          user_id: user.id,
          activity_type: 'follow',
          metadata: { source: 'offline_flush' },
        })
      } else {
        await supabase
          .from('business_follows')
          .delete()
          .eq('business_id', payload.businessId)
          .eq('user_id', user.id)
      }
      return NextResponse.json({ ok: true })
    }

    // ─── Like ───
    if (type === 'like') {
      if (payload.action === 'add') {
        await supabase
          .from('comment_likes')
          .upsert(
            { comment_id: payload.commentId, user_id: user.id },
            { onConflict: 'comment_id,user_id', ignoreDuplicates: true },
          )
      } else {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', payload.commentId)
          .eq('user_id', user.id)
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'unknown type' }, { status: 400 })
  } catch (err) {
    console.error('[offline/flush]', (err as Error).message)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
