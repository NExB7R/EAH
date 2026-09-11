'use client'

import { Puck } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { useEffect, useMemo, useState } from 'react'
import { createEahPuckConfig, defaultEahPageData, type EahBusiness, type EahPageData } from '@/components/eah-page-builder'

const STORAGE_KEY = 'eah:page-design:v1'

export default function EahStudio({ businesses }: { businesses: EahBusiness[] }) {
  const [data, setData] = useState<EahPageData>(defaultEahPageData)
  const config = useMemo(() => createEahPuckConfig(businesses), [businesses])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setData(JSON.parse(stored) as EahPageData)
    } catch {
      // Ignore malformed local editor data and fall back to defaults.
    }
  }, [])

  return (
    <div className="eah-studio-shell">
      <Puck
        config={config}
        data={data}
        headerTitle="EAH Design Studio"
        headerPath="/"
        viewports={[
          { width: 390, label: 'موبايل' },
          { width: 768, label: 'تابلت' },
          { width: 1280, label: 'شاشة' },
        ]}
        onChange={(next) => setData(next as EahPageData)}
        onPublish={async (next) => {
          const payload = next as EahPageData
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
          window.dispatchEvent(new CustomEvent('eah:design-published'))
        }}
      />
    </div>
  )
}
