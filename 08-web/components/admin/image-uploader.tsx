'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import './image-uploader.css'

type UploadedImage = {
  url: string
  publicId?: string
}

type Props = {
  bucket: 'business-media' | 'business-menu' | 'business-offers'
  folder: string
  multiple?: boolean
  initial?: string[]
  name?: string
  label?: string
  hint?: string
  aspect?: 'square' | 'wide' | 'auto'
}

export default function ImageUploader({
  bucket,
  folder,
  multiple = false,
  initial = [],
  name = 'images_json',
  label,
  hint,
  aspect = 'square',
}: Props) {
  const [images, setImages] = useState<UploadedImage[]>(() =>
    initial.map((url) => ({ url }))
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  //  Sync مع initial لما يتغير من الـ server
  useEffect(() => {
    setImages(initial.map((url) => ({ url })))
  }, [initial.join('|')])  // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setError(null)
      setUploading(true)
      try {
        const uploaded: UploadedImage[] = []
        for (const file of files) {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('bucket', bucket)
          fd.append('folder', folder)
          const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
          const json = await res.json()
          if (!res.ok || !json.ok) {
            setError(json.error ?? 'فشل الرفع')
            continue
          }
          uploaded.push({ url: json.url, publicId: json.publicId })
        }
        setImages((prev) => (multiple ? [...prev, ...uploaded] : uploaded.slice(-1)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطأ غير متوقع')
      } finally {
        setUploading(false)
      }
    },
    [bucket, folder, multiple]
  )

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) uploadFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) uploadFiles(files)
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  //  Controlled hidden input — value من state
  const hiddenValue = JSON.stringify(images.map((i) => i.url))

  return (
    <div className="iup">
      <input type="hidden" name={name} value={hiddenValue} readOnly />

      {label && (
        <div className="iup__head">
          <span className="iup__label">{label}</span>
          {hint && <span className="iup__hint">{hint}</span>}
        </div>
      )}

      <button
        type="button"
        className={`iup__drop ${dragOver ? 'is-drag' : ''} ${uploading ? 'is-uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleInput}
          hidden
        />

        <span className="iup__drop-icon" aria-hidden>
          {uploading ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </span>

        <span className="iup__drop-text">
          {uploading ? 'جاري الرفع...' : multiple ? 'اضغط لاختيار صور' : 'اضغط لاختيار صورة'}
        </span>
        <span className="iup__drop-sub">أو اسحبها وأفلتها هنا</span>
      </button>

      {error && <div className="iup__error">{error}</div>}

      {images.length > 0 && (
        <div className={`iup__grid iup__grid--${aspect}`}>
          {images.map((img, i) => (
            <div key={`${img.url}-${i}`} className="iup__item">
              <div
                className="iup__thumb"
                style={{ backgroundImage: `url(${img.url})` }}
                role="img"
                aria-label={`صورة ${i + 1}`}
              />
              <div className="iup__overlay">
                <div className="iup__actions">
                  {multiple && i > 0 && (
                    <button type="button" className="iup__act" onClick={() => moveImage(i, -1)} aria-label="يمين">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                  )}
                  {multiple && i < images.length - 1 && (
                    <button type="button" className="iup__act" onClick={() => moveImage(i, 1)} aria-label="شمال">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                  )}
                  <button type="button" className="iup__act iup__act--danger" onClick={() => removeImage(i)} aria-label="حذف">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {multiple && i === 0 && <span className="iup__cover">الغلاف</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
