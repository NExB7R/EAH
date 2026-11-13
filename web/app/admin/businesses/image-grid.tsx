'use client'

import { useRef, useState } from 'react'
import { AlertIcon, CloseIcon, PlusIcon } from '@/components/icons'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Image Grid (multi — menu/gallery)
// Each item tracked with mediaId. Add via file or URL.
// ═══════════════════════════════════════════════════════════

export type GridItem = { id: string; url: string }

type Props = {
  businessId: string
  category: 'menu' | 'gallery'
  initialItems: GridItem[]
  label: string
  aspect?: 'video' | 'square'
}

export default function ImageGrid({
  businessId,
  category,
  initialItems,
  label,
  aspect = 'square',
}: Props) {
  const [items, setItems] = useState<GridItem[]>(initialItems)
  const [mode, setMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const cameraRef = useRef<HTMLInputElement | null>(null)

  const add = (newItem: GridItem) => setItems((prev) => [...prev, newItem])

  const remove = async (item: GridItem) => {
    if (pending) return
    setError(null)
    setPending(true)
    try {
      const params = new URLSearchParams({
        businessId,
        category,
        url: item.url,
      })
      const res = await fetch(`/api/admin/upload-business-image?${params.toString()}`, {
        method: 'DELETE',
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'فشل الحذف')
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      setError('فشل الحذف')
    } finally {
      setPending(false)
    }
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return
    setError(null)
    setPending(true)
    let failed = 0
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('category', category)
        fd.append('businessId', businessId)
        const res = await fetch('/api/admin/upload-business-image', { method: 'POST', body: fd })
        const json = (await res.json()) as {
          ok?: boolean
          url?: string
          mediaId?: string
          error?: string
        }
        if (!res.ok || !json.url || !json.mediaId) {
          failed++
        } else {
          add({ id: json.mediaId, url: json.url })
        }
      } catch {
        failed++
      }
    }
    if (failed > 0) {
      setError(failed === files.length ? 'فشل رفع الصور' : `فشل رفع ${failed} من ${files.length}`)
    }
    setPending(false)
  }

  const handleUrl = async () => {
    const u = urlInput.trim()
    if (!u) return
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      fd.append('url', u)
      fd.append('category', category)
      fd.append('businessId', businessId)
      const res = await fetch('/api/admin/upload-business-image', { method: 'POST', body: fd })
      const json = (await res.json()) as {
        ok?: boolean
        url?: string
        mediaId?: string
        error?: string
      }
      if (!res.ok || !json.url || !json.mediaId) {
        setError(json.error ?? 'فشل الحفظ')
      } else {
        add({ id: json.mediaId, url: json.url })
        setUrlInput('')
        setMode('file')
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={styles.imageGrid}>
      <div className={styles.imageSlotHead}>
        <span className={styles.label}>
          {label} ({items.length})
        </span>
        <div className={styles.imageSlotTabs}>
          <button
            type="button"
            className={mode === 'file' ? styles.imageSlotTabActive : styles.imageSlotTab}
            onClick={() => setMode('file')}
          >
            رفع ملف
          </button>
          <button
            type="button"
            className={mode === 'url' ? styles.imageSlotTabActive : styles.imageSlotTab}
            onClick={() => setMode('url')}
          >
            رابط
          </button>
        </div>
      </div>

      <div className={styles.imageGridItems}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.imageGridItem} ${aspect === 'square' ? styles.imageGridItemSquare : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" />
            <button
              type="button"
              className={styles.imageGridRemove}
              onClick={() => void remove(item)}
              disabled={pending}
              aria-label="حذف"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        ))}

        {mode === 'file' ? (
          <button
            type="button"
            className={`${styles.imageGridItem} ${styles.imageGridAdd}`}
            onClick={() => inputRef.current?.click()}
            disabled={pending}
          >
            <PlusIcon size={20} />
            <span>{pending ? '...' : 'إضافة'}</span>
          </button>
        ) : (
          <div className={styles.imageGridUrlRow}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className={styles.input}
              disabled={pending}
            />
            <button
              type="button"
              onClick={handleUrl}
              disabled={pending || !urlInput.trim()}
              className={styles.saveBtn}
            >
              {pending ? '...' : 'حفظ'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <span className={styles.errText}>
          <AlertIcon size={12} /> {error}
        </span>
      )}

      {mode === 'file' && (
        <div className={styles.imageSourceBtns}>
          <button
            type="button"
            className={styles.imageSourceBtn}
            onClick={pending ? undefined : () => cameraRef.current?.click()}
            disabled={pending}
          >
            📷 كاميرا
          </button>
          <button
            type="button"
            className={styles.imageSourceBtn}
            onClick={pending ? undefined : () => inputRef.current?.click()}
            disabled={pending}
          >
            📁 معرض (متعدد)
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) void handleFiles(files)
          e.target.value = ''
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFiles([file])
          e.target.value = ''
        }}
      />
    </div>
  )
}
