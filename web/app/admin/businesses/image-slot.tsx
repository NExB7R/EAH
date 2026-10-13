'use client'

import { useRef, useState } from 'react'
import { AlertIcon } from '@/components/icons'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Image Slot (upload + preview + delete)
// ═══════════════════════════════════════════════════════════

type Props = {
  businessId: string
  category: 'logo' | 'cover' | 'gallery'
  initialUrl: string | null
  label: string
  aspect?: 'video' | 'square'
  onChange?: (url: string | null) => void
}

export default function ImageSlot({
  businessId,
  category,
  initialUrl,
  label,
  aspect = 'video',
  onChange,
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', category)
      fd.append('businessId', businessId)
      const res = await fetch('/api/admin/upload-business-image', { method: 'POST', body: fd })
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string }
      if (!res.ok || !json.url) {
        setError(json.error ?? 'فشل الرفع')
      } else {
        setUrl(json.url)
        onChange?.(json.url)
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setPending(false)
    }
  }

  const handleRemove = () => {
    setUrl(null)
    onChange?.(null)
  }

  return (
    <div className={styles.imageSlot}>
      <span className={styles.label}>{label}</span>
      <div
        className={`${styles.imageBox} ${aspect === 'square' ? styles.imageBoxSquare : ''}`}
        onClick={pending ? undefined : handlePick}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} />
        ) : (
          <>
            <span className={styles.imageBoxText}>اضغط للاختيار</span>
            <span className={styles.hint}>JPG / PNG / WebP — حتى 5MB</span>
          </>
        )}
        {pending && (
          <div className={styles.uploadProgress}>
            <span>جاري الرفع…</span>
          </div>
        )}
      </div>

      {url && (
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={handleRemove}
          disabled={pending}
        >
          حذف الصورة
        </button>
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
