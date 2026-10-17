'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, CloseIcon } from '@/components/icons'
import { COMMANDS, type Command } from '@/lib/command-palette/commands'
import styles from './command-palette.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Command Palette (⌘K / Ctrl+K)
// ═══════════════════════════════════════════════════════════

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isMacOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) {
          setOpen(false)
        } else {
          setQuery('')
          setSelected(0)
          setOpen(true)
        }
        return
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 20)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q)),
    )
  }, [query])

  const run = (cmd: Command) => {
    setOpen(false)
    if (cmd.href.startsWith('/api/')) {
      const a = document.createElement('a')
      a.href = cmd.href
      a.download = ''
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      router.push(cmd.href)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (s + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (s - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && filtered[selected]) {
      e.preventDefault()
      run(filtered[selected])
    }
  }

  if (!open) return null

  const shortcutLabel = isMacOS ? '⌘K' : 'Ctrl+K'

  return (
    <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="الأوامر السريعة"
      >
        <div className={styles.inputWrap}>
          <SearchIcon size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="ابحث عن صفحة أو إجراء..."
            className={styles.input}
            dir="rtl"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={styles.closeBtn}
            aria-label="إغلاق"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div className={styles.results}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>مفيش نتائج</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => run(cmd)}
                onMouseEnter={() => setSelected(i)}
                className={`${styles.item} ${i === selected ? styles.itemActive : ''}`}
                dir="rtl"
              >
                <span className={styles.itemIcon}>
                  <cmd.icon size={16} />
                </span>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>{cmd.label}</span>
                  <span className={styles.itemDesc}>{cmd.description}</span>
                </div>
                <span className={styles.itemGroup}>
                  {cmd.group === 'navigation' ? 'انتقال' : 'إجراء'}
                </span>
              </button>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span>
            <kbd className={styles.kbd}>↑↓</kbd> تنقّل
          </span>
          <span>
            <kbd className={styles.kbd}>Enter</kbd> اختيار
          </span>
          <span>
            <kbd className={styles.kbd}>{shortcutLabel}</kbd> فتح
          </span>
          <span>
            <kbd className={styles.kbd}>ESC</kbd> إغلاق
          </span>
        </div>
      </div>
    </div>
  )
}
