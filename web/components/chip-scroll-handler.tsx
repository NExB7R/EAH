'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// EAH — Chip Scroll Handler
// ينزل للقسم المطلوب بعد ظهوره، حتى لو وصل ضمن Server Components متأخرة.
// إذا لم يُعرض القسم بسبب إعدادات المزايا/قلة النتائج، يفتح صفحته المخصصة.
// ═══════════════════════════════════════════════════════════

type Props = {
  target?: string
}

const TARGET_FALLBACKS: Record<string, string> = {
  offers: '/offers',
  trending: '/trends',
  nearby: '/nearby',
  suggested: '/suggest',
}

export default function ChipScrollHandler({ target }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (!target) return

    let completed = false
    let observer: MutationObserver | undefined
    let timeout: number | undefined

    const stopWatching = () => {
      observer?.disconnect()
      observer = undefined
      if (timeout !== undefined) {
        window.clearTimeout(timeout)
        timeout = undefined
      }
    }

    const scrollWhenReady = () => {
      if (completed) return true

      const element = document.getElementById(target)
      if (!element) return false

      completed = true
      stopWatching()
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      element.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      return true
    }

    const frame = window.requestAnimationFrame(() => {
      if (scrollWhenReady()) return

      // HomeSections is streamed under Suspense; wait for its real target instead
      // of giving up after an arbitrary short delay.
      observer = new MutationObserver(() => {
        scrollWhenReady()
      })
      observer.observe(document.body, { childList: true, subtree: true })

      timeout = window.setTimeout(() => {
        if (scrollWhenReady()) return

        completed = true
        stopWatching()
        const fallback = TARGET_FALLBACKS[target]
        if (fallback) router.replace(fallback)
      }, 5000)
    })

    return () => {
      completed = true
      window.cancelAnimationFrame(frame)
      stopWatching()
    }
  }, [router, target])

  return null
}
