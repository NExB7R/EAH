'use client'

import ImageSlot from '../image-slot'
import { useBusinessForm } from '../business-form-context'
import styles from '../business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Images section (logo + cover)
// Reads existing media from business.media so edits show current state.
// ═══════════════════════════════════════════════════════════

export default function ImagesSection() {
  const ctx = useBusinessForm()
  const existingLogo = ctx.business.media.find((m) => m.media_type === 'logo')
  const existingCover = ctx.business.media.find((m) => m.media_type === 'cover')
  const fallbackCover = ctx.business.cover_image_url

  return (
    <>
      <p className={styles.hint}>
        اللوجو = مربع صغير يظهر جانب الاسم. الغلاف = صورة عريضة أعلى الصفحة.
      </p>
      <ImageSlot
        businessId={ctx.business.id}
        category="logo"
        initialUrl={existingLogo?.storage_path ?? null}
        initialMediaId={existingLogo?.id ?? null}
        label="اللوجو"
        aspect="square"
        onChange={(u) => ctx.setLogoUrl(u)}
      />
      <ImageSlot
        businessId={ctx.business.id}
        category="cover"
        initialUrl={existingCover?.storage_path ?? fallbackCover ?? null}
        initialMediaId={existingCover?.id ?? null}
        label="الغلاف"
        onChange={(u) => ctx.setCoverUrl(u)}
      />
    </>
  )
}
