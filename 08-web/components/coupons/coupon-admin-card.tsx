'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Coupon } from '@/lib/coupon-types'
import { couponLabel } from '@/lib/coupon-types'

export default function CouponAdminCard({ coupon, businessName }: { coupon: Coupon; businessName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const act = async (action: 'approve' | 'reject') => {
    setLoading(true)
    await fetch('/api/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, action }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="cac-card">
      <div className="cac-head">
        <div>
          <div className="cac-code">{coupon.code}</div>
          <div className="cac-biz">{businessName}</div>
        </div>
        <div className="cac-discount">{couponLabel(coupon)}</div>
      </div>
      <div className="cac-title">{coupon.title}</div>
      {coupon.description && <div className="cac-desc">{coupon.description}</div>}
      <div className="cac-meta">
        {coupon.min_order > 0 && <span>أقل: {coupon.min_order} ج.م</span>}
        {coupon.max_uses && <span>حد: {coupon.max_uses}</span>}
        <span>لكل مستخدم: {coupon.per_user_limit}</span>
      </div>
      <div className="cac-actions">
        <button className="cac-btn cac-approve" onClick={() => act('approve')} disabled={loading}>موافقة</button>
        <button className="cac-btn cac-reject" onClick={() => act('reject')} disabled={loading}>رفض</button>
      </div>
    </div>
  )
}
