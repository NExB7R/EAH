'use client'

import { useEffect } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Chip Scroll Handler
// ينزل للقسم المطلوب عند وجود ?scroll=<target>
// ═══════════════════════════════════════════════════════════

type Props = {
  target?: string
}

export default function ChipScrollHandler({ target }: Props) {
  useEffect(() => {
    if (!target) return

    const el = document.getElementById(target)
    if (!el) return

    // استنى render يخلص
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)

    return () => clearTimeout(timer)
  }, [target])

  return null
}
