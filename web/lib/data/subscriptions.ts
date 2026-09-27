import { createPublicClient } from '@/lib/supabase/public'

// ═══════════════════════════════════════════════════════════
// EAH — Subscriptions Data
// ═══════════════════════════════════════════════════════════

export type PlanFeatureKey =
  | 'featured_badge'
  | 'verified_badge'
  | 'basic_stats'
  | 'full_stats'
  | 'trend_eligibility'
  | 'pdf_reports'
  | 'crm_basic'
  | 'crm_full'

  | 'dedicated_support'

export type SubscriptionPlan = {
  id: string
  code: string
  name_ar: string
  description: string | null
  price_egp: number
  duration_days: number
  trial_days: number
  features: PlanFeatureKey[]
  display_order: number
}

export type AdSlot = {
  id: string
  code: string
  name_ar: string
  description: string | null
  base_price_egp: number
  max_concurrent: number
  display_order: number
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, code, name_ar, description, price_egp, duration_days, trial_days, features, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return []
  return (data ?? []).map((p) => ({
    ...p,
    price_egp: Number(p.price_egp),
    features: (p.features ?? []) as PlanFeatureKey[],
  })) as SubscriptionPlan[]
}

export async function getAdSlots(): Promise<AdSlot[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('ad_slots')
    .select('id, code, name_ar, description, base_price_egp, max_concurrent, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return []
  return (data ?? []).map((s) => ({
    ...s,
    base_price_egp: Number(s.base_price_egp),
  })) as AdSlot[]
}

// ─── Labels ───
export const FEATURE_LABEL: Record<PlanFeatureKey, string> = {
  featured_badge: 'شارة "مميز" في المميزون',
  verified_badge: 'شارة "موثّق" على صفحتك',
  basic_stats: 'إحصائيات أساسية (زوار + اتصالات)',
  full_stats: 'إحصائيات متقدمة + مصادر الزيارات',
  trend_eligibility: 'فرصة دخول الترند',
  pdf_reports: 'تقارير PDF شهرية',
  crm_basic: 'CRM بسيط (قائمة المتابعين)',
  crm_full: 'CRM كامل + تصدير CSV',
  dedicated_support: 'دعم مخصص + أولوية رد',
}
