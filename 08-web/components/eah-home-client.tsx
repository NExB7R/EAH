'use client'

import { useEffect, useState } from 'react'
import { defaultEahPageData, EahPageRenderer, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro'

export default function EahHomeClient({ businesses }: { businesses: EahBusiness[] }) {
  const [data, setData] = useState<EahPageData>(defaultEahPageData)

  useEffect(() => {
    let active = true
    void fetch('/api/studio/design', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (active && payload?.data) setData(payload.data as EahPageData)
      })
      .catch(() => {})

    try {
      const saved = localStorage.getItem('eah:studio:design:v2')
      if (saved) setData(JSON.parse(saved) as EahPageData)
    } catch {}

    const onPublish = () => {
      try {
        const saved = localStorage.getItem('eah:studio:design:v2')
        if (saved) setData(JSON.parse(saved) as EahPageData)
      } catch {}
    }

    window.addEventListener('eah:design-published', onPublish)
    return () => {
      active = false
      window.removeEventListener('eah:design-published', onPublish)
    }
  }, [])

  return <EahPageRenderer data={data} businesses={businesses} />
}
