'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { CloseIcon, CheckCircleIcon } from '@/components/icons'
import { cropImageToBlob } from '@/lib/profile/crop-image'
import styles from './avatar-crop-modal.module.css'

type Props = {
  imageSrc: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
  busy?: boolean
}

export function AvatarCropModal({ imageSrc, onConfirm, onCancel, busy = false }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onComplete = useCallback((_a: Area, aPx: Area) => setArea(aPx), [])

  const handleConfirm = async () => {
    if (!area || busy || processing) return
    setProcessing(true)
    setError(null)
    try {
      const blob = await cropImageToBlob(imageSrc, area, 512, 0.9)
      onConfirm(blob)
    } catch {
      setError('فشل معالجة الصورة')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="قص الصورة">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.closeBtn}
            aria-label="إغلاق"
            disabled={busy || processing}
          >
            <CloseIcon size={18} />
          </button>
          <h2 className={styles.title}>اضبط الصورة</h2>
          <span className={styles.spacer} />
        </header>
        <div className={styles.cropArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>
        <div className={styles.controls}>
          <label className={styles.sliderLabel}>
            <span>تكبير</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.slider}
              aria-label="تكبير الصورة"
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.secondaryBtn}
              disabled={busy || processing}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={styles.primaryBtn}
              disabled={busy || processing || !area}
            >
              <CheckCircleIcon size={16} />
              <span>{processing ? 'جاري المعالجة…' : busy ? 'جاري الرفع…' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
