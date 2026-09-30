import Link from 'next/link'
import { StoreIcon, CheckCircleIcon, ArrowLeftIcon } from '@/components/icons'
import { getPendingBusinesses } from '@/lib/data/admin'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './businesses.module.css'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

export default async function AdminBusinessesPage() {
  const pending = await getPendingBusinesses()

  return (
    <div>
      <AccountPageHeader
        title="إدارة الأنشطة"
        description={`${pending.length} نشاط بحاجة موافقة`}
      />

      {pending.length === 0 ? (
        <EmptyState
          Icon={CheckCircleIcon}
          title="مفيش أنشطة معلقة"
          description="كل الأنشطة اتأكدت — تمام!"
        />
      ) : (
        <div className={styles.list}>
          {pending.map((b) => {
            const date = new Date(b.created_at).toLocaleDateString('ar-EG')
            return (
              <div key={b.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  {b.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_image_url} alt={b.name} className={styles.image} />
                  ) : (
                    <div className={styles.imageFallback}>
                      <StoreIcon size={32} />
                    </div>
                  )}
                </div>

                <div className={styles.body}>
                  <h3 className={styles.name}>{b.name}</h3>
                  <div className={styles.meta}>
                    <span>{TYPE_LABEL[b.business_type] ?? b.business_type}</span>
                    {b.area && (
                      <>
                        <span className={styles.dot}>·</span>
                        <span>{b.area}</span>
                      </>
                    )}
                  </div>
                  {b.owner && (
                    <div className={styles.owner}>
                      <span>صاحب النشاط: {b.owner.display_name}</span>
                      {b.owner.phone && <span> · {b.owner.phone}</span>}
                    </div>
                  )}
                  {b.description && <p className={styles.desc}>{b.description.slice(0, 150)}</p>}
                  <span className={styles.date}>{date}</span>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.approveBtn}>
                    <CheckCircleIcon size={14} />
                    <span>موافقة</span>
                  </button>
                  <Link href={`/businesses/${b.slug}`} className={styles.viewBtn}>
                    <span>معاينة</span>
                    <ArrowLeftIcon size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
