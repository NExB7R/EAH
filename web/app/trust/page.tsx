import type { Metadata } from 'next'
import Link from 'next/link'
import SecondaryHero from '@/components/secondary-hero'
import { ShieldCheckIcon, TrendingUpIcon, AlertIcon, CheckCircleIcon } from '@/components/icons'
import { TRUST_TIERS, TRUST_EVENTS, TRUST_FACTORS, TRUST_DEFAULT } from '@/lib/trust'
import styles from './trust.module.css'

export const metadata: Metadata = {
  title: 'المصداقية · EAH',
  description: 'إزاي بتتحسب مصداقيتك على EAH — 5 مستويات + نقاط أسطورة',
}

const tierList = Object.entries(TRUST_TIERS)

const GAIN_EVENTS = Object.entries(TRUST_EVENTS).filter(([, v]) => v.delta > 0)
const LOSE_EVENTS = Object.entries(TRUST_EVENTS).filter(([, v]) => v.delta < 0)

export default function TrustPage() {
  return (
    <main className={styles.page}>
      <SecondaryHero title="المصداقية" Icon={ShieldCheckIcon} tone="purple" showNav={false} />

      <section className={styles.intro}>
        <h1 className={styles.introTitle}>
          مصداقيتك على EAH — <span className={styles.accent}>من 0 لـ 100</span>
        </h1>
        <p className={styles.introText}>
          كل تفاعل إيجابي بيساعدك تترقى. كل مخالفة بتخصم. المصداقية بتفتحلك مزايا وتخلي الناس تثق
          فيك.
        </p>
        <div className={styles.introPills}>
          <span className={styles.pill}>
            <CheckCircleIcon size={14} />
            تبدأ من {TRUST_DEFAULT}
          </span>
          <span className={styles.pill}>
            <TrendingUpIcon size={14} />5 مستويات
          </span>
          <span className={styles.pill}>👑 نقطة أسطورة بعد الـ 100</span>
        </div>
      </section>

      {/* 5 مستويات */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>المستويات الخمسة</h2>
        <div className={styles.tiersGrid}>
          {tierList.map(([key, tier]) => (
            <article key={key} className={`${styles.tierCard} ${styles[`tier_${key}`]}`}>
              <span className={styles.tierEmoji}>{tier.emoji}</span>
              <div className={styles.tierBody}>
                <h3 className={styles.tierLabel}>{tier.label}</h3>
                <span className={styles.tierRange}>
                  {tier.min} – {tier.max}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* إزاي تكسب */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <CheckCircleIcon size={18} />
          إزاي تكسب مصداقية
        </h2>
        <ul className={styles.eventsList}>
          {GAIN_EVENTS.map(([key, ev]) => (
            <li key={key} className={styles.eventItem}>
              <span className={styles.eventIcon}>{ev.icon}</span>
              <span className={styles.eventLabel}>{ev.label}</span>
              <span className={styles.eventDeltaPlus}>+{ev.delta}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* إزاي تنقص */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <AlertIcon size={18} />
          إيه اللي بينقصها
        </h2>
        <ul className={styles.eventsList}>
          {LOSE_EVENTS.map(([key, ev]) => (
            <li key={key} className={styles.eventItem}>
              <span className={styles.eventIcon}>{ev.icon}</span>
              <span className={styles.eventLabel}>{ev.label}</span>
              <span className={styles.eventDeltaMinus}>{ev.delta}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Log Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <TrendingUpIcon size={18} />
          الصعوبة بتزيد — عادل
        </h2>
        <p className={styles.sectionText}>
          كل ما تقرب من 100، كل نقطة بتاخد وقت أطول. ده عادل — الأعلى بياخد شهرة حقيقية.
        </p>
        <div className={styles.factorsGrid}>
          {TRUST_FACTORS.map((f, i) => (
            <div key={i} className={styles.factorCard}>
              <span className={styles.factorRange}>
                {i === 0 ? '0' : TRUST_FACTORS[i - 1]!.max} – {f.max}
              </span>
              <span className={styles.factorValue}>×{f.factor}</span>
              <span className={styles.factorLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Legend */}
      <section className={styles.legendSection}>
        <div className={styles.legendCard}>
          <span className={styles.legendIcon}>👑</span>
          <h2 className={styles.legendTitle}>نقاط الأسطورة</h2>
          <p className={styles.legendText}>
            لو وصلت 100 — بتبدأ تكسب <strong>نقاط أسطورة</strong>. بتظهر بترتيبك على المنصة (مش رقم،
            بس مكانتك الحقيقية).
          </p>
          <p className={styles.legendText}>
            حاجة نادرة — أغلب الناس بيوصلوا 100 بعد سنين من النشاط الحقيقي.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <Link href="/auth" className={styles.ctaBtn}>
          <ShieldCheckIcon size={18} />
          <span>ابدأ رحلتك — سجّل حسابك</span>
        </Link>
        <Link href="/merchant/apply" className={styles.ctaSecondary}>
          عندك نشاط؟ سجّله مجاناً ←
        </Link>
      </section>
    </main>
  )
}
