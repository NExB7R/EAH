import type { Metadata } from 'next'
import { getFeaturedBusinesses } from '@/lib/data'
import { CrownGoldIcon } from '@/components/icons'
import FeaturedShowcase from './featured-showcase'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المميزون · EAH',
  description: 'كل الأنشطة المميزة في شبين القناطر والقرى حواليها',
}

export default async function FeaturedPage() {
  const all = await getFeaturedBusinesses(60)

  return (
    <main className={styles.page}>
      {/* ─── Hero Band ─── */}
      <section className={styles.band}>
        <div className={styles.bandGlow} aria-hidden />

        <div className={styles.head}>
          <span className={styles.crown} aria-hidden>
            <CrownGoldIcon size={26} />
          </span>

          <h1 className={styles.title}>
            <span className={styles.titleAccent}>المميزون</span>
          </h1>

          <p className={styles.subtitle}>
            نخبة الأنشطة في شبين القناطر والقرى حواليها — مختارة بعناية،
            معلّمة بشارة ذهبية، وبتظهر بنفس العدالة للجميع.
          </p>

          {all.length > 0 && (
            <span className={styles.meta}>
              <span className={styles.metaDot} />
              {all.length} نشاط مميز
            </span>
          )}
        </div>
      </section>

      {/* ─── Showcase ─── */}
      <section className={styles.section}>
        <div className={styles.frame}>
          {all.length === 0 ? (
            <div className={styles.empty}>
              <p>لسه مفيش أنشطة مميزة</p>
              <p className={styles.emptyHint}>هنضيف قريب إن شاء الله</p>
            </div>
          ) : (
            <FeaturedShowcase businesses={all} />
          )}
        </div>

        <p className={styles.note}>
          الترتيب <strong>عادل 100%</strong> — يتغيّر تلقائيًا كل 5 ثواني،
          وكل نشاط بياخد نفس عدد مرات الظهور. تقدر تستعرض الأنشطة السابقة والتالية
          بأسهم التنقل.
        </p>
      </section>
    </main>
  )
}
