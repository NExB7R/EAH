'use client'
import { useEffect } from 'react'

export default function StreakMount() {
  useEffect(() => {
    // نأجل الطلب شوية عشان الصفحة تخلص تحميل
    const t = setTimeout(() => {
      fetch('/api/record-visit', { method: 'POST' }).catch(() => {})
    }, 2000)
    return () => clearTimeout(t)
  }, [])
  return null
}
