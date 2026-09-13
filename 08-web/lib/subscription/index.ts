import { createClient } from '@/lib/supabase-server'
import type {
  BusinessSubscription,
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionFeature,
} from './types'

export * from './types'

/* ═══ Helpers ═══ */

export function hasFeature(
  features: SubscriptionFeature[] | null | undefined,
  feature: SubscriptionFeature
): boolean {
  if (!features) return false
  return features.includes(feature)
}

export function isPremiumActive(sub: BusinessSubscription | null): boolean {
  if (!sub) return false
  if (sub.status !== 'trial' && sub.status !== 'active') return false
  if (!sub.expires_at) return true
  return new Date(sub.expires_at) > new Date()
}

export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'تواصل معنا'
  return `${price.toLocaleString('ar-EG')} ج.م`
}

export function formatDuration(days: number): string {
  if (days === 30) return 'شهر'
  if (days === 90) return '3 شهور'
  if (days === 180) return '6 شهور'
  if (days === 365) return 'سنة'
  return `${days} يوم`
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'قيد المراجعة'
    case 'trial': return 'تجريبي'
    case 'active': return 'نشط'
    case 'expired': return 'منتهي'
    case 'rejected': return 'مرفوض'
    case 'cancelled': return 'ملغي'
    default: return status
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'pending': return '#FBBF24'
    case 'trial': return '#A855F7'
    case 'active': return '#10B981'
    case 'expired': return '#6B7280'
    case 'rejected': return '#EF4444'
    case 'cancelled': return '#6B7280'
    default: return '#6B7280'
  }
}

/* ═══ Data fetchers ═══ */

export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    return (data ?? []) as SubscriptionPlan[]
  } catch {
    return []
  }
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true })
    return (data ?? []) as SubscriptionPlan[]
  } catch {
    return []
  }
}

export async function getBusinessSubscription(
  businessId: string
): Promise<BusinessSubscription | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('get_business_subscription', {
      p_business_id: businessId,
    })
    const rows = (data ?? []) as BusinessSubscription[]
    return rows[0] ?? null
  } catch {
    return null
  }
}

export async function getSubscriptionsByStatus(
  status?: string
): Promise<SubscriptionRequest[]> {
  try {
    const supabase = await createClient()
    let q = supabase
      .from('business_subscriptions')
      .select(`
        id, business_id, plan_id, status, is_trial, starts_at, expires_at,
        rejected_reason, notes, created_at, updated_at,
        business:businesses(name, slug, business_type)
      `)
      .order('created_at', { ascending: false })
      .limit(200)
    if (status) q = q.eq('status', status)
    const { data } = await q
    return (data ?? []) as unknown as SubscriptionRequest[]
  } catch {
    return []
  }
}

/* ═══ Mutations ═══ */

export async function requestSubscription(
  businessId: string,
  planId: string,
  notes?: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'not_authenticated' }

    const { data, error } = await supabase
      .from('business_subscriptions')
      .insert({
        business_id: businessId,
        plan_id: planId,
        status: 'pending',
        notes: notes ?? null,
      })
      .select('id')
      .single()

    if (error) return { ok: false, error: error.message }

    await supabase.from('subscription_events').insert({
      subscription_id: data.id,
      business_id: businessId,
      event_type: 'requested',
      actor_id: user.id,
      metadata: { plan_id: planId, notes: notes ?? null },
    })

    return { ok: true, id: data.id }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}


/* ═══ Bulk: جلب business IDs المشتركة ═══ */
export async function getSubscribedBusinessIds(
  businessIds: string[]
): Promise<Set<string>> {
  if (businessIds.length === 0) return new Set()
  try {
    const supabase = await createClient()
    const nowIso = new Date().toISOString()
    const { data } = await supabase
      .from('business_subscriptions')
      .select('business_id')
      .in('business_id', businessIds)
      .in('status', ['trial', 'active'])
      .gte('expires_at', nowIso)
    return new Set((data ?? []).map((r: { business_id: string }) => r.business_id))
  } catch {
    return new Set()
  }
}
