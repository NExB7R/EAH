'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { IcBan, IcCheckCircle } from '@/components/eah-icons'

type Flagged = {
  id: string
  business_id: string
  business_name: string
  business_slug: string
  comment: string
  flagged_reason: string
  created_at: string
}

export default function ModerationClient({ flagged }: { flagged: Flagged[] }) {
  const [items, setItems] = useState(flagged)
  const [busy, setBusy] = useState<string | null>(null)

  async function action(id: string, decision: 'approve' | 'hide') {
    setBusy(id)
    try {
      const supabase = createClient()
      const status = decision === 'approve' ? 'approved' : 'hidden'
      await supabase.from('business_reviews').update({
        status,
        flagged_reason: null,
      }).eq('id', id)
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch { /* silent */ }
    setBusy(null)
  }

  return (
    <div className="mod__list">
      {items.map((r) => (
        <article key={r.id} className="mod__item">
          <header className="mod__item-head">
            <a href={`/businesses/${r.business_slug}`} target="_blank" rel="noreferrer" className="mod__biz">
              {r.business_name} ↗
            </a>
            <span className="mod__flag">{r.flagged_reason}</span>
          </header>
          <p className="mod__comment">{r.comment}</p>
          <footer className="mod__item-actions">
            <button
              type="button"
              className="mod__btn mod__btn--ok"
              disabled={busy === r.id}
              onClick={() => action(r.id, 'approve')}
            ><IcCheckCircle /> موافق — انشر
            </button>
            <button
              type="button"
              className="mod__btn mod__btn--no"
              disabled={busy === r.id}
              onClick={() => action(r.id, 'hide')}
            >
              <IcBan /> اخفي
            </button>
          </footer>
        </article>
      ))}
    </div>
  )
}
