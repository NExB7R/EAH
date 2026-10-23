import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  StoreIcon,
  ExternalLinkIcon,
  AlertIcon,
  CheckCircleIcon,
  StarIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMyContacts } from '@/lib/data/merchant'
import EmptyState from '@/components/empty-state'
import BusinessEditForm from './edit-form'
import styles from './business.module.css'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

export default async function MerchantBusinessPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/business')

  const business = await getMyBusiness(session.userId)
  if (!business) {
    return (
      <EmptyState
        Icon={StoreIcon}
        title="لسه مسجلتش نشاط"
        description="سجّل نشاطك الأول عشان تعدّل بياناته"
        ctaHref="/merchant/apply"
        ctaLabel="سجّل نشاطك"
      />
    )
  }

  const contacts = await getMyContacts(business.id)

  const status = business.is_published
    ? { key: 'published' as const, label: 'منشور', Icon: CheckCircleIcon }
    : { key: 'pending' as const, label: 'تحت المراجعة', Icon: AlertIcon }
  const StatusIcon = status.Icon

  const coverStyle = business.cover_image_url
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(168,85,247,0.3), rgba(10,7,20,0.75)), url(${business.cover_image_url})`,
      }
    : undefined

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCover} style={coverStyle} />
        <div className={styles.heroBody}>
          <div className={styles.heroLogo}>{business.name.charAt(0)}</div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{business.name}</h1>
            <div className={styles.heroMeta}>
              <span className={`${styles.heroStatus} ${styles[`status_${status.key}`]}`}>
                <StatusIcon size={11} />
                {status.label}
              </span>
              <span className={styles.dot}>·</span>
              <span>{TYPE_LABEL[business.business_type] ?? business.business_type}</span>
              {business.area && (
                <>
                  <span className={styles.dot}>·</span>
                  <span>{business.area}</span>
                </>
              )}
              {business.rating_count > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.heroRating}>
                    <StarIcon size={11} />
                    {business.rating_avg.toFixed(1)}
                    <span className={styles.heroRatingCount}>({business.rating_count})</span>
                  </span>
                </>
              )}
            </div>
            {business.is_published && (
              <Link
                href={`/businesses/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroSlug}
              >
                <span>شوف صفحتك العامة</span>
                <ExternalLinkIcon size={10} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <BusinessEditForm
        initial={{
          name: business.name,
          area: business.area ?? '',
          description: business.description ?? '',
          hook: business.hook ?? '',
          address: business.address_text ?? '',
          isOpen: business.is_open,
          acceptsWhatsapp: business.accepts_whatsapp_orders,
          phone: contacts.phone ?? '',
          whatsapp: contacts.whatsapp ?? '',
          businessType: business.business_type,
          latitude: business.location?.lat ?? null,
          longitude: business.location?.lng ?? null,
          logoUrl: business.logo_url,
          coverUrl: business.cover_image_url,
        }}
      />
    </div>
  )
}
