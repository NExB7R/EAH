'use client'
import { useRef, useState } from 'react'
import './avatar-uploader.css'
import { IcCamera, IcLink, IcPalette, IcTrash } from '@/components/eah-icons'
import AvatarCropper from './avatar-cropper'

type Props = {
  userId: string
  initialUrl: string | null
  initialKey: string | null
}

export default function AvatarUploader({ userId, initialUrl, initialKey }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [key, setKey] = useState<string | null>(initialKey)
  const [tab, setTab] = useState<'preset' | 'upload' | 'link'>('preset')
  const [uploading, setUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [err, setErr] = useState('')
  const [cropping, setCropping] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const PRESETS = [
    { key: 'av1', from: '#8B5CF6', to: '#EC4899' }, { key: 'av2', from: '#F59E0B', to: '#DC2626' },
    { key: 'av3', from: '#06B6D4', to: '#8B5CF6' }, { key: 'av4', from: '#A855F7', to: '#06B6D4' },
    { key: 'av5', from: '#EC4899', to: '#F59E0B' }, { key: 'av6', from: '#6366F1', to: '#A855F7' },
    { key: 'av7', from: '#F97316', to: '#EF4444' }, { key: 'av8', from: '#14B8A6', to: '#84CC16' },
    { key: 'av9', from: '#A855F7', to: '#3B82F6' }, { key: 'av10', from: '#EAB308', to: '#F97316' },
    { key: 'av11', from: '#EF4444', to: '#EC4899' }, { key: 'av12', from: '#0EA5E9', to: '#6366F1' },
  ]

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')
    if (file.size > 10 * 1024 * 1024) { setErr('الحجم أكبر من 10MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setErr('النوع غير مدعوم — JPEG/PNG/WebP فقط'); return
    }
    const objectUrl = URL.createObjectURL(file)
    setCropping(objectUrl)
  }

  async function handleCropSave(blob: Blob) {
    setUploading(true)
    setErr('')
    try {
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', `avatars/${userId}`)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'فشل الرفع')
      setUrl(json.url)
      setKey(null)
      if (cropping) URL.revokeObjectURL(cropping)
      setCropping(null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  function cancelCrop() {
    if (cropping) URL.revokeObjectURL(cropping)
    setCropping(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function applyLink() {
    setErr('')
    if (!/^https?:\/\/.+/.test(linkInput)) { setErr('لينك غير صحيح'); return }
    setUrl(linkInput)
    setKey(null)
  }

  function clearUpload() {
    setUrl(null)
    setLinkInput('')
    if (fileRef.current) fileRef.current.value = ''
  }

  // وضع القص
  if (cropping) {
    return (
      <div className="avup">
        <AvatarCropper
          src={cropping}
          onCancel={cancelCrop}
          onSave={handleCropSave}
        />
        {err && <p className="avup__err">{err}</p>}
      </div>
    )
  }

  return (
    <div className="avup">
      <div className="avup__preview">
        <div className="avup__preview-circle">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="preview" />
          ) : (
            <span
              className="avup__preview-gradient"
              style={{
                background: (() => {
                  const p = PRESETS.find(x => x.key === key) ?? PRESETS[0]
                  return `linear-gradient(135deg, ${p.from}, ${p.to})`
                })()
              }}
            />
          )}
        </div>
        {url && (
          <button type="button" className="avup__clear" onClick={clearUpload}>
            <IcTrash /> امسح الصورة
          </button>
        )}
      </div>

      <div className="avup__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab==='preset'}
          className={`avup__tab ${tab==='preset'?'is-active':''}`}
          onClick={() => setTab('preset')}><IcPalette /> ألوان</button>
        <button type="button" role="tab" aria-selected={tab==='upload'}
          className={`avup__tab ${tab==='upload'?'is-active':''}`}
          onClick={() => setTab('upload')}><IcCamera /> رفع</button>
        <button type="button" role="tab" aria-selected={tab==='link'}
          className={`avup__tab ${tab==='link'?'is-active':''}`}
          onClick={() => setTab('link')}><IcLink /> لينك</button>
      </div>

      {tab === 'preset' && (
        <div className="avup__presets">
          {PRESETS.map(p => (
            <button
              key={p.key}
              type="button"
              className={`avup__preset ${key===p.key && !url ? 'is-active' : ''}`}
              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
              onClick={() => { setKey(p.key); clearUpload() }}
              aria-label={`لون ${p.key}`}
            />
          ))}
        </div>
      )}

      {tab === 'upload' && (
        <div className="avup__upload">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="avup__file"
            id="avatar-file"
          />
          <label htmlFor="avatar-file" className="avup__file-label">
            {uploading ? '...' : 'اختار صورة من جهازك'}
          </label>
          <span className="avup__hint">JPEG / PNG / WebP · 10MB كحد أقصى</span>
        </div>
      )}

      {tab === 'link' && (
        <div className="avup__link">
          <input
            type="url"
            dir="ltr"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="avup__link-input"
          />
          <button type="button" onClick={applyLink} className="avup__link-btn">استخدم</button>
          <span className="avup__hint">من أي مكان (Imgur, Cloudinary, إلخ)</span>
        </div>
      )}

      {err && <p className="avup__err">{err}</p>}

      <input type="hidden" name="avatar_key" value={key ?? ''} />
      <input type="hidden" name="avatar_url" value={url ?? ''} />
    </div>
  )
}
