'use client'

import { useBusinessForm } from '../business-form-context'
import ImageGrid from '../image-grid'
import styles from '../business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Gallery section (multi-image, admin)
// ═══════════════════════════════════════════════════════════

export default function GallerySection() {
  const ctx = useBusinessForm()
  const items = ctx.business.media
    .filter((m) => m.media_type === 'gallery')
    .map((m) => ({ id: m.id, url: m.storage_path }))

  return (
    <>
      <p className={styles.hint}>صور المكان أو المنتجات — تظهر في معرض الصور بالصفحة العامة</p>
      <ImageGrid
        businessId={ctx.business.id}
        category="gallery"
        initialItems={items}
        label="صور المعرض"
        aspect="square"
      />
    </>
  )
}
