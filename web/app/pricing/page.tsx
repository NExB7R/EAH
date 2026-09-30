import type { Metadata } from 'next'
import Link from 'next/link'
import {
  GiftIcon,
  CrownGoldIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  SparklesIcon,
} from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import PlanCard from '@/components/plan-card'
import { getSubscriptionPlans } from '@/lib/data/subscriptions'
import styles from './pricing.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الباقات · EAH',
  description: 'باقات لأصحاب الأنشطة — ابدأ مجاناً 30 يوم',
}

export default async function PricingPage() {
  const plans = await getSubscriptionPlans()

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="merchant"
        title="الباقات"
        Icon={GiftIcon}
        tone="gold"
        count={plans.length}
        countLabel="باقة"
        showNav={false}
      />

      {/* ─── Hero intro ─── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            سجّل نشاطك — <span className={styles.accent}>مجاناً 30 يوم</span>
          </h1>
          <p className={styles.heroDesc}>
            جرّب كل حاجة بدون دفع. لو عاجبك — اشترك. لو لأ — من غير أي التزام.
          </p>

          <div className={styles.heroPills}>
            <span className={styles.pill}>
              <ShieldCheckIcon size={14} />
              بدون عمولة على الطلبات
            </span>
            <span className={styles.pill}>
              <CheckCircleIcon size={14} />
              صفر رسوم تسجيل
            </span>
            <span className={styles.pill}>
              <SparklesIcon size={14} />
              5% من كل جنيه لفلسطين
            </span>
          </div>
        </div>
      </section>

      {/* ─── Plans Grid ─── */}
      <section className={styles.plansSection}>
        <div className={styles.plansGrid}>
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} featured={i === 1} />
          ))}
        </div>
      </section>

      {/* ─── Why cheap message ─── */}
      <section className={styles.noteSection}>
        <div className={styles.note}>
          <span className={styles.noteIcon}>
            <TrendingUpIcon size={22} />
          </span>
          <div className={styles.noteBody}>
            <h3 className={styles.noteTitle}>ليه الأسعار دي؟</h3>
            <p className={styles.noteText}>
              عارفين إننا <strong>أرخص من السوق — بكتير</strong>. اخترنا كده عشان
              <strong> نكبر معاكم مش عليكم</strong>.
            </p>
            <p className={styles.noteText}>
              كل جنيه بيدخلنا — <strong>5% منه بيروح لفلسطين 🇵🇸</strong>، والباقي بيرجع ليك في صورة{' '}
              <strong>خدمة 24 ساعة</strong>،<strong> سيرفرات أقوى</strong>، و
              <strong>ميزات جديدة كل شهر</strong>.
            </p>
            <p className={styles.noteText}>
              <strong>الأسعار دي لفترة محدودة — استفيد دلوقتي.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.ctaSection}>
        <Link href="/merchant/apply" className={styles.ctaBtn}>
          <CrownGoldIcon size={20} />
          <span>سجّل نشاطك — ابدأ التجربة المجانية</span>
        </Link>
        <Link href="/advertise" className={styles.ctaSecondary}>
          <span>أو أعلن معانا ←</span>
        </Link>
      </section>
    </main>
  )
}
