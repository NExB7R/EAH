import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon, FileTextIcon } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './archive.module.css'

export const dynamic = 'force-dynamic'

type Report = {
  id: string
  period_start: string
  period_end: string
  score: number | null
  summary: string | null
  created_at: string
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
}

export default async function MerchantArchivePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user || auth.user.is_anonymous) redirect('/auth/login')

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_profile_id', auth.user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) redirect('/merchant')

  const { data } = await supabase
    .from('business_insights')
    .select('id, period_start, period_end, score, summary, created_at')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const reports = (data ?? []) as Report[]

  const groups: Record<string, Report[]> = {}
  for (const r of reports) {
    const key = monthLabel(r.period_start)
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  }

  return (
    <div>
      <AccountPageHeader
        title="أرشيف التقارير"
        description={`${reports.length.toLocaleString('ar-EG')} تقرير لنشاط "${biz.name}"`}
      />

      {reports.length === 0 ? (
        <EmptyState
          Icon={FileTextIcon}
          title="مفيش تقارير لسه"
          description="اطلب تقرير من صفحة التحليلات الذكية — هيظهر هنا تلقائياً"
        />
      ) : (
        <div className={styles.groups}>
          {Object.entries(groups).map(([month, list]) => (
            <section key={month} className={styles.group}>
              <h2 className={styles.groupTitle}>{month}</h2>
              <div className={styles.list}>
                {list.map((r) => {
                  const period = `${new Date(r.period_start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} — ${new Date(r.period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                  return (
                    <Link key={r.id} href={`/merchant/insights/${r.id}`} className={styles.item}>
                      <span className={styles.itemIcon}>
                        <FileTextIcon size={16} />
                      </span>
                      <div className={styles.itemBody}>
                        <span className={styles.itemPeriod}>{period}</span>
                        {r.summary && (
                          <span className={styles.itemSummary}>
                            {r.summary.slice(0, 120)}
                            {r.summary.length > 120 ? '…' : ''}
                          </span>
                        )}
                      </div>
                      {r.score !== null && <span className={styles.itemScore}>{r.score}</span>}
                      <ArrowLeftIcon size={14} className={styles.itemChevron} />
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Link href="/merchant/insights" className={styles.backLink}>
          <ArrowLeftIcon size={14} />
          <span>رجوع للتحليلات</span>
        </Link>
      </div>
    </div>
  )
}
