'use client'
import { useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import './avatar-cropper.css'

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = imageSrc
  await new Promise<void>((r) => { image.onload = () => r() })
  const canvas = document.createElement('canvas')
  const size = Math.min(pixelCrop.width, pixelCrop.height, 1024)
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, size, size
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('crop failed'))),
      'image/jpeg',
      0.92
    )
  })
}

export default function AvatarCropper({
  src, onCancel, onSave,
}: {
  src: string
  onCancel: () => void
  onSave: (blob: Blob) => void | Promise<void>
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!area) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(src, area)
      await onSave(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="avcrop">
      <div className="avcrop__viewport">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, a) => setArea(a)}
        />
      </div>

      <div className="avcrop__controls">
        <span className="avcrop__zoom-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </span>
        <input
          type="range" min={1} max={3} step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="avcrop__slider"
          aria-label="تكبير"
        />
      </div>

      <div className="avcrop__actions">
        <button type="button" onClick={onCancel} className="avcrop__btn avcrop__btn--ghost" disabled={saving}>
          إلغاء
        </button>
        <button type="button" onClick={handleSave} className="avcrop__btn avcrop__btn--primary" disabled={saving || !area}>
          {saving ? '...' : 'قص واحفظ'}
        </button>
      </div>
    </div>
  )
}
