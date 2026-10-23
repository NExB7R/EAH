import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CrownGoldIcon,
  CheckCircleIcon,
  AlertIcon,
  ArrowLeftIcon,
  GiftIcon,
  SparklesIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMySubscription } from '@/lib/data/merchant'
import { getSubscriptionPlans, FEATURE_LABEL } from '@/lib/data/subscriptions'
import type { PlanFeatureKey } from '@/lib/data/subscriptions'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import SubscribeButton from './subscribe-button'
import StartTrialButton from './start-trial-button'
import styles from './subscription.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantSubscriptionPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/subscription')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const [subscription, plans] = await Promise.all([
    getMySubscription(business.id),
    getSubscriptionPlans(),
  ])

  const currentCode = subscription?.plan?.code ?? 'basic'
  const expiresAt = subscription ? new Date(subscription.expires_at) : null
  // eslint-disable-next-line react-hooks/purity -- server component, runs per request
  const nowMs = Date.now()
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - nowMs) / (24 * 60 * 60 * 1000)))
    : 0

  const isTrial = subscription?.is_trial
  const isBasic = currentCode === 'basic'

  return (
    <div className={styles.page}>
      <AccountPageHeader title="الاشتراك" description="باقتك الحالية + خيارات الترقية" />

      {/* Current plan card */}
      <div className={styles.currentCard}>
        <div className={styles.currentGlow} aria-hidden />
        <div className={styles.currentBody}>
          <span className={styles.currentIcon}>
            <CrownGoldIcon size={24} />
          </span>
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>باقتك الحالية</span>
            <span className={styles.currentName}>
              {subscription?.plan?.name_ar ?? 'بدون اشتراك'}
            </span>
            {subscription && (
              <div className={styles.currentMeta}>
                {isTrial && (
                  <span className={`${styles.chip} ${styles.chipTrial}`}>
                    <GiftIcon size={11} />
                    تجربة مجانية
                  </span>
                )}
                <span className={`${styles.chip} ${daysLeft < 7 ? styles.chipWarn : ''}`}>
                  <AlertIcon size={11} />
                  باقي {daysLeft} يوم
                </span>
              </div>
            )}
          </div>
          {!isBasic && (
            <Link href="/pricing" className={styles.upgradeBtn}>
              <span>ترقية</span>
              <ArrowLeftIcon size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* زر بدء التجربة — لو النشاط مقدرش يبدأها قبل كده ولسه مش في تجربة */}
      {subscription?.trial_available && !isTrial && business.name && (
        <StartTrialButton businessName={business.name} />
      )}

      {/* Trial message */}
      {isTrial && daysLeft <= 15 && (
        <div className={styles.trialMsg}>
          <span className={styles.trialMsgIcon}>
            <SparklesIcon size={20} />
          </span>
          <div className={styles.trialMsgBody}>
            <strong>عايز تكمّل التجربة 15 يوم كمان؟</strong>
            <p>اعمل بوست على صفحتك + تقييم على صفحتنا، وابعت السكرين شوت لرقمنا على واتساب.</p>
          </div>
          <a
            href="https://wa.me/201012892806?text=عايز%20أكمّل%20التجربة%20المجانية"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.trialMsgBtn}
          >
            ابعت السكرين
          </a>
        </div>
      )}

      {/* Plans comparison */}
      <h2 className={styles.plansTitle}>الباقات المتاحة</h2>
      {plans.length === 0 ? (
        <EmptyState
          Icon={CrownGoldIcon}
          title="الباقات لسه مش متاحة"
          description="الباقات هتظهر هنا أول ما يتم تفعيلها من الإدارة"
        />
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => {
            const isCurrent = plan.code === currentCode
            const isFree = plan.price_egp === 0

            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${isCurrent ? styles.planCurrent : ''} ${isFree ? styles.planFree : ''}`}
              >
                <div className={styles.planHead}>
                  <h3 className={styles.planName}>{plan.name_ar}</h3>
                  {isCurrent && <span className={styles.planBadge}>باقتك الحالية</span>}
                </div>

                <div className={styles.planPrice}>
                  {isFree ? (
                    <span className={styles.freeText}>مجاناً</span>
                  ) : (
                    <>
                      <span className={styles.price}>{plan.price_egp}</span>
                      <span className={styles.currency}>ج.م / شهر</span>
                    </>
                  )}
                </div>

                <ul className={styles.planFeatures}>
                  {plan.features.slice(0, 5).map((f: PlanFeatureKey) => (
                    <li key={f}>
                      <CheckCircleIcon size={14} />
                      <span>{FEATURE_LABEL[f]}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <SubscribeButton planCode={plan.code} planName={plan.name_ar} isFree={isFree} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
