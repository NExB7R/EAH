'use client'

import { useBusinessForm } from '../business-form-context'
import ImageGrid from '../image-grid'
import styles from '../business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Menu section (multi-image, admin)
// ═══════════════════════════════════════════════════════════

export default function MenuSection() {
  const ctx = useBusinessForm()
  const items = ctx.business.media
    .filter((m) => m.media_type === 'menu')
    .map((m) => ({ id: m.id, url: m.storage_path }))

  return (
    <>
      <p className={styles.hint}>صور المنيو (صور أو سكرين شوتس) — كل صورة تتفتح بحجم كامل للزائر</p>
      <ImageGrid
        businessId={ctx.business.id}
        category="menu"
        initialItems={items}
        label="صور المنيو"
        aspect="video"
      />
    </>
  )
}
