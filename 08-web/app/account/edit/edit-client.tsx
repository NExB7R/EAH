'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { getAvatar } from '@/lib/profile-presets'
import EahLogo from '@/components/eah-logo'
import { IcEdit, IcCamera, IcUsers, IcChat, IcCheck, IcBan } from '@/components/eah-icons'

type Gender = 'male' | 'female' | null

type Initial = {
  name: string
  bio: string
  gender: Gender
  avatarUrl: string | null
  avatarKey: string | null
  isVerified: boolean
}

const AVATAR_KEYS = ['av1','av2','av3','av4','av5','av6','av7','av8','av9','av10','av11','av12']

export default function EditClient({ userId, initial }: { userId: string; initial: Initial }) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [bio, setBio] = useState(initial.bio)
  const [gender, setGender] = useState<Gender>(initial.gender)
  const [avatarKey, setAvatarKey] = useState<string | null>(initial.avatarKey)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'business-media')
      fd.append('folder', `avatars/${userId}`)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'فشل الرفع')
      setAvatarUrl(json.url)
      setAvatarKey(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  function applyAvatarUrl() {
    const url = avatarUrlInput.trim()
    if (!url) return
    if (!/^https?:\/\//.test(url)) {
      setError('الرابط لازم يبدأ بـ http:// أو https://')
      return
    }
    setAvatarUrl(url)
    setAvatarKey(null)
    setAvatarUrlInput('')
    setShowUrlInput(false)
  }

  function save() {
    setError(null)
    if (name.trim().length < 2) { setError('الاسم لازم يكون حرفين على الأقل'); return }
    if (name.trim().length > 40) { setError('الاسم طويل جدًا'); return }
    if (bio.length > 200) { setError('البايو طويل جدًا'); return }

    start(async () => {
      try {
        const res = await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: name.trim(),
            bio: bio.trim() || null,
            gender,
            avatar_key: avatarKey,
            avatar_url: avatarUrl,
          }),
        })

        const data = await res.json()
        console.log('[edit] response:', res.status, data)

        if (!res.ok || !data.ok) {
          setError(data.error ?? 'فشل الحفظ — حاول تاني')
          return
        }

        setSaved(true)
        setTimeout(() => {
          router.push('/account?updated=1')
          router.refresh()
        }, 600)
      } catch (err) {
        console.error('[edit] exception:', err)
        setError(err instanceof Error ? err.message : 'خطأ في الاتصال')
      }
    })
  }

  const initialLetter = (name.trim().charAt(0) || '؟').toUpperCase()
  const preset = getAvatar(avatarKey)

  return (
    <main className="edit">
      {/* ═══ اللوجو + العنوان ═══ */}
      <header className="edit__hero">
        <div className="edit__hero-logo">
          <EahLogo size="lg" variant="full" />
        </div>
        <h1 className="edit__title e-gradient">
          <IcEdit /> عدّل بروفايلك
        </h1>
        <p className="edit__sub">اسمك، صورتك، ونبذة قصيرة.</p>
      </header>

      <div className="edit__card">
        {/* ═══ 1. الصورة ═══ */}
        <section className="edit__section">
          <h2 className="edit__section-title"><IcCamera /> صورتك</h2>
          <p className="edit__section-sub">ارفع صورة من جهازك، أو اختار لون افتراضي.</p>
          <div className="edit__avatar-row">
            <div
              className="edit__avatar-preview"
              style={!avatarUrl ? { background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` } : undefined}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>
            <div className="edit__avatar-actions">
              <label className="edit__upload-btn">
                <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
                {uploading ? 'جاري الرفع...' : 'ارفع صورة'}
              </label>
              <button
                type="button"
                className="edit__url-btn"
                onClick={() => setShowUrlInput((v) => !v)}
              >
                {showUrlInput ? 'إلغاء الرابط' : 'من رابط URL'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  className="edit__remove-btn"
                  onClick={() => { setAvatarUrl(null); setAvatarKey(null) }}
                >
                  امسح الصورة
                </button>
              )}
            </div>
          </div>
          {showUrlInput && (
            <div className="edit__url-row">
              <input
                type="url"
                className="edit__input"
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyAvatarUrl() } }}
              />
              <button type="button" className="edit__url-apply" onClick={applyAvatarUrl}>
                طبق
              </button>
            </div>
          )}

          <div className="edit__avatar-presets">
            {AVATAR_KEYS.map((k) => {
              const a = getAvatar(k)
              const isActive = avatarKey === k && !avatarUrl
              return (
                <button
                  key={k}
                  type="button"
                  className={`edit__preset ${isActive ? 'is-active' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  onClick={() => { setAvatarKey(k); setAvatarUrl(null) }}
                  aria-label={`صورة ${k}`}
                />
              )
            })}
          </div>
        </section>

        {/* ═══ 2. الاسم ═══ */}
        <section className="edit__section">
          <h2 className="edit__section-title"><IcEdit /> الاسم الظاهر</h2>
          <input
            className="edit__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: نور الدين"
            maxLength={40}
          />
          <span className="edit__hint">ده اللي هيظهر لكل الناس على EAH.</span>
        </section>

        {/* ═══ 3. النوع ═══ */}
        <section className="edit__section">
          <h2 className="edit__section-title"><IcUsers /> النوع</h2>
          <div className="edit__gender">
            <button type="button" className={`edit__gender-btn ${gender === 'male' ? 'is-active' : ''}`} onClick={() => setGender('male')}>
              <span>👨</span> ذكر
            </button>
            <button type="button" className={`edit__gender-btn ${gender === 'female' ? 'is-active' : ''}`} onClick={() => setGender('female')}>
              <span>👩</span> أنثى
            </button>
          </div>
        </section>

        {/* ═══ 4. النبذة ═══ */}
        <section className="edit__section">
          <h2 className="edit__section-title"><IcChat /> نبذة عنك</h2>
          <textarea
            className="edit__textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="اكتب حاجة ظريفة عنك (اختياري)"
            maxLength={200}
            rows={3}
          />
          <span className="edit__hint">{bio.length}/200 حرف.</span>
        </section>

        {/* ═══ الأزرار ═══ */}
        <div className="edit__actions">
          <Link href="/account" className="edit__cancel">إلغاء</Link>
          <button type="button" className="edit__save" onClick={save} disabled={pending || uploading}>
            {pending ? 'جاري الحفظ...' : saved ? '✓ تم الحفظ' : 'حفظ التعديلات'}
          </button>
        </div>

        {error && <div className="edit__error">{error}</div>}
      </div>

      {/* ═══ التوثيق — آخر الصفحة ═══ */}
      <div className="edit__status">
        <div className={`edit__status-card ${initial.isVerified ? 'is-verified' : ''}`}>
          <span className="edit__status-icon">{initial.isVerified ? <IcCheck /> : <IcBan />}</span>
          <div>
            <strong className="edit__status-title">
              {initial.isVerified ? 'حسابك موثق' : 'حسابك غير موثق'}
            </strong>
            <span className="edit__status-sub">
              {initial.isVerified
                ? 'مميزات إضافية مفعّلة على حسابك'
                : 'وثّق حسابك لمميزات أكثر وثقة أعلى'}
            </span>
          </div>
          {!initial.isVerified && (
            <Link href="/account/verify" className="edit__status-btn">وثّق الآن →</Link>
          )}
        </div>
      </div>
    </main>
  )
}
