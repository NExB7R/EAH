import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SparklesIcon, StoreIcon, FileTextIcon, CrownGoldIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getAllInsightsForAdmin } from '@/lib/data/insights'
import GenerateForm from './generate-form'
import DeleteButton from './delete-button'
import styles from './storage.module.css'

export const dynamic = 'force-dynamic'

async function getBusinessList(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id, name')
    .order('name', { ascending: true })
    .limit(200)
  return (data ?? []) as { id: string; name: string }[]
}

export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>
}) {
  const params = await searchParams
  const filterBusiness = params.business

  const [insightsAll, businesses] = await Promise.all([
    getAllInsightsForAdmin(100),
    getBusinessList(),
  ])
  const insights = filterBusiness
    ? insightsAll.filter((i) => i.business_id === filterBusiness)
    : insightsAll

  const totalReports = insights.length
  const uniqueBusinesses = new Set(insights.map((i) => i.business_id)).size
  const avgScore =
    insights.filter((i) => i.score !== null).length > 0
      ? Math.round(
          insights.reduce((sum, i) => sum + (i.score ?? 0), 0) /
            insights.filter((i) => i.score !== null).length,
        )
      : 0

  return (
    <div>
      <AccountPageHeader
        title="تقارير الأنشطة"
        description={`${totalReports.toLocaleString('en-US')} تقرير عبر ${uniqueBusinesses.toLocaleString('en-US')} نشاط`}
      />

      <div className={styles.toolbar}>
        <form method="get" className={styles.filterForm}>
          <select
            name="business"
            defaultValue={filterBusiness ?? ''}
            className={styles.filterSelect}
          >
            <option value="">كل الأنشطة</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.filterBtn}>
            تصفية
          </button>
          {filterBusiness && (
            <Link href="/admin/insights" className={styles.filterClear}>
              مسح
            </Link>
          )}
        </form>
        <GenerateForm businesses={businesses} />
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>
            <FileTextIcon size={20} />
          </span>
          <span className={styles.summaryValue}>{totalReports.toLocaleString('en-US')}</span>
          <span className={styles.summaryLabel}>تقرير</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>
            <StoreIcon size={20} />
          </span>
          <span className={styles.summaryValue}>{uniqueBusinesses.toLocaleString('en-US')}</span>
          <span className={styles.summaryLabel}>نشاط</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>
            <SparklesIcon size={20} />
          </span>
          <span className={styles.summaryValue}>{avgScore.toLocaleString('en-US')}</span>
          <span className={styles.summaryLabel}>متوسط التقييم</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>
            <CrownGoldIcon size={20} />
          </span>
          <span className={styles.summaryValue}>{businesses.length.toLocaleString('en-US')}</span>
          <span className={styles.summaryLabel}>نشاط متاح</span>
        </div>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          Icon={SparklesIcon}
          title="مفيش تقارير لسه"
          description="اضغط توليد تقرير جديد عشان تعمل أول تقرير"
        />
      ) : (
        <div className={styles.list}>
          {insights.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            const period = `${new Date(r.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(r.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            const scoreLabel =
              r.score !== null
                ? r.score >= 80
                  ? 'ممتاز'
                  : r.score >= 60
                    ? 'جيد'
                    : r.score >= 40
                      ? 'متوسط'
                      : 'ضعيف'
                : 'بدون تقييم'

            return (
              <div key={r.id} className={styles.item}>
                <Link href={`/admin/insights/${r.id}`} className={styles.itemMain}>
                  <div className={styles.itemIcon}>
                    <StoreIcon size={18} />
                  </div>
                  <div className={styles.itemBody}>
                    <span className={styles.itemName}>{r.business_name}</span>
                    <span className={styles.itemMeta}>
                      {period} · {date}
                    </span>
                    {r.summary && (
                      <span className={styles.itemSummary}>
                        {r.summary.slice(0, 120)}
                        {r.summary.length > 120 ? '…' : ''}
                      </span>
                    )}
                  </div>
                  <div className={styles.itemStats}>
                    {r.score !== null && (
                      <>
                        <span className={styles.itemCount}>{r.score}</span>
                        <span className={styles.itemSize}>{scoreLabel}</span>
                      </>
                    )}
                  </div>
                </Link>
                <div className={styles.itemActions}>
                  <Link
                    href={`/admin/insights/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.printBtn}
                  >
                    طباعة
                  </Link>
                  <DeleteButton insightId={r.id} businessName={r.business_name} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
