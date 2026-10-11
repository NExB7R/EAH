'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'eah-theme'

function getStored(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
}

function resolveTheme(t: Theme): ResolvedTheme {
  if (t !== 'system') return t
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: light)')
  mq.addEventListener('change', cb)
  window.addEventListener('storage', cb)
  window.addEventListener('eah:theme', cb)
  return () => {
    mq.removeEventListener('change', cb)
    window.removeEventListener('storage', cb)
    window.removeEventListener('eah:theme', cb)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return 'dark:system'
  const t = getStored()
  const r = resolveTheme(t)
  return `${r}:${t}`
}

function getServerSnapshot(): string {
  return 'dark:system'
}

type Ctx = {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (t: Theme) => void
}

const ThemeCtx = createContext<Ctx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [resolved, theme] = snapshot.split(':') as [ResolvedTheme, Theme]

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    const r = resolveTheme(t)
    document.documentElement.setAttribute('data-theme', r)
    window.dispatchEvent(new Event('eah:theme'))
  }, [])

  return <ThemeCtx.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme outside ThemeProvider')
  return ctx
}
