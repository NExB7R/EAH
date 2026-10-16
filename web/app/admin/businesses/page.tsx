import {
  StoreIcon,
  CheckCircleIcon,
  PlusIcon,
  AlertIcon,
  CrownGoldIcon,
  CloseIcon,
} from '@/components/icons'
import { getBusinessesByStatus, type BusinessStatus } from '@/lib/data/admin'
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
  searchParams: Promise<{ status?: string; q?: string; area?: string }>
}

const TABS: { key: BusinessStatus; label: string }[] = [
  { key: 'pending', label: 'بانتظار' },
  { key: 'published', label: 'منشورة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'admin_owned', label: 'بإدارة الأدمن' },
  { key: 'all', label: 'الكل' },
]

type Stats = {
  pending: number
  published: number
  rejected: number
  adminOwned: number
}

function computeStats(all: Awaited<ReturnType<typeof getBusinessesByStatus>>): Stats {
  return {
    pending: all.filter((b) => !b.is_published && !b.rejected_at).length,
    published: all.filter((b) => b.is_published).length,
    rejected: all.filter((b) => !!b.rejected_at).length,
    adminOwned: all.filter((b) => b.source === 'admin' && b.is_published).length,
  }
}

export default async function AdminBusinessesPage({ searchParams }: Props) {
  const params = await searchParams
  const status = (params.status as BusinessStatus) ?? 'pending'
  const validStatus = TABS.some((t) => t.key === status) ? status : 'pending'
  const q = (params.q ?? '').trim().toLowerCase()
  const areaFilter = params.area ?? ''

  // Admin badges من كل الحالات
  const [allForStats, activeAreas] = await Promise.all([
    getBusinessesByStatus('all'),
    getActiveAreas(),
  ])
  const stats = computeStats(allForStats)

  let businesses = await getBusinessesByStatus(validStatus)

  // فلترة إضافية
  if (q) {
    businesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.area ?? '').toLowerCase().includes(q) ||
        (b.owner?.display_name ?? '').toLowerCase().includes(q) ||
        (b.owner?.phone ?? '').includes(q),
    )
  }
  if (areaFilter) {
    businesses = businesses.filter((b) => b.area === areaFilter)
  }

  return (
    <div>
      <AccountPageHeader
        title="إدارة الأنشطة"
        description={`${allForStats.length} نشاط — ${businesses.length} معروض`}
      />

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${stats.pending > 0 ? styles.statWarn : ''}`}>
          <span className={styles.statIcon}>
            <AlertIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>بانتظار موافقة</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statIcon}>
            <CheckCircleIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.published}</span>
            <span className={styles.statLabel}>منشور</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <CloseIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.rejected}</span>
            <span className={styles.statLabel}>مرفوض</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={styles.statIcon}>
            <CrownGoldIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.adminOwned}</span>
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
            tab.key === 'all' ? allForStats.length : (stats[tab.key as keyof Stats] ?? 0)
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

      {businesses.length === 0 ? (
        <EmptyState
          Icon={validStatus === 'pending' ? CheckCircleIcon : StoreIcon}
          title={validStatus === 'pending' ? 'مفيش أنشطة معلقة' : 'مفيش نتائج'}
          description={
            validStatus === 'pending'
              ? 'كل الأنشطة اتأكدت — تمام!'
              : q || areaFilter
                ? 'جرّب بحث أو فلتر تاني'
                : 'جرب تاب تاني أو استنى أنشطة جديدة'
          }
        />
      ) : (
        <BusinessList businesses={businesses} status={validStatus} />
      )}
    </div>
  )
}
