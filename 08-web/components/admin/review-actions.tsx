'use client'
import { useTransition } from 'react'
import { setReviewStatus, deleteReview } from '@/app/admin/reviews/actions'
import { IcCheckCircle, IcEye, IcTrash } from '@/components/eah-icons'

export default function ReviewActions({
  reviewId,
  status,
}: {
  reviewId: string
  status: string
}) {
  const [pending, startTransition] = useTransition()

  const set = (s: 'approved' | 'rejected' | 'hidden') => {
    startTransition(async () => {
      const res = await setReviewStatus(reviewId, s)
      if (!res.ok) alert(res.message ?? 'فشل')
    })
  }

  const remove = () => {
    if (!confirm('حذف التقييم نهائياً؟')) return
    startTransition(async () => {
      const res = await deleteReview(reviewId)
      if (!res.ok) alert(res.message ?? 'فشل')
    })
  }

  return (
    <div className="ract">
      {status !== 'approved' && (
        <button type="button" className="admin-btn admin-btn--sm" onClick={() => set('approved')} disabled={pending}><IcCheckCircle /> اعتماد
        </button>
      )}
      {status !== 'hidden' && (
        <button type="button" className="admin-btn admin-btn--sm" onClick={() => set('hidden')} disabled={pending}>
          <IcEye /> إخفاء
        </button>
      )}
      {status !== 'rejected' && (
        <button type="button" className="admin-btn admin-btn--sm" onClick={() => set('rejected')} disabled={pending}>
           رفض
        </button>
      )}
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={remove} disabled={pending}><IcTrash /></button>
    </div>
  )
}
