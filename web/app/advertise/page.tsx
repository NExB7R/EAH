import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUpIcon,
  TargetIcon,
  HomeIcon,
  GiftIcon,
  CrownGoldIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import { getAdSlots } from '@/lib/data/subscriptions'
import styles from './advertise.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'أعلن معانا · EAH',
  description: 'إعلانات توصل لعملاء حقيقيين في شبين القناطر',
}

const SLOT_ICON: Record<string, typeof HomeIcon> = {
  home_banner: HomeIcon,
  home_feed: GiftIcon,
  category_banner: TargetIcon,
  trend_pin: TrendingUpIcon,
}

const SLOT_PLACEMENT: Record<string, string> = {
  home_banner: 'بين المميزون والترند — الرئيسية',
  home_feed: 'بين أقسام الرئيسية',
  category_banner: 'أول نتائج الاستكشاف (حسب التصنيف)',
  trend_pin: 'مكان ثابت في صفحة الترند',
}

export default async function AdvertisePage() {
  const slots = await getAdSlots()

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="merchant"
        title="أعلن معانا"
        Icon={TrendingUpIcon}
        tone="orange"
        count={slots.length}
        countLabel="مكان"
        showNav={false}
      />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            إعلانات توصل لـ
            <span className={styles.accent}> عملاء حقيقيين</span>
          </h1>
          <p className={styles.heroDesc}>
            مش مجرد ظهور — إنت بتوصل لناس في شبين القناطر والقرى حواليها
            بيدوروا على اللي بتقدمه بالظبط.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.grid}>
          {slots.map((slot) => {
            const Icon = SLOT_ICON[slot.code] ?? HomeIcon
            const placement = SLOT_PLACEMENT[slot.code] ?? slot.description ?? ''

            return (
              <div key={slot.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>
                    <Icon size={26} />
                  </span>
                  <div className={styles.cardHeadText}>
                    <h3 className={styles.cardTitle}>{slot.name_ar}</h3>
                    {placement && (
                      <p className={styles.cardPlacement}>{placement}</p>
                    )}
                  </div>
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>{slot.base_price_egp}</span>
                  <span className={styles.currency}>ج.م</span>
                  <span className={styles.period}>/ أسبوع</span>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.meta}>
                    <CheckCircleIcon size={13} />
                    {slot.max_concurrent} {slot.max_concurrent === 1 ? 'مكان' : 'أماكن'} متاحة
                  </span>
                </div>

                <Link href="/contact" className={styles.cardCta}>
                  <span>احجز مكانك</span>
                  <ArrowLeftIcon size={14} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.noteSection}>
        <div className={styles.note}>
          <span className={styles.noteIcon}>
            <CrownGoldIcon size={22} />
          </span>
          <div className={styles.noteBody}>
            <h3 className={styles.noteTitle}>ليه الإعلان معانا؟</h3>
            <p className={styles.noteText}>
              إحنا المنصة الوحيدة اللي بتجمع <strong>أنشطة شبين القناطر</strong> في مكان واحد.
              جمهورنا <strong>محلي، مهتم، وبيدور</strong> — مش مجرد زوار.
            </p>
            <p className={styles.noteText}>
              و<strong>5% من كل إعلان بيروح لفلسطين 🇵🇸</strong> — إنت بتدعم قضية وإنت بتعلن.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <Link href="/contact" className={styles.ctaBtn}>
          <span>كلمنا للحجز الفوري</span>
          <ArrowLeftIcon size={16} />
        </Link>
        <Link href="/pricing" className={styles.ctaSecondary}>
          <span>أو شوف الباقات ←</span>
        </Link>
      </section>
    </main>
  )
}
