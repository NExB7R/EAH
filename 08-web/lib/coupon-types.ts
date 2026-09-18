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

export function couponLabel(c: Coupon): string {
  if (c.discount_type === 'percent') return `خصم ${c.discount_value}%`
  return `خصم ${c.discount_value} ج.م`
}
