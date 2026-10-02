import AccountPageHeader from '@/components/account-page-header'
import { CrownGoldIcon } from '@/components/icons'
import { getFeaturedBusinesses } from '@/lib/data/admin'
import FeaturedRow from './featured-row'
import styles from './featured.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const businesses = await getFeaturedBusinesses()

  const featured = businesses.filter((b) => b.is_featured)

  return (
    <div>
      <AccountPageHeader
        title="إدارة المميزين"
        description={`${featured.length} نشاط مميز من ${businesses.length}`}
      />

      {featured.length === 0 ? (
        <div className={styles.empty}>
          <CrownGoldIcon size={32} />
          <p>مفيش أنشطة مميزة حاليًا</p>
        </div>
      ) : (
        <div className={styles.list}>
          {featured.map((b) => (
            <FeaturedRow
              key={b.id}
              business={{
                id: b.id,
                name: b.name,
                slug: b.slug,
                business_type: b.business_type,
                area: b.area,
                cover_image_url: b.cover_image_url,
                featured_pin: b.featured_pin,
                featured_order: b.featured_order,
                featured_until: b.featured_until,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
