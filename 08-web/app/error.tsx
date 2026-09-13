'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import EahLogo from '@/components/eah-logo'
import './error.css'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <main className="er">
      <div className="er__glow" aria-hidden />
      <div className="er__logo">
        <EahLogo size="md" variant="full" href="/" />
      </div>
      <span className="er__emoji">⚠️</span>
      <h1 className="er__title">حصل خطأ</h1>
      <p className="er__text">حاول تاني، ولو المشكلة مستمرة كلمنا.</p>
      <div className="er__actions">
        <button onClick={reset} className="er__btn er__btn--primary">حاول تاني</button>
        <Link href="/" className="er__btn">الرئيسية</Link>
      </div>
    </main>
  )
}
