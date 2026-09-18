'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './merchant-reply-form.css'
import { auditClient } from '@/lib/audit-client'

export default function MerchantReplyForm({ reviewId, existingReply }: { reviewId: string; existingReply?: string | null }) {
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(existingReply ?? '')
  const [pending, start] = useTransition()

  function submit() {
    if (reply.trim().length < 2) { setMsg('اكتب رد'); return }
    start(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('reply_to_review', {
        p_review_id: reviewId,
        p_reply: reply.trim(),
      })
      if (error) { setMsg(error.message); return }
      const r = data as any
      if (!r?.ok) {
        const msgs: Record<string, string> = {
          not_owner: 'مش مسموحلك',
          reply_too_short: 'الرد قصير',
          reply_too_long: 'الرد طويل',
          review_not_found: 'التقييم مش موجود',
        }
        setMsg(msgs[r?.reason] ?? 'حصل خطأ'); return
      }
      // audit
      void auditClient({
        action: 'review.reply',
        entityType: 'business_review',
        entityId: reviewId,
        after: { reply: reply.trim() },
      })

      setSaved(reply.trim())
      setOpen(false)
      setMsg('')
    })
  }

  if (saved) {
    return (
      <div className="mrf-existing">
        <span className="mrf-existing__label">ردّك:</span>
        <p className="mrf-existing__text">{saved}</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" className="mrf-trigger" onClick={() => setOpen(true)}>
        رد على التقييم
      </button>
    )
  }

  return (
    <div className="mrf">
      <textarea
        value={reply}
        onChange={e => setReply(e.target.value)}
        placeholder="اكتب ردّك..."
        className="mrf__input"
        maxLength={500}
        rows={3}
        disabled={pending}
      />
      {msg && <p className="mrf__msg">{msg}</p>}
      <div className="mrf__actions">
        <button type="button" className="mrf__btn mrf__btn--ghost" onClick={() => setOpen(false)} disabled={pending}>إلغاء</button>
        <button type="button" className="mrf__btn mrf__btn--primary" onClick={submit} disabled={pending}>
          {pending ? '...' : 'ردّ'}
        </button>
      </div>
    </div>
  )
}
