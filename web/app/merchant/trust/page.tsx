import { redirect } from 'next/navigation'
import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import TrustCard from '@/components/trust-card'
import { AlertIcon, CheckCircleIcon, ArrowLeftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { TRUST_EVENTS } from '@/lib/trust'
import styles from './trust.module.css'

export const dynamic = 'force-dynamic'

const GAIN = Object.entries(TRUST_EVENTS).filter(([, v]) => v.delta > 0)
const LOSE = Object.entries(TRUST_EVENTS).filter(([, v]) => v.delta < 0)

export default async function MerchantTrustPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/trust')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  return (
    <div>
      <AccountPageHeader title="مصداقية نشاطك" description="إزاي بتحسب + إزاي ترفعها + مكانتك" />

      <TrustCard
        score={business.trust_score ?? 50}
        streakDays={session.streakDays ?? 0}
        legendPoints={session.legendPoints ?? 0}
        label="مصداقية النشاط"
      />

      <p
        style={{
          margin: '-8px 0 16px',
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(168, 85, 247, 0.06)',
          border: '1px solid rgba(168, 85, 247, 0.15)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          textAlign: 'center',
        }}
      >
        🔥 {session.streakDays ?? 0} يوم نشاط متواصل · ⭐ {session.legendPoints ?? 0} نقطة
      </p>

      <section className={styles.section}>
        <div className={styles.helpCard}>
          <h2 className={styles.helpTitle}>إزاي ترفع مصداقيتك؟</h2>
          <p className={styles.helpText}>المصداقية بتزيد مع كل تفاعل حقيقي. ركّز على:</p>
          <ul className={styles.helpList}>
            <li>✅ الرد السريع على الطلبات</li>
            <li>✅ تقييمات معتمدة من عملاء حقيقيين</li>
            <li>✅ إكمال الطلبات بدون إلغاء</li>
            <li>✅ نشاط مستمر على المنصة</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <CheckCircleIcon size={18} />
          اللي بيزوّد
        </h2>
        <ul className={styles.eventsList}>
          {GAIN.map(([key, ev]) => (
            <li key={key} className={styles.eventItem}>
              <span className={styles.eventIcon}>{ev.icon}</span>
              <span className={styles.eventLabel}>{ev.label}</span>
              <span className={styles.eventDeltaPlus}>+{ev.delta}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <AlertIcon size={18} />
          اللي بينقّص
        </h2>
        <ul className={styles.eventsList}>
          {LOSE.map(([key, ev]) => (
            <li key={key} className={styles.eventItem}>
              <span className={styles.eventIcon}>{ev.icon}</span>
              <span className={styles.eventLabel}>{ev.label}</span>
              <span className={styles.eventDeltaMinus}>{ev.delta}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.footer}>
        <Link href="/trust" className={styles.learnMore}>
          <span>اعرف أكتر عن نظام المصداقية</span>
          <ArrowLeftIcon size={14} />
        </Link>
      </section>
    </div>
  )
}
