'use client'
import { useState, useRef, useCallback } from 'react'

type UploadedImage = {
  url: string
  path: string
  bucket: string
}

type Props = {
  bucket: 'business-media' | 'business-menu' | 'business-offers'
  folder: string
  multiple?: boolean
  initial?: string[]
  name?: string
  label?: string
  hint?: string
}

export default function ImageUploader({
  bucket,
  folder,
  multiple = false,
  initial = [],
  name = 'images_json',
  label = 'الصور',
  hint,
}: Props) {
  const [images, setImages] = useState<UploadedImage[]>(
    initial.map((url) => ({ url, path: '', bucket }))
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
          uploaded.push({ url: json.url, path: json.path, bucket: json.bucket })
        }

        setImages((prev) => {
          const next = multiple ? [...prev, ...uploaded] : uploaded.slice(-1)
          return next
        })
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

  const hiddenValue = JSON.stringify(images.map((i) => i.url))

  return (
    <div className="img-uploader">
      <input type="hidden" name={name} value={hiddenValue} />

      {label && (
        <div className="img-uploader__head">
          <span className="img-uploader__label">{label}</span>
          {hint && <span className="img-uploader__hint">{hint}</span>}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`img-uploader__drop ${dragOver ? 'is-drag' : ''} ${uploading ? 'is-uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleInput}
          style={{ display: 'none' }}
        />
        <span className="img-uploader__icon">{uploading ? '⏳' : '📷'}</span>
        <span className="img-uploader__text">
          {uploading ? 'جاري الرفع...' : 'اضغط أو اسحب صورة هنا'}
        </span>
        <span className="img-uploader__meta">JPG/PNG/WebP · بحد أقصى 5MB</span>
      </div>

      {error && <div className="img-uploader__error">{error}</div>}

      {/* Previews */}
      {images.length > 0 && (
        <div className="img-uploader__grid">
          {images.map((img, i) => (
            <div key={`${img.url}-${i}`} className="img-uploader__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`صورة ${i + 1}`} loading="lazy" />
              <div className="img-uploader__overlay">
                <div className="img-uploader__btns">
                  {multiple && i > 0 && (
                    <button
                      type="button"
                      className="img-uploader__btn"
                      onClick={() => moveImage(i, -1)}
                      aria-label="يمين"
                    >
                      ←
                    </button>
                  )}
                  {multiple && i < images.length - 1 && (
                    <button
                      type="button"
                      className="img-uploader__btn"
                      onClick={() => moveImage(i, 1)}
                      aria-label="شمال"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    className="img-uploader__btn img-uploader__btn--danger"
                    onClick={() => removeImage(i)}
                    aria-label="حذف"
                  >
                    ×
                  </button>
                </div>
              </div>
              {i === 0 && multiple && (
                <span className="img-uploader__cover-badge">الغلاف</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
