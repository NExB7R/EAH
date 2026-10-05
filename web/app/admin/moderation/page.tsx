import { createClient } from '@/lib/supabase/server'
import { CheckCircleIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import ModerationRow from './moderation-row'
import type { ModerationReview } from './types'
import styles from './moderation.module.css'

export const dynamic = 'force-dynamic'

async function getReviews(): Promise<ModerationReview[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_reviews')
    .select(
      `
      id, comment, taste, value_for_money, speed, experience, status, created_at, flagged_reason,
      user:profiles(display_name),
      business:businesses(name, slug)
    `,
    )
    .in('status', ['pending', 'flagged'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (!data) return []

  return data.map((r) => {
    const u = r.user as unknown as { display_name: string }[] | { display_name: string } | null
    const b = r.business as unknown as
      { name: string; slug: string }[] | { name: string; slug: string } | null
    const user = Array.isArray(u) ? (u[0] ?? null) : u
    const biz = Array.isArray(b) ? (b[0] ?? null) : b
    const parts = [r.taste, r.value_for_money, r.speed, r.experience].filter(
      (v): v is number => typeof v === 'number' && v > 0,
    )
    const rating =
      parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0

    return {
      id: r.id,
      comment: r.comment,
      rating,
      status: r.status,
      created_at: r.created_at,
      flagged_reason: r.flagged_reason,
      user_name: user?.display_name ?? null,
      business_name: biz?.name ?? null,
      business_slug: biz?.slug ?? null,
    }
  })
}

export default async function AdminModerationPage() {
  const reviews = await getReviews()

  return (
    <div>
      <AccountPageHeader title="المراجعة" description={`${reviews.length} تقييم بحاجة مراجعة`} />

      {reviews.length === 0 ? (
        <EmptyState
          Icon={CheckCircleIcon}
          title="مفيش حاجة بحاجة مراجعة"
          description="كل التقييمات تمام!"
        />
      ) : (
        <div className={styles.list}>
          {reviews.map((r) => (
            <ModerationRow key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  )
}
