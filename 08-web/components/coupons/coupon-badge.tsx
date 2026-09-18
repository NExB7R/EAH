import type { Coupon } from '@/lib/coupon-types'
import { couponLabel } from '@/lib/coupon-types'

export default function CouponBadge({ coupon, size = 'md' }: { coupon: Coupon; size?: 'sm' | 'md' }) {
  return (
    <span className={`cb-badge cb-${size}`}>
      <span className="cb-tag">كوبون</span>
      <span className="cb-label">{couponLabel(coupon)}</span>
    </span>
  )
}
