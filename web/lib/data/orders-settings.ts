import { createClient } from '@/lib/supabase/server'
import type { MerchantOrderSettings } from './orders'

// ═══════════════════════════════════════════════════════════════════
// EAH — Orders Settings: data access
// ═══════════════════════════════════════════════════════════════════

export async function getMerchantOrderSettings(
  businessId: string,
): Promise<MerchantOrderSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('merchant_order_settings')
    .select(
      'business_id, orders_enabled, deadline_minutes, offline_mode, offline_until, auto_accept, missed_count_today, missed_count_week, last_missed_at, suspended_until, suspension_reason',
    )
    .eq('business_id', businessId)
    .maybeSingle()
  return (data as MerchantOrderSettings | null) ?? null
}

export async function getOrderSettingsForAdmin(
  businessId: string,
): Promise<MerchantOrderSettings | null> {
  // Same as merchant — RLS allows admin via auth_is_admin()
  return getMerchantOrderSettings(businessId)
}

export function isOrderAcceptanceActive(settings: MerchantOrderSettings | null): {
  active: boolean
  reason: string | null
} {
  if (!settings) return { active: false, reason: 'لم يتم تفعيل استلام الطلبات بعد' }
  if (!settings.orders_enabled) {
    return { active: false, reason: 'استلام الطلبات موقوف من الإدارة' }
  }
  if (settings.offline_mode) {
    const until = settings.offline_until
    if (until && new Date(until).getTime() > Date.now()) {
      return { active: false, reason: 'النشاط مش متاح حالياً — جرّب تاني بعدين' }
    }
  }
  if (settings.suspended_until && new Date(settings.suspended_until).getTime() > Date.now()) {
    return {
      active: false,
      reason: 'استلام الطلبات موقوف مؤقتاً — جرّب تاني بعدين',
    }
  }
  return { active: true, reason: null }
}
