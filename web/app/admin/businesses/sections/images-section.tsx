'use client'

import ImageSlot from '../image-slot'
import { useBusinessForm } from '../business-form-context'

export default function ImagesSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <ImageSlot
        businessId={ctx.business.id}
        category="logo"
        initialUrl={ctx.logoUrl}
        label="اللوجو"
        aspect="square"
        onChange={(u) => ctx.setLogoUrl(u)}
      />
      <ImageSlot
        businessId={ctx.business.id}
        category="cover"
        initialUrl={ctx.coverUrl}
        label="الغلاف"
        onChange={(u) => ctx.setCoverUrl(u)}
      />
    </>
  )
}
