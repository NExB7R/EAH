'use client'
import { useState, useTransition } from 'react'
import { claimReferral } from './actions'
import { IcTarget } from '@/components/eah-icons'

export default function ClaimForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()

  function submit(fd: FormData) {
    start(async () => {
      const res = await claimReferral(fd)
      setMsg({ ok: res.ok, text: res.message ?? '' })
    })
  }

  return (
    <div className="rf__claim">
      <h3 className="rf__claim-title"><IcTarget /> عندك كود من صاحبك؟</h3>
      <p className="rf__claim-sub">اكتب الكود وكسب 50 نقطة فورًا</p>
      <form action={submit} className="rf__claim-form">
        <input name="code" placeholder="مثال: A3F9B2C1" dir="ltr" maxLength={20} className="rf__claim-input" required />
        <button type="submit" disabled={pending} className="rf__claim-btn">
          {pending ? '...' : 'استرد'}
        </button>
      </form>
      {msg && <p className={`rf__claim-msg ${msg.ok ? 'is-ok' : 'is-err'}`}>{msg.text}</p>}
    </div>
  )
}
