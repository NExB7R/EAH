'use client'

import { useEffect, useState } from 'react'
import { defaultEahPageData, EahPageRenderer, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro'

export default function EahHomeClient({ businesses }: { businesses: EahBusiness[] }) {
  const [data, setData] = useState<EahPageData>(defaultEahPageData)

  useEffect(() => {
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
    return () => window.removeEventListener('eah:design-published', onPublish)
  }, [])

  return <EahPageRenderer data={data} businesses={businesses} />
}
