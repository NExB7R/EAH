'use server'

import { requireAdmin } from '@/lib/auth/admin'
import { createNotification } from '@/lib/notifications/server'

type Result = { ok: true } | { ok: false; error: string }

export async function sendInsightToMerchant(insightId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { data: insight } = await ctx.supabase
    .from('business_insights')
    .select('id, business_id, summary, business:businesses(name, owner_profile_id)')
    .eq('id', insightId)
    .maybeSingle()

  if (!insight) return { ok: false, error: 'التقرير مش موجود' }

  const biz = insight.business as unknown as {
    name: string
    owner_profile_id: string | null
  } | null

  if (!biz?.owner_profile_id) {
    return { ok: false, error: 'النشاط مفيش له صاحب' }
  }

  await createNotification({
    userId: biz.owner_profile_id,
    type: 'system',
    title: `📊 تقرير جديد — ${biz.name}`,
    body: insight.summary?.slice(0, 100) ?? 'الإدارة أعدّت لك تقرير أداء جديد',
    deepLink: `/merchant/insights/${insightId}`,
  })

  return { ok: true }
}
