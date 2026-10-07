'use client'

import { useEffect } from 'react'
import { cacheBusinessDetail } from '@/lib/offline/businesses'
import type { BusinessDetail } from '@/lib/data/business-detail'

// ═══════════════════════════════════════════════════════════
// EAH — Business Detail Cache
// يحفظ تفاصيل النشاط في IndexedDB عند كل زيارة
// ═══════════════════════════════════════════════════════════

type Props = {
  slug: string
  detail: BusinessDetail
}

export default function BusinessCache({ slug, detail }: Props) {
  useEffect(() => {
    void cacheBusinessDetail(slug, detail)
  }, [slug, detail])

  return null
}
