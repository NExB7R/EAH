import { createClient } from '@/lib/supabase/server'
import { CheckCircleIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getReports, getAdminBadges } from '@/lib/data/admin'
import ModerationRow from './moderation-row'
import ModerationTabs from './moderation-tabs'
import ModerationFilters from './moderation-filters'
import FraudView from './fraud-view'
import ReportList from '../reports/report-list'
import type { ModerationReview } from './types'
import styles from './moderation.module.css'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string; filter?: string; q?: string }

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

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tab = params.tab === 'reports' ? 'reports' : params.tab === 'fraud' ? 'fraud' : 'reviews'
  const filter = params.filter ?? 'all'
  const q = (params.q ?? '').trim().toLowerCase()

  const badges = await getAdminBadges()
  const reviewsCount = tab === 'reviews' ? (await getReviews()).length : badges.flaggedReviews

  // ─── Tab: Reviews (default) ───
  if (tab === 'reviews') {
    const allReviews = await getReviews()

    let reviews = allReviews
    if (filter === 'pending') reviews = reviews.filter((r) => r.status === 'pending')
    else if (filter === 'flagged') reviews = reviews.filter((r) => r.status === 'flagged')
    else if (filter === 'low_rating') reviews = reviews.filter((r) => r.rating <= 2)

    if (q) {
      reviews = reviews.filter(
        (r) =>
          (r.comment ?? '').toLowerCase().includes(q) ||
          (r.business_name ?? '').toLowerCase().includes(q) ||
          (r.user_name ?? '').toLowerCase().includes(q),
      )
    }

    return (
      <div>
        <AccountPageHeader
          title="المراجعة والأمان"
          description={`${allReviews.length} تقييم بحاجة مراجعة — ${reviews.length} معروض`}
        />
        <ModerationTabs
          reviewsCount={allReviews.length}
          reportsCount={badges.openReports}
          fraudCount={badges.flaggedReviews}
        />

        <ModerationFilters />

        {reviews.length === 0 ? (
          <EmptyState
            Icon={CheckCircleIcon}
            title={allReviews.length === 0 ? 'مفيش حاجة بحاجة مراجعة' : 'مفيش نتائج للفلتر'}
            description={q ? 'جرّب بحث تاني' : 'كل التقييمات تمام!'}
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

  // ─── Tab: Reports ───
  if (tab === 'reports') {
    const reports = await getReports('all')
    const open = reports.filter((r) => r.status === 'pending' || r.status === 'reviewing').length
    return (
      <div>
        <AccountPageHeader
          title="المراجعة والأمان"
          description={`${open} إبلاغ بحاجة مراجعة من ${reports.length}`}
        />
        <ModerationTabs
          reviewsCount={badges.flaggedReviews}
          reportsCount={open}
          fraudCount={badges.flaggedReviews}
        />
        <ReportList reports={reports} />
      </div>
    )
  }

  // ─── Tab: Fraud ───
  return (
    <div>
      <AccountPageHeader title="المراجعة والأمان" description="كشف التلاعب والاحتيال" />
      <ModerationTabs
        reviewsCount={reviewsCount}
        reportsCount={badges.openReports}
        fraudCount={badges.flaggedReviews}
      />
      <FraudView />
    </div>
  )
}
