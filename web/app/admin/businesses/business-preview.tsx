'use client'

import { StoreIcon } from '@/components/icons'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Live Preview Card
// ═══════════════════════════════════════════════════════════

type Props = {
  name: string
  type: string
  area: string | null
  hook: string | null
  logoUrl: string | null
  coverUrl: string | null
  isFeatured: boolean
  isNew: boolean
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

export default function BusinessPreview({
  name,
  type,
  area,
  hook,
  logoUrl,
  coverUrl,
  isFeatured,
  isNew,
}: Props) {
  return (
    <aside className={styles.preview}>
      <span className={styles.previewLabel}>معاينة حية</span>
      <div className={styles.previewCard}>
        <div className={styles.previewCover}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="cover" />
          ) : (
            <StoreIcon size={32} />
          )}
          <div className={styles.previewLogo}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="logo" />
            ) : (
              <StoreIcon size={24} />
            )}
          </div>
        </div>
        <div className={styles.previewBody}>
          <span className={styles.previewName}>{name || 'اسم النشاط'}</span>
          <div className={styles.previewMeta}>
            <span>{TYPE_LABEL[type] ?? type}</span>
            {area && (
              <>
                <span className={styles.previewDot}>·</span>
                <span>{area}</span>
              </>
            )}
            {isFeatured && <span className={`${styles.chip} ${styles.chipGold}`}>مميز</span>}
            {isNew && <span className={`${styles.chip} ${styles.chipOrange}`}>جديد</span>}
          </div>
          {hook && <p className={styles.previewHook}>{hook}</p>}
        </div>
      </div>
    </aside>
  )
}
