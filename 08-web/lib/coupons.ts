import { createClient } from '@/lib/supabase-server'

export type Coupon = {
  id: string
  business_id: string
  code: string
  title: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number | null
  uses_count: number
  per_user_limit: number
  starts_at: string
  ends_at: string | null
  is_active: boolean
  status: 'pending' | 'approved' | 'rejected'
  review_note?: string | null
  created_at: string
}

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

export function couponLabel(c: Coupon): string {
  if (c.discount_type === 'percent') return `خصم ${c.discount_value}%`
  return `خصم ${c.discount_value} ج.م`
}
