'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/avatar'
import type { AppRole } from '@/lib/data/user'
import { readFileAsDataURL } from '@/lib/profile/crop-image'
import { AvatarCropModal } from './avatar-crop-modal'
import styles from './avatar-uploader.module.css'

type Props = {
  displayName: string
  avatarUrl: string | null
  role: AppRole
  isVerified?: boolean
  isPaidMember?: boolean
  onSuccess?: (newUrl: string | null) => void
  compact?: boolean
}

export function AvatarUploader({
  displayName,
  avatarUrl,
  role,
  isVerified = false,
  isPaidMember = false,
  onSuccess,
  compact = false,
}: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const busy = uploading || deleting

  const handleFilePick = async (file: File | null | undefined) => {
    setError(null)
    setMsg(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('الملف مش صورة')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('حجم الصورة أكبر من 3 ميجا')
      return
    }
    try {
      const dataUrl = await readFileAsDataURL(file)
      setPendingSrc(dataUrl)
    } catch {
      setError('تعذر قراءة الملف')
    }
  }

  const handleCropConfirm = async (blob: Blob) => {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'فشل الرفع')
        return
      }
      setCurrentUrl(data.url)
      setPendingSrc(null)
      setMsg('تم حفظ الصورة ✓')
      onSuccess?.(data.url)
      router.refresh()
      setTimeout(() => setMsg(null), 2500)
    } catch {
      setError('فشل الاتصال')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUrl) return
    if (!window.confirm('هل تريد حذف الصورة؟')) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/upload/avatar', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'فشل الحذف')
        return
      }
      setCurrentUrl(null)
      setMsg('تم حذف الصورة')
      onSuccess?.(null)
      router.refresh()
      setTimeout(() => setMsg(null), 2500)
    } catch {
      setError('فشل الاتصال')
    } finally {
      setDeleting(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFilePick(e.dataTransfer.files?.[0])
  }

  const openPicker = () => {
    if (!busy) fileRef.current?.click()
  }

  return (
    <div className={styles.wrap}>
      {!compact && (
        <div
          className={styles.dropZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={openPicker}
          role="button"
          tabIndex={0}
          aria-label="رفع صورة"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileRef.current?.click()
            }
          }}
        >
          <div className={styles.avatarHolder}>
            <Avatar
              displayName={displayName}
              avatarUrl={currentUrl}
              role={role}
              isVerified={isVerified}
              isPaidMember={isPaidMember}
              size="lg"
            />
            {busy && <div className={styles.overlay} aria-hidden />}
          </div>
          <div className={styles.textBlock}>
            <p className={styles.primary}>{currentUrl ? 'تغيير الصورة' : 'إضافة صورة'}</p>
            <p className={styles.secondary}>
              اسحب وأفلت أو اضغط للاختيار • JPEG/PNG • أقل من 3 ميجا
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          handleFilePick(e.target.files?.[0])
          if (fileRef.current) fileRef.current.value = ''
        }}
        className={styles.hidden}
        aria-hidden
        tabIndex={-1}
      />

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryBtn} onClick={openPicker} disabled={busy}>
          {currentUrl ? 'استبدال' : 'اختيار'}
        </button>
        {currentUrl && (
          <button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={busy}>
            {deleting ? 'بيحذف…' : 'حذف'}
          </button>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {msg && (
        <p className={styles.success} role="status">
          {msg}
        </p>
      )}

      {pendingSrc && (
        <AvatarCropModal
          imageSrc={pendingSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setPendingSrc(null)}
          busy={uploading}
        />
      )}
    </div>
  )
}
