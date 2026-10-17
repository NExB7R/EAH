'use client'

import { useRef, useState } from 'react'
import { AlertIcon } from '@/components/icons'
import styles from './edit.module.css'

type Props = {
  category: 'logo' | 'cover'
  initialUrl: string | null
  label: string
  aspect: 'square' | 'wide'
}

export default function ImageUploader({ category, initialUrl, label, aspect }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', category)
      const res = await fetch('/api/merchant/upload-business-image', {
        method: 'POST',
        body: fd,
      })
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'فشل الرفع')
      } else if (data.url) {
        setUrl(data.url)
      }
    } catch {
      setError('فشل الاتصال')
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  return (
    <div className={styles.imageUploader}>
      <span className={styles.imageLabel}>{label}</span>
      <div
        className={`${styles.imageSlot} ${aspect === 'square' ? styles.imageSquare : styles.imageWide} ${url ? styles.imageHasUrl : ''}`}
        onClick={() => !pending && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className={styles.imagePreview} />
            {pending && <div className={styles.imageOverlay}>بيتحمّل…</div>}
          </>
        ) : pending ? (
          <div className={styles.imagePlaceholder}>بيتحمّل…</div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>اضغط لاختيار صورة</span>
            <small>JPG / PNG / WebP — حتى 5MB</small>
          </div>
        )}
      </div>
      {error && (
        <p className={styles.imageError}>
          <AlertIcon size={12} /> {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        className={styles.imageInput}
      />
    </div>
  )
}
