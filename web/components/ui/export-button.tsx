'use client'

import { useState } from 'react'
import { FileTextIcon } from '@/components/icons'
import styles from './export-button.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Export CSV Button
// يحترم الفلتر الحالي (status + q من URL)
// ═══════════════════════════════════════════════════════════

type Props = {
  type: 'businesses' | 'users' | 'subscriptions' | 'featured' | 'ads' | 'audit'
  label?: string
}

export default function ExportButton({ type, label = 'تصدير CSV' }: Props) {
  const [pending, setPending] = useState(false)

  const handleClick = () => {
    setPending(true)
    const sp = new URLSearchParams(window.location.search)
    const params = new URLSearchParams({ type })
    const status = sp.get('status') ?? sp.get('filter') ?? ''
    const q = sp.get('q') ?? ''
    if (status && status !== 'all') params.set('status', status)
    if (q) params.set('q', q)

    // استخدام <a> لتحميل الملف (مش navigation داخلي)
    const a = document.createElement('a')
    a.href = `/api/admin/export?${params.toString()}`
    a.download = ''
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => setPending(false), 1200)
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className={styles.btn}>
      <FileTextIcon size={14} />
      <span>{pending ? 'جاري…' : label}</span>
    </button>
  )
}
