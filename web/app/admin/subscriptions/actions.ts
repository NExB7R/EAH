'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Subscriptions Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

async function logAudit(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  action: string,
  targetId: string,
  meta: Record<string, unknown> = {},
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    actor_user_id: user?.id ?? null,
    action,
    entity_type: 'business_subscription',
    entity_id: targetId,
    metadata: meta,
  })
}

// ─── قبول اشتراك معلّق ───

const approveSchema = z.object({
  is_trial: z.boolean(),
  days: z.coerce.number().int().min(1).max(730),
})

export async function approveSubscription(id: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = approveSchema.safeParse({
    is_trial: formData.get('is_trial') === 'on',
    days: formData.get('days') ?? 30,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const { data: sub } = await ctx.supabase
    .from('business_subscriptions')
    .select('id, business:businesses(name, owner_profile_id)')
    .eq('id', id)
    .maybeSingle()

  if (!sub) return { ok: false, error: 'الاشتراك مش موجود' }

  const now = new Date()
  const expires = new Date(now.getTime() + parsed.data.days * 24 * 60 * 60 * 1000)

  const { error } = await ctx.supabase
    .from('business_subscriptions')
    .update({
      status: parsed.data.is_trial ? 'trial' : 'active',
      is_trial: parsed.data.is_trial,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  // إشعار لصاحب النشاط
  const biz = sub.business as unknown as { name: string; owner_profile_id: string } | null
  if (biz?.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: parsed.data.is_trial ? 'بدأت تجربتك ✓' : 'اشتراكك اتفعّل ✓',
      body: parsed.data.is_trial
        ? `عندك ${parsed.data.days} يوم تجربة مجانية على "${biz.name}"`
        : `اشتراك "${biz.name}" شغّال لحد ${expires.toLocaleDateString('ar-EG')}`,
      deepLink: '/merchant/subscription',
    })
  }

  await logAudit(ctx.supabase, 'subscription.approve', id, {
    is_trial: parsed.data.is_trial,
    days: parsed.data.days,
  })

  revalidatePath('/admin/subscriptions')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── رفض اشتراك ───

const rejectSchema = z.object({ reason: z.string().min(5).max(300) })

export async function rejectSubscription(id: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = rejectSchema.safeParse({
    reason: String(formData.get('reason') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'السبب قصير' }
  }

  const { data: sub } = await ctx.supabase
    .from('business_subscriptions')
    .select('id, business:businesses(name, owner_profile_id)')
    .eq('id', id)
    .maybeSingle()

  if (!sub) return { ok: false, error: 'الاشتراك مش موجود' }

  const { error } = await ctx.supabase
    .from('business_subscriptions')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  const biz = sub.business as unknown as { name: string; owner_profile_id: string } | null
  if (biz?.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: 'الاشتراك مرفوض',
      body: `السبب: ${parsed.data.reason}`,
      deepLink: '/merchant/subscription',
    })
  }

  await logAudit(ctx.supabase, 'subscription.reject', id, { reason: parsed.data.reason })

  revalidatePath('/admin/subscriptions')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── تمديد ───

export async function extendSubscription(id: string, days: number): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!Number.isFinite(days) || days < 1 || days > 730) {
    return { ok: false, error: 'عدد أيام غير صالح' }
  }

  const { data: sub } = await ctx.supabase
    .from('business_subscriptions')
    .select('id, expires_at')
    .eq('id', id)
    .maybeSingle()

  if (!sub) return { ok: false, error: 'الاشتراك مش موجود' }

  const base =
    sub.expires_at && new Date(sub.expires_at) > new Date() ? new Date(sub.expires_at) : new Date()
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await ctx.supabase
    .from('business_subscriptions')
    .update({ expires_at: next.toISOString(), status: 'active' })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, 'subscription.extend', id, { days })

  revalidatePath('/admin/subscriptions')
  return { ok: true }
}

// ─── إلغاء ───

export async function cancelSubscription(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('business_subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, 'subscription.cancel', id)

  revalidatePath('/admin/subscriptions')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
