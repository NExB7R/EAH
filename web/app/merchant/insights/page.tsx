import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SparklesIcon, FileTextIcon, ArrowLeftIcon, LockIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getMySubscription } from '@/lib/data/merchant'
import { getAllInsights, getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import GenerateButton from './generate-button'
import styles from './insights.module.css'

export const dynamic = 'force-dynamic'

const PLAN_ORDER: Record<string, number> = {
  basic: 0,
  featured_monthly: 1,
  featured_quarterly: 2,
  featured_yearly: 3,
}

export default async function MerchantInsightsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/insights')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const subscription = await getMySubscription(business.id)
  const planCode = subscription?.plan?.code ?? 'basic'
  const planLevel = PLAN_ORDER[planCode] ?? 0

  // الأدمن عنده صلاحية كاملة — حتى للباقة الأساسية
  const isAdmin = session.role === 'admin' || session.role === 'super_admin'

  // هل عنده صلاحية؟
  const hasAccess = isAdmin || planLevel >= 2 // featured_quarterly وأعلى

  // آخر التقارير
  const [insights, metrics, comparison] = await Promise.all([
    getAllInsights(business.id, 12),
    getBusinessMetrics(business.id, 30),
    getCategoryComparison(business.id),
  ])

  // live preview (score الحالي بدون تخزين)
  const previewAnalysis = analyzeBusiness(metrics, comparison)

  return (
    <div className={styles.wrap}>
      <AccountPageHeader title="مساعد EAH الذكي" description="تحليل شامل لنشاطك + توصيات مخصصة" />

      {!hasAccess ? (
        <div className={styles.locked}>
          <span className={styles.lockedIcon}>
            <LockIcon size={32} />
          </span>
          <h2 className={styles.lockedTitle}>ميزة حصرية لباقات النمو والشراكة</h2>
          <p className={styles.lockedText}>
            مساعد EAH الذكي بيحلل كل حاجة في نشاطك — تعليقات، طلبات، زيارات — وبيطلعلك تقرير شهري
            كامل مع توصيات مخصصة.
          </p>
          <Link href="/pricing" className={styles.upgradeBtn}>
            <SparklesIcon size={16} />
            <span>رقّي لباقة النمو أو الشراكة</span>
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      ) : (
        <>
          {/* Live Score */}
          <section className={styles.scoreCard}>
            <div className={styles.scoreGlow} aria-hidden />
            <div className={styles.scoreBody}>
              <div className={`${styles.scoreCircle} ${styles[previewAnalysis.scoreTone]}`}>
                <span className={styles.scoreNum}>{previewAnalysis.score}</span>
                <span className={styles.scoreMax}>/100</span>
              </div>
              <div className={styles.scoreInfo}>
                <span className={styles.scoreLabel}>مؤشر الأداء الحالي</span>
                <span className={`${styles.scoreGrade} ${styles[previewAnalysis.scoreTone]}`}>
                  {previewAnalysis.scoreLabel}
                </span>
                <p className={styles.scoreSummary}>{previewAnalysis.summary}</p>
              </div>
            </div>

            <div className={styles.scoreActions}>
              <GenerateButton businessId={business.id} />
              <Link href="/merchant/insights/archive" className={styles.archiveLink}>
                الأرشيف
              </Link>
              {insights.length > 0 && (
                <span className={styles.lastGenerated}>
                  آخر تقرير:{' '}
                  {new Date(insights[0]!.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </section>

          {/* Live Insights */}
          {previewAnalysis.insights.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>أهم النقاط دلوقتي</h2>
              <div className={styles.insightsGrid}>
                {previewAnalysis.insights.slice(0, 6).map((ins) => (
                  <div key={ins.id} className={`${styles.insight} ${styles[ins.severity]}`}>
                    <div className={styles.insightHead}>
                      <span className={styles.insightDot} />
                      <h3 className={styles.insightTitle}>{ins.title}</h3>
                    </div>
                    <p className={styles.insightDesc}>{ins.description}</p>
                    {ins.action && <span className={styles.insightAction}>💡 {ins.action}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* History */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>التقارير السابقة</h2>
            {insights.length === 0 ? (
              <EmptyState
                Icon={FileTextIcon}
                title="مفيش تقارير لسه"
                description='اضغط "استخرج تقرير" عشان تحصل على أول تقرير كامل'
              />
            ) : (
              <div className={styles.historyList}>
                {insights.map((ins) => {
                  const date = new Date(ins.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                  return (
                    <Link
                      key={ins.id}
                      href={`/merchant/insights/${ins.id}`}
                      className={styles.historyItem}
                    >
                      <span className={styles.historyIcon}>
                        <FileTextIcon size={18} />
                      </span>
                      <div className={styles.historyBody}>
                        <span className={styles.historyDate}>{date}</span>
                        <span className={styles.historySummary}>
                          {ins.summary?.slice(0, 100) ?? 'ملخص'}
                        </span>
                      </div>
                      <span
                        className={`${styles.historyScore} ${styles[getToneFromScore(ins.score ?? 0)]}`}
                      >
                        {ins.score ?? '—'}
                      </span>
                      <ArrowLeftIcon size={14} className={styles.historyChev} />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function getToneFromScore(score: number): 'teal' | 'gold' | 'orange' | 'red' {
  if (score >= 85) return 'teal'
  if (score >= 70) return 'gold'
  if (score >= 50) return 'orange'
  return 'red'
}
