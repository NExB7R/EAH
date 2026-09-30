import { createClient } from '@/lib/supabase/server'
import { CheckCircleIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './moderation.module.css'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  comment: string | null
  status: string
  created_at: string
  flagged_reason: string | null
  user: { display_name: string } | null
  business: { name: string; slug: string } | null
}

async function getPendingReviews(): Promise<Row[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_reviews')
    .select(`
      id, comment, status, created_at, flagged_reason,
      user:profiles(display_name),
      business:businesses(name, slug)
    `)
    .in('status', ['pending', 'flagged'])
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []) as unknown as Row[]
}

export default async function AdminModerationPage() {
  const reviews = await getPendingReviews()

  return (
    <div>
      <AccountPageHeader
        title="المراجعة"
        description={`${reviews.length} تقييم بحاجة مراجعة`}
      />

      {reviews.length === 0 ? (
        <EmptyState Icon={CheckCircleIcon} title="مفيش حاجة بحاجة مراجعة" description="كل التقييمات تمام!" />
      ) : (
        <div className={styles.list}>
          {reviews.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString('ar-EG')
            return (
              <div key={r.id} className={styles.card}>
                <div className={styles.head}>
                  <div className={styles.from}>
                    <span className={styles.user}>{r.user?.display_name ?? 'مستخدم'}</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.business}>{r.business?.name ?? 'نشاط'}</span>
                  </div>
                  <span className={`${styles.badge} ${r.status === 'flagged' ? styles.flagged : styles.pending}`}>
                    {r.status === 'flagged' ? 'مبلَّغ عنه' : 'معلّق'}
                  </span>
                </div>

                {r.flagged_reason && (
                  <p className={styles.reason}>
                    <strong>سبب الإبلاغ:</strong> {r.flagged_reason}
                  </p>
                )}

                {r.comment && <p className={styles.comment}>{r.comment}</p>}

                <div className={styles.foot}>
                  <span className={styles.date}>{date}</span>
                  <div className={styles.actions}>
                    <button type="button" className={styles.approve}>موافقة</button>
                    <button type="button" className={styles.reject}>رفض</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
