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
      slug: z
        .string()
        .min(1)
        .max(120)
        .regex(/^[a-zA-Z0-9\u0600-\u06FF-]+$/),
      dimensions: z
        .record(z.string(), z.number().int().min(1).max(5))
        .refine(
          (dimensions) => Object.keys(dimensions).length <= 12,
          'عدد أبعاد التقييم أكبر من المسموح',
        ),
      comment: z.string().min(10).max(500),
    }),
  }),
  z.object({
    type: z.literal('comment'),
    payload: z.object({
      businessId: z.string().uuid(),
      slug: z
        .string()
        .min(1)
        .max(120)
        .regex(/^[a-zA-Z0-9\u0600-\u06FF-]+$/),
      content: z.string().min(1).max(500),
      parentId: z.string().uuid().nullable().optional(),
      imageUrls: z
        .array(z.string().url().refine((value) => value.startsWith('https://')))
        .max(3)
        .optional(),
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
    if (!user || user.is_anonymous) {
      return NextResponse.json({ error: 'registered_login_required' }, { status: 401 })
    }

    const rl = await checkRateLimit(strictLimiter, `flush:${user.id}`, { failClosed: true })
    if (!rl.ok) {
      const unavailable = rl.error.startsWith('تعذر')
      return NextResponse.json(
        { error: rl.error },
        {
          status: unavailable ? 503 : 429,
          headers: unavailable ? { 'Retry-After': '60' } : {},
        },
      )
    }

    const declaredLength = Number(req.headers.get('content-length') ?? '0')
    if (Number.isFinite(declaredLength) && declaredLength > 8192) {
      return NextResponse.json({ error: 'حجم الطلب أكبر من المسموح' }, { status: 413 })
    }

    const rawBody = await req.text()
    if (Buffer.byteLength(rawBody, 'utf8') > 8192) {
      return NextResponse.json({ error: 'حجم الطلب أكبر من المسموح' }, { status: 413 })
    }

    let body: unknown = null
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }

    const { type, payload } = parsed.data

    // ─── Review ───
    if (type === 'review') {
      const { data: existing, error: existingError } = await supabase
        .from('business_reviews')
        .select('id')
        .eq('business_id', payload.businessId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingError) {
        console.error('[offline/flush] review lookup failed:', existingError.message)
        return NextResponse.json({ error: 'تعذر التحقق من التقييم السابق' }, { status: 500 })
      }
      if (existing) return NextResponse.json({ ok: true, skipped: 'already_reviewed' })

      const { data: publishedBusiness, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', payload.businessId)
        .eq('is_published', true)
        .maybeSingle()
      if (businessError) {
        return NextResponse.json(
          { error: 'تعذر التحقق من النشاط', code: 'business_lookup_failed' },
          { status: 503 },
        )
      }
      if (!publishedBusiness) {
        return NextResponse.json(
          { error: 'النشاط غير منشور', code: 'business_unavailable', discard: true },
          { status: 409 },
        )
      }

      const { data: ownedBusiness, error: ownerError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', payload.businessId)
        .eq('owner_profile_id', user.id)
        .maybeSingle()
      if (ownerError) {
        return NextResponse.json(
          { error: 'تعذر التحقق من ملكية النشاط', code: 'owner_lookup_failed' },
          { status: 503 },
        )
      }
      if (ownedBusiness) {
        return NextResponse.json(
          { error: 'لا يمكن تقييم نشاطك بنفسك', code: 'self_review', discard: true },
          { status: 409 },
        )
      }

      // Offline review sync must enforce the same delivered-order requirement as online review.
      const { data: deliveredOrder, error: orderLookupError } = await supabase
        .from('order_requests')
        .select('id')
        .eq('business_id', payload.businessId)
        .eq('customer_profile_id', user.id)
        .eq('status', 'delivered')
        .limit(1)
        .maybeSingle()

      if (orderLookupError) {
        console.error('[offline/flush] delivered order lookup failed:', orderLookupError.message)
        return NextResponse.json(
          { error: 'تعذر التحقق من الطلب المكتمل', code: 'review_verification_unavailable' },
          { status: 503, headers: { 'Retry-After': '30' } },
        )
      }
      if (!deliveredOrder) {
        return NextResponse.json(
          {
            error: 'لم يتم حفظ التقييم لأنه لا يوجد طلب مكتمل مرتبط بهذا النشاط.',
            code: 'review_requires_delivered_order',
            discard: true,
          },
          { status: 409 },
        )
      }

      const quality = reviewQualityScore(payload.comment, true)
      const { error } = await supabase.from('business_reviews').insert({
        business_id: payload.businessId,
        user_id: user.id,
        dimensions: payload.dimensions,
        comment: payload.comment,
        status: 'pending',
        review_quality_score: quality,
      })
      if (error) {
        console.error('[offline/flush] review insert failed:', error.message)
        return NextResponse.json({ error: 'تعذر حفظ التقييم' }, { status: 500 })
      }

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
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', payload.businessId)
        .eq('slug', payload.slug)
        .eq('is_published', true)
        .maybeSingle()

      if (businessError) {
        console.error('[offline/flush] comment business lookup failed:', businessError.message)
        return NextResponse.json({ error: 'تعذر التحقق من النشاط' }, { status: 503 })
      }
      if (!business) {
        return NextResponse.json(
          { error: 'النشاط لم يعد متاحًا للتعليق', code: 'comment_business_unavailable', discard: true },
          { status: 409 },
        )
      }

      if (payload.parentId) {
        const { data: parent, error: parentError } = await supabase
          .from('business_comments')
          .select('id')
          .eq('id', payload.parentId)
          .eq('business_id', payload.businessId)
          .eq('status', 'approved')
          .maybeSingle()

        if (parentError) {
          console.error('[offline/flush] comment parent lookup failed:', parentError.message)
          return NextResponse.json({ error: 'تعذر التحقق من التعليق الأصلي' }, { status: 503 })
        }
        if (!parent) {
          return NextResponse.json(
            { error: 'التعليق الأصلي لم يعد متاحًا في نفس النشاط', code: 'comment_parent_unavailable', discard: true },
            { status: 409 },
          )
        }
      }

      const { error } = await supabase.from('business_comments').insert({
        business_id: payload.businessId,
        user_id: user.id,
        parent_id: payload.parentId ?? null,
        content: payload.content,
        image_urls: payload.imageUrls ?? [],
      })
      if (error) {
        console.error('[offline/flush] comment insert failed:', error.message)
        return NextResponse.json({ error: 'تعذر حفظ التعليق' }, { status: 500 })
      }

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
        const { error } = await supabase
          .from('favorites')
          .upsert(
            { business_id: payload.businessId, user_id: user.id },
            { onConflict: 'business_id,user_id', ignoreDuplicates: true },
          )
        if (error) {
          console.error('[offline/flush] favorite insert failed:', error.message)
          return NextResponse.json({ error: 'تعذر حفظ المفضلة' }, { status: 500 })
        }
        await supabase.from('business_activities').insert({
          business_id: payload.businessId,
          user_id: user.id,
          activity_type: 'favorite',
          metadata: { source: 'offline_flush' },
        })
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('business_id', payload.businessId)
          .eq('user_id', user.id)
        if (error) {
          console.error('[offline/flush] favorite removal failed:', error.message)
          return NextResponse.json({ error: 'تعذر إزالة المفضلة' }, { status: 500 })
        }
      }
      return NextResponse.json({ ok: true })
    }

    // ─── Follow ───
    if (type === 'follow') {
      if (payload.action === 'add') {
        const { error } = await supabase
          .from('business_follows')
          .upsert(
            { business_id: payload.businessId, user_id: user.id },
            { onConflict: 'business_id,user_id', ignoreDuplicates: true },
          )
        if (error) {
          console.error('[offline/flush] follow insert failed:', error.message)
          return NextResponse.json({ error: 'تعذر متابعة النشاط' }, { status: 500 })
        }
        await supabase.from('business_activities').insert({
          business_id: payload.businessId,
          user_id: user.id,
          activity_type: 'follow',
          metadata: { source: 'offline_flush' },
        })
      } else {
        const { error } = await supabase
          .from('business_follows')
          .delete()
          .eq('business_id', payload.businessId)
          .eq('user_id', user.id)
        if (error) {
          console.error('[offline/flush] unfollow failed:', error.message)
          return NextResponse.json({ error: 'تعذر إلغاء متابعة النشاط' }, { status: 500 })
        }
      }
      return NextResponse.json({ ok: true })
    }

    // ─── Like ───
    if (type === 'like') {
      if (payload.action === 'add') {
        const { error } = await supabase
          .from('comment_likes')
          .upsert(
            { comment_id: payload.commentId, user_id: user.id },
            { onConflict: 'comment_id,user_id', ignoreDuplicates: true },
          )
        if (error) {
          console.error('[offline/flush] like insert failed:', error.message)
          return NextResponse.json({ error: 'تعذر تسجيل الإعجاب' }, { status: 500 })
        }
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', payload.commentId)
          .eq('user_id', user.id)
        if (error) {
          console.error('[offline/flush] like removal failed:', error.message)
          return NextResponse.json({ error: 'تعذر إزالة الإعجاب' }, { status: 500 })
        }
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'unknown type' }, { status: 400 })
  } catch (err) {
    console.error('[offline/flush]', (err as Error).message)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
