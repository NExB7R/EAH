import { notFound } from 'next/navigation'
import AccountPageHeader from '@/components/account-page-header'
import { AlertIcon, StoreIcon } from '@/components/icons'
import { getBusinessById } from '@/lib/data/admin-business'
import BusinessForm from '../business-form'
import DeleteBusinessButton from './delete-button'
import TrialOwnerPanel from './trial-owner-panel'
import BusinessActionsBar from './business-actions-bar'
import styles from '../businesses.module.css'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminBusinessDetailPage({ params }: Props) {
  const { id } = await params
  const biz = await getBusinessById(id)
  if (!biz) notFound()

  const status = biz.is_published ? 'published' : biz.rejected_at ? 'rejected' : 'pending'

  return (
    <div className={styles.detailPage}>
      <AccountPageHeader
        title={biz.name}
        description={`${TYPE_LABEL[biz.business_type] ?? biz.business_type} · ${biz.area ?? 'بدون منطقة'}`}
      />

      <div className={styles.detailActions}>
        <BusinessActionsBar
          businessId={biz.id}
          businessName={biz.name}
          businessSlug={biz.slug}
          isPublished={biz.is_published}
          isRejected={!!biz.rejected_at}
        />
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <div className={`${styles.card} ${styles.detailCard}`}>
            <div className={styles.imageWrap}>
              {biz.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={biz.cover_image_url} alt={biz.name} className={styles.image} />
              ) : (
                <div className={styles.imageFallback}>
                  <StoreIcon size={32} />
                </div>
              )}
            </div>
            <div className={styles.body}>
              <span className={`${styles.status} ${styles[`status_${status}`]}`}>
                {status === 'pending' && 'بانتظار'}
                {status === 'published' && 'منشور'}
                {status === 'rejected' && 'مرفوض'}
              </span>

              {biz.owner && (
                <div className={styles.owner}>
                  <span>👤 {biz.owner.display_name}</span>
                  {biz.owner.phone && <span className={styles.phone}>· {biz.owner.phone}</span>}
                </div>
              )}

              <div className={styles.meta}>
                <span>Trust: {biz.trust_score}</span>
                <span className={styles.dot}>·</span>
                <span>
                  ⭐ {biz.rating_avg.toFixed(1)} ({biz.rating_count})
                </span>
                <span className={styles.dot}>·</span>
                <span>{biz.successful_orders} طلب</span>
              </div>

              {biz.rejected_at && biz.rejection_reason && (
                <div className={styles.rejectionBox}>
                  <AlertIcon size={14} />
                  <span>سبب الرفض: {biz.rejection_reason}</span>
                </div>
              )}

              <div className={styles.metaSection}>
                <strong>جهات الاتصال:</strong>
                {biz.contacts.length === 0 ? (
                  <span className={styles.muted}>لا يوجد</span>
                ) : (
                  <ul className={styles.simpleList}>
                    {biz.contacts.map((c, i) => (
                      <li key={i}>
                        {c.method_type}: {c.value}
                        {c.is_primary && ' (أساسي)'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.metaSection}>
                <strong>الفروع:</strong>
                {biz.branches.length === 0 ? (
                  <span className={styles.muted}>لا يوجد</span>
                ) : (
                  <ul className={styles.simpleList}>
                    {biz.branches.map((br) => (
                      <li key={br.id}>
                        {br.name} — {br.area ?? 'بدون منطقة'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.metaSection}>
                <strong>الصور:</strong> {biz.media.length}
              </div>

              <div className={styles.actions}>
                <DeleteBusinessButton id={biz.id} name={biz.name} />
              </div>
            </div>
          </div>
        </div>

        <aside className={styles.formWrap}>
          <TrialOwnerPanel
            businessId={biz.id}
            businessName={biz.name}
            ownerProfileId={biz.owner_profile_id || null}
            ownerDisplayName={biz.owner?.display_name ?? null}
            ownerPhone={biz.owner?.phone ?? null}
            source={biz.source}
            trialUsed={biz.trial_used}
          />
          <h2 className={styles.formTitle}>تعديل البيانات</h2>
          <BusinessForm mode="edit" business={biz} />
        </aside>
      </div>
    </div>
  )
}
