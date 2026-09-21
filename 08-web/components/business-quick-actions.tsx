'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './business-quick-actions.css'

type Props = {
  businessId: string
  businessName: string
  phone: string | null
  whatsapp: string | null
  slug: string
}

function cleanPhone(p: string): string {
  const d = p.replace(/\D/g, '')
  if (d.startsWith('20')) return d
  if (d.startsWith('0')) return '20' + d.slice(1)
  if (d.startsWith('1')) return '20' + d
  return d
}

export default function BusinessQuickActions({ businessId, businessName, phone, whatsapp, slug }: Props) {
  const [fav, setFav] = useState(false)
  const [busy, setBusy] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/businesses/${slug}`)
    }
    let alive = true
    void (async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user || !alive) return
      const { data } = await sb
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle()
      if (alive) setFav(!!data)
    })()
    return () => { alive = false }
  }, [businessId, slug])

  async function toggleFav() {
    setBusy(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      window.location.href = `/auth?next=/businesses/${slug}`
      setBusy(false)
      return
    }
    try {
      if (fav) {
        await sb.from('favorites').delete().eq('user_id', user.id).eq('business_id', businessId)
        setFav(false)
      } else {
        await sb.from('favorites').insert({ user_id: user.id, business_id: businessId })
        setFav(true)
      }
    } catch {}
    setBusy(false)
  }

  async function share() {
    const url = shareUrl || `https://eah-sq.vercel.app/businesses/${slug}`
    const text = `${businessName} على EAH — اللي نفسك فيه؟`
    if (navigator.share) {
      try { await navigator.share({ title: businessName, text, url }) ; return } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      alert('اتنسخ اللينك — ابعته لأي حد')
    } catch {}
  }

  const waHref = whatsapp ? `https://wa.me/${cleanPhone(whatsapp)}?text=${encodeURIComponent(`مرحباً، تواصلت معاكم من EAH — ${businessName}`)}` : null
  const telHref = phone ? `tel:+${cleanPhone(phone)}` : null

  return (
    <div className="bqa" role="toolbar">
      <div className="bqa__inner">
        <a
          href={telHref ?? `/auth?next=/businesses/${slug}`}
          className="bqa__btn bqa__btn--call"
          {...(telHref ? {} : { onClick: (e: React.MouseEvent) => { e.preventDefault(); window.location.href = `/auth?next=/businesses/${slug}` } })}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z"/>
          </svg>
          <span>{telHref ? 'اتصال' : 'سجّل للاتصال'}</span>
        </a>

        <a
          href={waHref ?? `/auth?next=/businesses/${slug}`}
          target={waHref ? '_blank' : undefined}
          rel="noreferrer"
          className="bqa__btn bqa__btn--wa"
          onClick={waHref ? undefined : (e: React.MouseEvent) => { e.preventDefault(); window.location.href = `/auth?next=/businesses/${slug}` }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <span>{waHref ? 'واتساب' : 'سجّل للواتساب'}</span>
        </a>

        <button type="button" className="bqa__btn" onClick={share}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>شارك</span>
        </button>

        <button type="button" className={`bqa__btn ${fav ? 'is-fav' : ''}`} onClick={toggleFav} disabled={busy}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
          <span>{fav ? 'محفوظ' : 'احفظ'}</span>
        </button>
      </div>
    </div>
  )
}
