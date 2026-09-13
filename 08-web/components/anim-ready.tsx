'use client'
import { useEffect } from 'react'

/**
 * يضيف .eah-anim-ready على <html> بعد أول paint
 * عشان CSS animations تشتغل بس لما الصفحة تحمّل
 * (يتفادى flicker أثناء SSR)
 */
export default function AnimReady() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.add('eah-anim-ready')
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return null
}
