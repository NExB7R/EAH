import Link from 'next/link'
import { IcCompass, IcHome } from '@/components/eah-icons'
import './error.css'

export default function NotFound() {
  return (
    <main className="err">
      <div className="err__inner">
        <div className="err__glow" aria-hidden />

        <span className="err__icon err__icon--404" aria-hidden>
          404
        </span>

        <span className="err__kicker">الصفحة مش موجودة</span>

        <h1 className="err__title">
          الصفحة مش موجودة
        </h1>

        <p className="err__body">
          يمكن الرابط غلط، أو الصفحة اتنقلت.
        </p>

        <div className="err__actions">
          <Link href="/" className="err__btn err__btn--primary">
            <IcHome /> الرئيسية
          </Link>
          <Link href="/explore" className="err__btn err__btn--ghost">
            <IcCompass /> اكتشف الأماكن
          </Link>
        </div>
      </div>
    </main>
  )
}
