import {
  StoreIcon,
  CheckCircleIcon,
  PlusIcon,
  AlertIcon,
  CrownGoldIcon,
  CloseIcon,
} from '@/components/icons'
import { type BusinessStatus } from '@/lib/data/admin'
import { getAdminBusinessesPage } from '@/lib/data/admin-business-list'
import { getActiveAreas } from '@/lib/data/areas'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BusinessList from './business-list'
import BusinessFilters from './business-filters'
import ExportButton from '@/components/ui/export-button'
import Link from 'next/link'
import styles from './businesses.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ status?: string; q?: string; area?: string; page?: string }>
}

const TABS: { key: BusinessStatus; label: string }[] = [
  { key: 'pending', label: 'بانتظار' },
  { key: 'published', label: 'منشورة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'admin_owned', label: 'بإدارة الأدمن' },
  { key: 'all', label: 'الكل' },
]

function buildBusinessListHref(
  status: BusinessStatus,
  query: string,
  area: string,
  page: number,
): string {
  const params = new URLSearchParams({ status, page: String(page) })
  if (query) params.set('q', query)
  if (area) params.set('area', area)
  return `/admin/businesses?${params.toString()}`
}

export default async function AdminBusinessesPage({ searchParams }: Props) {
  const params = await searchParams
  const status = (params.status as BusinessStatus) ?? 'pending'
  const validStatus = TABS.some((t) => t.key === status) ? status : 'pending'
  const q = (params.q ?? '').trim().slice(0, 100)
  const areaFilter = params.area ?? ''
  const requestedPage = Number.parseInt(params.page ?? '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const [businessPage, activeAreas] = await Promise.all([
    getAdminBusinessesPage({
      status: validStatus,
      query: q,
      area: areaFilter,
      page,
    }),
    getActiveAreas(),
  ])
  const { businesses, counts, total, ownerSearchLimited } = businessPage

  return (
    <div>
      <AccountPageHeader
        title="إدارة الأنشطة"
        description={`${counts.all.toLocaleString('en-US')} نشاط إجمالي — ${total.toLocaleString('en-US')} نتيجة`}
      />

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${counts.pending > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statIcon}>
            <AlertIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{counts.pending.toLocaleString('en-US')}</span>
            <span className={styles.statLabel}>بانتظار موافقة</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statIcon}>
            <CheckCircleIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{counts.published.toLocaleString('en-US')}</span>
            <span className={styles.statLabel}>منشور</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <CloseIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{counts.rejected.toLocaleString('en-US')}</span>
            <span className={styles.statLabel}>مرفوض</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={styles.statIcon}>
            <CrownGoldIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{counts.adminOwned.toLocaleString('en-US')}</span>
            <span className={styles.statLabel}>بإدارة الأدمن</span>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div className={styles.topBar}>
        <ExportButton type="businesses" />
        <Link href="/admin/businesses/new" className={styles.newBtn}>
          <PlusIcon size={14} />
          <span>نشاط جديد</span>
        </Link>
      </div>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="تصفية الأنشطة">
        {TABS.map((tab) => {
          const active = tab.key === validStatus
          const count =
            tab.key === 'all'
              ? counts.all
              : tab.key === 'pending'
                ? counts.pending
                : tab.key === 'published'
                  ? counts.published
                  : tab.key === 'rejected'
                    ? counts.rejected
                    : counts.adminOwned
          return (
            <Link
              key={tab.key}
              href={`/admin/businesses?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ''}${areaFilter ? `&area=${encodeURIComponent(areaFilter)}` : ''}`}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              {count > 0 && <span className={styles.tabCount}>{count}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Filters */}
      <BusinessFilters areas={activeAreas.map((a) => a.area)} />

      {ownerSearchLimited && q && (
        <p className={styles.searchNotice} role="status">
          البحث عن المالكين واسع أو غير متاح مؤقتًا. ضيّق اسم المالك أو رقم الهاتف لتحصل على نتائج
          أدق.
        </p>
      )}

      {businesses.length === 0 ? (
        <EmptyState
          Icon={validStatus === 'pending' ? CheckCircleIcon : StoreIcon}
          title={validStatus === 'pending' ? 'مفيش أنشطة معلقة' : 'مفيش نتائج'}
          description={
            validStatus === 'pending'
              ? 'لا توجد أنشطة غير منشورة بانتظار المراجعة في النتائج الحالية.'
              : q || areaFilter
                ? 'جرّب بحث أو فلتر تاني'
                : 'جرّب حالة أخرى أو أضف نشاطًا جديدًا'
          }
        />
      ) : (
        <>
          <BusinessList businesses={businesses} status={validStatus} />
          {total > businessPage.pageSize && (
            <nav className={styles.pagination} aria-label="صفحات الأنشطة">
              <span className={styles.pageSummary}>
                صفحة {businessPage.page.toLocaleString('en-US')} من{' '}
                {Math.ceil(total / businessPage.pageSize).toLocaleString('en-US')}
              </span>
              <div className={styles.pageActions}>
                {businessPage.page > 1 && (
                  <Link
                    className={styles.pageLink}
                    href={buildBusinessListHref(validStatus, q, areaFilter, businessPage.page - 1)}
                    rel="prev"
                  >
                    السابق
                  </Link>
                )}
                {businessPage.page < Math.ceil(total / businessPage.pageSize) && (
                  <Link
                    className={styles.pageLink}
                    href={buildBusinessListHref(validStatus, q, areaFilter, businessPage.page + 1)}
                    rel="next"
                  >
                    التالي
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
