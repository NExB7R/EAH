'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { IcAlert, IcRefresh, IcHome } from '@/components/eah-icons'
import './error.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[EAH error]', error)
    // Sentry تلقط تلقائي لو مربوط
  }, [error])

  return (
    <main className="err">
      <div className="err__inner">
        <div className="err__glow" aria-hidden />

        <span className="err__icon" aria-hidden>
          <IcAlert />
        </span>

        <span className="err__kicker">حصلت مشكلة</span>

        <h1 className="err__title">
          حاجة غلط حصلت يا أخويا
        </h1>

        <p className="err__body">
          جرّب تحدّث الصفحة — ولو المشكلة مستمرة، كلّمنا.
        </p>

        <div className="err__actions">
          <button type="button" onClick={reset} className="err__btn err__btn--primary">
            <IcRefresh /> حاول تاني
          </button>
          <Link href="/" className="err__btn err__btn--ghost">
            <IcHome /> الرئيسية
          </Link>
        </div>

        {error.digest && (
          <p className="err__code">كود: {error.digest.slice(0, 12)}</p>
        )}
      </div>
    </main>
  )
}
