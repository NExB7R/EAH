import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  SparklesIcon,
  StoreIcon,
  FileTextIcon,
  AlertIcon,
  ArrowLeftIcon,
} from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './storage.module.css'

export const dynamic = 'force-dynamic'

type Row = {
  business_id: string
  business_name: string
  business_slug: string
  insights_count: number
  latest_at: string | null
}

async function getStorageData(): Promise<Row[]> {
  const supabase = await createClient()

  // جيب كل الأنشطة اللي عندها تقارير
  const { data } = await supabase
    .from('business_insights')
    .select(`
      business_id,
      created_at,
      business:businesses(name, slug)
    `)
    .order('created_at', { ascending: false })

  if (!data) return []

  // جمّع بالـ business
  const map = new Map<string, Row>()
  for (const r of data) {
    const biz = r.business as unknown as { name: string; slug: string } | null
    if (!biz) continue
    const existing = map.get(r.business_id)
    if (existing) {
      existing.insights_count++
    } else {
      map.set(r.business_id, {
        business_id: r.business_id,
        business_name: biz.name,
        business_slug: biz.slug,
        insights_count: 1,
        latest_at: r.created_at,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.insights_count - a.insights_count)
}

export default async function AdminInsightsStoragePage() {
  const rows = await getStorageData()
  const totalInsights = rows.reduce((s, r) => s + r.insights_count, 0)
  const estimatedSizeMb = (totalInsights * 100) / 1024

  return (
    <div>
      <AccountPageHeader
        title="تخزين التقارير الذكية"
        description={`${totalInsights} تقرير عبر ${rows.length} نشاط — ~${estimatedSizeMb.toFixed(1)} MB`}
      />

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><FileTextIcon size={20} /></span>
          <span className={styles.summaryValue}>{totalInsights}</span>
          <span className={styles.summaryLabel}>تقرير</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><StoreIcon size={20} /></span>
          <span className={styles.summaryValue}>{rows.length}</span>
          <span className={styles.summaryLabel}>نشاط</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><SparklesIcon size={20} /></span>
          <span className={styles.summaryValue}>{estimatedSizeMb.toFixed(1)}</span>
          <span className={styles.summaryLabel}>MB</span>
        </div>
      </div>

      {/* Alert */}
      {estimatedSizeMb > 100 && (
        <div className={styles.alert}>
          <AlertIcon size={18} />
          <span>التخزين بدأ يكبر — راجع الأنشطة الأعلى استهلاكاً</span>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          Icon={SparklesIcon}
          title="مفيش تقارير مخزنة"
          description="لما الأنشطة تبدأ تستخدم المساعد الذكي، هتظهر هنا"
        />
      ) : (
        <div className={styles.list}>
          {rows.map((r) => {
            const date = r.latest_at
              ? new Date(r.latest_at).toLocaleDateString('ar-EG')
              : '—'
            const sizeKb = r.insights_count * 100

            return (
              <Link
                key={r.business_id}
                href={`/admin/businesses/${r.business_id}`}
                className={styles.item}
              >
                <div className={styles.itemIcon}>
                  <StoreIcon size={18} />
                </div>
                <div className={styles.itemBody}>
                  <span className={styles.itemName}>{r.business_name}</span>
                  <span className={styles.itemMeta}>
                    آخر تقرير: {date}
                  </span>
                </div>
                <div className={styles.itemStats}>
                  <span className={styles.itemCount}>{r.insights_count}</span>
                  <span className={styles.itemSize}>~{sizeKb} KB</span>
                </div>
                <ArrowLeftIcon size={14} className={styles.chev} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
