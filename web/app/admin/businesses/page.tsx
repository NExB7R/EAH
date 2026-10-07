import { StoreIcon, CheckCircleIcon, PlusIcon } from '@/components/icons'
import { getBusinessesByStatus, type BusinessStatus } from '@/lib/data/admin'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BusinessRow from './business-row'
import Link from 'next/link'
import styles from './businesses.module.css'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ status?: string }>
}

const TABS: { key: BusinessStatus; label: string }[] = [
  { key: 'pending', label: 'بانتظار' },
  { key: 'published', label: 'منشورة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'admin_owned', label: 'بإدارة الأدمن' },
  { key: 'all', label: 'الكل' },
]

export default async function AdminBusinessesPage({ searchParams }: Props) {
  const params = await searchParams
  const status = (params.status as BusinessStatus) ?? 'pending'
  const validStatus = TABS.some((t) => t.key === status) ? status : 'pending'

  const businesses = await getBusinessesByStatus(validStatus)

  return (
    <div>
      <AccountPageHeader
        title="إدارة الأنشطة"
        description={`${businesses.length} نشاط — ${TABS.find((t) => t.key === validStatus)?.label}`}
      />

      {/* Tabs */}
      <div className={styles.topBar}>
        <Link href="/admin/businesses/new" className={styles.newBtn}>
          <PlusIcon size={14} />
          <span>نشاط جديد</span>
        </Link>
      </div>

      <nav className={styles.tabs} aria-label="تصفية الأنشطة">
        {TABS.map((tab) => {
          const active = tab.key === validStatus
          return (
            <Link
              key={tab.key}
              href={`/admin/businesses?status=${tab.key}`}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {businesses.length === 0 ? (
        <EmptyState
          Icon={validStatus === 'pending' ? CheckCircleIcon : StoreIcon}
          title={validStatus === 'pending' ? 'مفيش أنشطة معلقة' : 'مفيش أنشطة'}
          description={
            validStatus === 'pending'
              ? 'كل الأنشطة اتأكدت — تمام!'
              : 'جرب تاب تاني أو استنى أنشطة جديدة'
          }
        />
      ) : (
        <div className={styles.list}>
          {businesses.map((b) => (
            <BusinessRow key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  )
}
