'use client'

import { useSyncExternalStore } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Online Status Hook (2026)
// useSyncExternalStore — React idiomatic، صفر cascading renders
// ═══════════════════════════════════════════════════════════

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot(): boolean {
  return navigator.onLine
}

function getServerSnapshot(): boolean {
  return true
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
