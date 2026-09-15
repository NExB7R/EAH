'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import './require-auth.css'

type Props = {
  children: React.ReactNode
  action?: string
  redirect?: string
  /** إذا true → لا يعرض أي حاجة للزوار بدون تسجيل */
  hard?: boolean
}

export default function RequireAuth({
  children,
  action = 'الإجراء ده',
  redirect = '/auth',
  hard = false,
}: Props) {
  const [status, setStatus] = useState<'loading' | 'guest' | 'auth'>('loading')

  useEffect(() => {
    let alive = true
    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      setStatus(user ? 'auth' : 'guest')
    })()
    return () => {
      alive = false
    }
  }, [])

  if (status === 'loading') return <>{children}</>
  if (status === 'auth') return <>{children}</>

  if (hard) return null

  const next = typeof window !== 'undefined' ? window.location.pathname : '/'
  const href = `${redirect}?next=${encodeURIComponent(next)}`

  return (
    <div className="ra">
      <div className="ra__overlay" />
      <div className="ra__card">
        <span className="ra__icon" aria-hidden>🔒</span>
        <h3 className="ra__title">{action} يحتاج حساب</h3>
        <p className="ra__text">
          سجّل عشان تقدر تكشف الأرقام، تقيّم، وتشارك تجربتك — كل ده بدون مقابل.
        </p>
        <div className="ra__actions">
          <Link href={href} className="ra__btn ra__btn--primary">تسجيل سريع</Link>
          <Link href="/" className="ra__btn ra__btn--ghost">تصفح كزائر</Link>
        </div>
        <span className="ra__hint">مسجّل عندك؟ <Link href={href}>ادخل من هنا</Link></span>
      </div>
    </div>
  )
}
