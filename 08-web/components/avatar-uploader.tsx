'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './avatar-uploader.css'
import { IcTrash } from '@/components/eah-icons'

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
  const fileRef = useRef<HTMLInputElement>(null)

  // Presets (نفس اللي في profile-presets)
  const PRESETS = [
    { key: 'av1', from: '#8B5CF6', to: '#EC4899' }, { key: 'av2', from: '#F59E0B', to: '#DC2626' },
    { key: 'av3', from: '#06B6D4', to: '#8B5CF6' }, { key: 'av4', from: '#A855F7', to: '#06B6D4' },
    { key: 'av5', from: '#EC4899', to: '#F59E0B' }, { key: 'av6', from: '#6366F1', to: '#A855F7' },
    { key: 'av7', from: '#F97316', to: '#EF4444' }, { key: 'av8', from: '#14B8A6', to: '#84CC16' },
    { key: 'av9', from: '#A855F7', to: '#3B82F6' }, { key: 'av10', from: '#EAB308', to: '#F97316' },
    { key: 'av11', from: '#EF4444', to: '#EC4899' }, { key: 'av12', from: '#0EA5E9', to: '#6366F1' },
  ]

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')

    if (file.size > 2 * 1024 * 1024) { setErr('الحجم أكبر من 2MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setErr('النوع غير مدعوم — JPEG/PNG/WebP فقط'); return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`

      const { error } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type,
      })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setUrl(publicUrl)
      setKey(null)
    } catch (e: any) {
      setErr(e.message || 'فشل الرفع')
    } finally {
      setUploading(false)
    }
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

  return (
    <div className="avup">
      {/* Preview */}
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
          <button type="button" className="avup__clear" onClick={clearUpload}><IcTrash /> امسح الصورة
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="avup__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab==='preset'}
          className={`avup__tab ${tab==='preset'?'is-active':''}`}
          onClick={() => setTab('preset')}>🎨 ألوان</button>
        <button type="button" role="tab" aria-selected={tab==='upload'}
          className={`avup__tab ${tab==='upload'?'is-active':''}`}
          onClick={() => setTab('upload')}>📷 رفع</button>
        <button type="button" role="tab" aria-selected={tab==='link'}
          className={`avup__tab ${tab==='link'?'is-active':''}`}
          onClick={() => setTab('link')}>🔗 لينك</button>
      </div>

      {/* Presets */}
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

      {/* Upload */}
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
            {uploading ? '⏳ جاري الرفع...' : '📤 اختار صورة من جهازك'}
          </label>
          <span className="avup__hint">JPEG / PNG / WebP · 2MB كحد أقصى</span>
        </div>
      )}

      {/* Link */}
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

      {/* Hidden inputs للـ form */}
      <input type="hidden" name="avatar_key" value={key ?? ''} />
      <input type="hidden" name="avatar_url" value={url ?? ''} />
    </div>
  )
}
