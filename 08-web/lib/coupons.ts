import { createClient } from '@/lib/supabase-server'
export type { Coupon } from './coupon-types'
export { couponLabel } from './coupon-types'
import type { Coupon } from './coupon-types'

export async function getActiveCouponsForBusiness(businessId: string): Promise<Coupon[]> {
  const sb = await createClient()
  const { data } = await sb
    .from('coupons')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return (data ?? []) as Coupon[]
}

export async function getMerchantCoupons(businessId: string): Promise<Coupon[]> {
  const sb = await createClient()
  const { data } = await sb
    .from('coupons')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Coupon[]
}

export async function getPendingCoupons(): Promise<Coupon[]> {
  const sb = await createClient()
  const { data } = await sb
    .from('coupons')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as Coupon[]
}
