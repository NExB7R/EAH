'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  businessName: string
  postUrl: string | null
  note: string | null
  createdAt: string
}

export default function PromoAdminCard({ id, businessName, postUrl, note, createdAt }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [reviewNote, setReviewNote] = useState('')

  const act = async (approve: boolean) => {
    setLoading(true)
    await fetch('/api/promo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approve, note: reviewNote.trim() || undefined }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="promo-admin">
      <div className="promo-admin__head">
        <div>
          <div className="promo-admin__biz">{businessName}</div>
          <div className="promo-admin__date">
            {new Date(createdAt).toLocaleDateString('ar-EG')}
          </div>
        </div>
      </div>

      {postUrl && (
        <a href={postUrl} target="_blank" rel="noreferrer" className="promo-admin__link" dir="ltr">
          {postUrl}
        </a>
      )}

      {note && <p className="promo-admin__note">{note}</p>}

      <textarea
        className="promo-input"
        placeholder="ملاحظة (اختياري)"
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        rows={2}
      />

      <div className="promo-admin__actions">
        <button type="button" className="promo-admin__btn promo-admin__btn--ok" onClick={() => act(true)} disabled={loading}>
          موافقة (+15 يوم)
        </button>
        <button type="button" className="promo-admin__btn promo-admin__btn--no" onClick={() => act(false)} disabled={loading}>
          رفض
        </button>
      </div>
    </div>
  )
}
