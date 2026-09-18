'use client'
import { useState } from 'react'
import type { Coupon } from '@/lib/coupons'
import { couponLabel } from '@/lib/coupons'

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 1600)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10)
    } catch {}
  }

  if (!coupons.length) return null

  return (
    <div className="cl-wrap">
      <h3 className="cl-title">كوبونات نشطة</h3>
      <div className="cl-grid">
        {coupons.map((c) => (
          <div key={c.id} className="cl-card">
            <div className="cl-head">
              <span className="cl-discount">{couponLabel(c)}</span>
              <span className="cl-uses">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''} استخدام</span>
            </div>
            <div className="cl-body">
              <p className="cl-name">{c.title}</p>
              {c.description && <p className="cl-desc">{c.description}</p>}
              {c.min_order > 0 && <p className="cl-min">أقل أوردر: {c.min_order} ج.م</p>}
            </div>
            <button type="button" className="cl-code" onClick={() => copy(c.code)}>
              <span>{c.code}</span>
              <span className="cl-copy">{copied === c.code ? 'اتنسخ ✓' : 'انسخ'}</span>
            </button>
            {c.ends_at && (
              <p className="cl-ends">ينتهي: {new Date(c.ends_at).toLocaleDateString('ar-EG')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
