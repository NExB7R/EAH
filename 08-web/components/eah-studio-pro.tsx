'use client'

import { Puck } from '@puckeditor/core'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { createEahPuckConfig, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro2'

export default function EahStudioPro({ businesses, initialData }: { businesses: EahBusiness[]; initialData: EahPageData }) {
  const [data, setData] = useState<EahPageData>(initialData)
  const config = useMemo(() => createEahPuckConfig(businesses), [businesses])
  const theme = { ...(initialData.root?.props || {}), ...(data.root?.props || {}) } as Record<string, string | number | boolean>

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
  } as CSSProperties}>
    <Puck
      config={config}
      data={data as any}
      headerTitle="EAH Design Studio Pro"
      headerPath="/"
      permissions={{ delete: true, drag: true, duplicate: true, edit: true, insert: true }}
      ui={{ leftSideBarVisible: true, rightSideBarVisible: true }}
      viewports={[
        { width: 390, label: 'موبايل' },
        { width: 768, label: 'تابلت' },
        { width: 1280, label: 'شاشة' },
        { width: 1536, label: 'واسع' },
      ]}
      dnd={{ behavior: 'auto' }}
      dictionary={{
        'header-publish': 'حفظ التغييرات',
        'header-publish-changes': 'حفظ ونشر محلي',
        'viewport-switch': 'حجم العرض: {label}',
      }}
      onChange={(next) => setData(next as EahPageData)}
      onPublish={async (next) => {
        const payload = next as EahPageData
        setData(payload)
        const response = await fetch('/api/studio/design', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('تعذر حفظ التصميم')
        window.dispatchEvent(new CustomEvent('eah:design-published'))
      }}
    />
  </div>
}
