'use client'

import { Puck } from '@puckeditor/core'
import { useEffect, useMemo, useState } from 'react'
import { createEahPuckConfig, defaultEahPageData, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro'

const STORAGE_KEY = 'eah:studio:design:v2'

export default function EahStudioPro({ businesses }: { businesses: EahBusiness[] }) {
  const [data, setData] = useState<EahPageData>(defaultEahPageData)
  const config = useMemo(() => createEahPuckConfig(businesses), [businesses])
  const theme = { ...(defaultEahPageData.root?.props || {}), ...(data.root?.props || {}) } as Record<string, string | number | boolean>

  useEffect(() => {
    let active = true
    void fetch('/api/studio/design', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        const next = payload?.data || (() => {
          try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
        })()
        if (active && next) setData(next as EahPageData)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return <div className="eah-studio-pro" dir="rtl" style={{
    ['--eah-bg' as string]: theme.background,
    ['--eah-surface' as string]: theme.surface,
    ['--accent' as string]: theme.accent,
    ['--accent-strong' as string]: theme.accentStrong,
    ['--text' as string]: theme.text,
    ['--muted' as string]: theme.muted,
    ['--eah-max' as string]: `${theme.maxWidth}px`,
    ['--eah-gap' as string]: `${theme.sectionGap}px`,
    ['--radius' as string]: `${theme.radius}px`,
  } as React.CSSProperties}>
    <Puck
      config={config}
      data={data as any}
      headerTitle="EAH Design Studio"
      headerPath="/"
      permissions={{ delete: true, drag: true, duplicate: true, edit: true, insert: true }}
      ui={{ leftSideBarVisible: true, rightSideBarVisible: true }}
      viewports={[
        { width: 390, label: 'موبايل' },
        { width: 768, label: 'تابلت' },
        { width: 1280, label: 'شاشة' },
        { width: 1536, label: 'واسع' },
      ]}
      dictionary={{
        'header-publish': 'حفظ التغييرات',
        'header-publish-changes': 'حفظ ونشر محلي',
      }}
      onChange={(next) => setData(next as EahPageData)}
      onPublish={async (next) => {
        const payload = next as EahPageData
        setData(payload)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        window.dispatchEvent(new CustomEvent('eah:design-published'))
        await fetch('/api/studio/design', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      }}
    />
  </div>
}
