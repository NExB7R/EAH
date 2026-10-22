'use client'

import { useRef, useState } from 'react'
import { AlertIcon } from '@/components/icons'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Image Slot (single — logo/cover)
// Supports file upload + URL paste + mediaId tracking.
// ═══════════════════════════════════════════════════════════

type Props = {
  businessId: string
  category: 'logo' | 'cover'
  initialUrl: string | null
  initialMediaId?: string | null
  label: string
  aspect?: 'video' | 'square'
  onChange?: (url: string | null) => void
}

export default function ImageSlot({
  businessId,
  category,
  initialUrl,
  initialMediaId = null,
  label,
  aspect = 'video',
  onChange,
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [mediaId, setMediaId] = useState<string | null>(initialMediaId)
  const [mode, setMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const apply = (newUrl: string, newMediaId: string) => {
    setUrl(newUrl)
    setMediaId(newMediaId)
    onChange?.(newUrl)
  }

  const handleFile = async (file: File) => {
    setError(null)
    setPending(true)
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
        setError(json.error ?? 'فشل الرفع')
      } else {
        apply(json.url, json.mediaId)
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setPending(false)
    }
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
        apply(json.url, json.mediaId)
        setUrlInput('')
        setMode('file')
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setPending(false)
    }
  }

  const handleRemove = async () => {
    setError(null)
    setPending(true)
    try {
      const params = new URLSearchParams({ businessId, category })
      const res = await fetch(`/api/admin/upload-business-image?${params.toString()}`, {
        method: 'DELETE',
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'فشل حذف الصورة')
        return
      }
      setUrl(null)
      setMediaId(null)
      onChange?.(null)
    } catch {
      setError('فشل الاتصال أثناء حذف الصورة')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={styles.imageSlot}>
      <div className={styles.imageSlotHead}>
        <span className={styles.label}>{label}</span>
        {!url && (
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
        )}
      </div>

      {url ? (
        <>
          <div className={`${styles.imageBox} ${aspect === 'square' ? styles.imageBoxSquare : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} />
          </div>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={handleRemove}
            disabled={pending}
          >
            حذف الصورة
          </button>
        </>
      ) : mode === 'file' ? (
        <div
          className={`${styles.imageBox} ${aspect === 'square' ? styles.imageBoxSquare : ''}`}
          onClick={pending ? undefined : () => inputRef.current?.click()}
        >
          <span className={styles.imageBoxText}>اضغط للاختيار</span>
          <span className={styles.hint}>JPG / PNG / WebP — حتى 5MB</span>
          {pending && (
            <div className={styles.uploadProgress}>
              <span>جاري الرفع…</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.imageUrlRow}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className={styles.input}
            placeholder="https://example.com/image.jpg"
            dir="ltr"
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

      {error && (
        <span className={styles.errText}>
          <AlertIcon size={12} /> {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
