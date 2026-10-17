'use client'

import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Draft persistence (localStorage, TTL 7d, versioned)
// ═══════════════════════════════════════════════════════════

const TTL_MS = 7 * 24 * 60 * 60 * 1000

type Stored<T> = { v: number; savedAt: number; data: T }

function readDraft<T>(key: string, version: number): Stored<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Stored<T>
    if (parsed.v !== version) {
      localStorage.removeItem(key)
      return null
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    return null
  }
}

export function useDraft<T>(key: string, version: number, initial: T) {
  const [data, setData] = useState<T>(() => {
    const stored = readDraft<T>(key, version)
    return stored ? stored.data : initial
  })
  const [hasDraft, setHasDraft] = useState<boolean>(() => readDraft<T>(key, version) !== null)
  const [savedAt, setSavedAt] = useState<number | null>(
    () => readDraft<T>(key, version)?.savedAt ?? null,
  )
  const restored = useRef(true)

  // حفظ debounced (effect يكتب فقط — لا setState متزامن)
  useEffect(() => {
    if (!restored.current) return
    const t = setTimeout(() => {
      try {
        const payload: Stored<T> = { v: version, savedAt: Date.now(), data }
        localStorage.setItem(key, JSON.stringify(payload))
        setSavedAt(Date.now())
      } catch {
        // localStorage ممتلئ أو غير متاح
      }
    }, 500)
    return () => clearTimeout(t)
  }, [key, version, data])

  const clear = () => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setHasDraft(false)
    setSavedAt(null)
  }

  return { data, setData, hasDraft, savedAt, clear }
}
