'use client'

import FeaturedRow from './featured-row'
import type { FeaturedBusiness } from '@/lib/data/admin'
import styles from './featured.module.css'

type Props = { businesses: FeaturedBusiness[] }

// Featured activities have equal public priority. Admin can activate, pause,
// or extend eligibility, but cannot assign a public rank or pin.
export default function FeaturedList({ businesses }: Props) {
  return (
    <div className={styles.list}>
      {businesses.map((business) => (
        <FeaturedRow
          key={business.id}
          business={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            area: business.area,
            featured_until: business.featured_until,
            is_published: business.is_published,
            paid_featured_home_eligible: business.paid_featured_home_eligible,
          }}
        />
      ))}
    </div>
  )
}
