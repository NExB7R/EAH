'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { defaultEahPageData, EahPageRenderer, type EahBusiness, type EahPageData } from '@/components/eah-page-builder'
import EahAdSlot from '@/components/eah-ad-slot'

const STORAGE_KEY = 'eah:page-design:v1'

export default function EahHomeContent({ businesses }: { businesses: EahBusiness[] }) {
  const [data, setData] = useState<EahPageData>(defaultEahPageData)

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setData(JSON.parse(stored) as EahPageData)
      } catch { setData(defaultEahPageData) }
    }
    load()
    window.addEventListener('eah:design-published', load)
    return () => window.removeEventListener('eah:design-published', load)
  }, [])

  return (
    <>
      <EahAdSlot slotKey="home_top" />
      <EahPageRenderer data={data} businesses={businesses} />
      <EahAdSlot slotKey="home_mid" />
      <div className="studio-shortcut"><Link href="/studio">⚙️ استوديو التصميم</Link></div>
    </>
  )
}
