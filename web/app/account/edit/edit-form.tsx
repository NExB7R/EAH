'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AvatarUploader } from '@/components/profile/avatar-uploader'
import { updateProfile, updatePrivacy } from './actions'
import styles from './edit.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Edit Profile Form (Full Rewrite 2026-10-08)
// ═══════════════════════════════════════════════════════════

type Mode = 'real' | 'alias' | 'both' | 'anonymous'

type Props = {
  initial: {
    displayName: string
    alias: string | null
    gender: string | null
    bio: string | null
    avatarUrl: string | null
    displayNameMode: Mode
    hideAvatar: boolean
    hideFavorites: boolean
    hideFollowing: boolean
    role: 'customer' | 'merchant' | 'super_admin'
    isVerified: boolean
    isPaidMember: boolean
    phoneVerified: boolean
  }
}

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: 'real', label: 'اسمي الحقيقي', desc: 'يظهر اسمك في كل مكان' },
  { key: 'alias', label: 'كنية بس', desc: 'يظهر بدل اسمك الحقيقي' },
  { key: 'both', label: 'الاتنين', desc: 'الاسم (الكنية)' },
  { key: 'anonymous', label: 'مجهول', desc: 'بدون اسم — "مستخدم EAH"' },
]

export default function EditProfileForm({ initial }: Props) {
  const router = useRouter()
  const [pendingProfile, startProfile] = useTransition()
  const [pendingPrivacy, startPrivacy] = useTransition()

  const [displayName, setDisplayName] = useState(initial.displayName)
  const [alias, setAlias] = useState(initial.alias ?? '')
  const [gender, setGender] = useState(initial.gender ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [mode, setMode] = useState<Mode>(initial.displayNameMode)

  const [hideAvatar, setHideAvatar] = useState(initial.hideAvatar)
  const [hideFavorites, setHideFavorites] = useState(initial.hideFavorites)
  const [hideFollowing, setHideFollowing] = useState(initial.hideFollowing)

  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [privacyMsg, setPrivacyMsg] = useState<string | null>(null)

  // ─── حفظ البيانات ───
  const onProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileMsg(null)

    const fd = new FormData(e.currentTarget)
    startProfile(async () => {
      const res = await updateProfile(fd)
      if (res.ok) {
        setProfileMsg('✓ اتحفظ')
        router.refresh()
        setTimeout(() => setProfileMsg(null), 2500)
      } else {
        setProfileMsg(res.error)
      }
    })
  }

  // ─── حفظ الخصوصية ───
  const onPrivacySubmit = () => {
    setPrivacyMsg(null)

    const fd = new FormData()
    fd.append('hide_avatar', hideAvatar ? 'on' : '')
    fd.append('hide_favorites', hideFavorites ? 'on' : '')
    fd.append('hide_following', hideFollowing ? 'on' : '')

    startPrivacy(async () => {
      const res = await updatePrivacy(fd)
      if (res.ok) {
        setPrivacyMsg('✓ اتحفظ')
        setTimeout(() => setPrivacyMsg(null), 2500)
      } else {
        setPrivacyMsg(res.error)
      }
    })
  }

  return (
    <div className={styles.wrap}>
      {/* ═══ Card 1: الصورة ═══ */}
      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>الصورة الشخصية</h3>
          <p className={styles.cardDesc}>اضغط على الصورة لتغييرها — JPG أو PNG · حتى 3MB</p>
        </header>

        <AvatarUploader
          displayName={displayName}
          avatarUrl={initial.avatarUrl}
          role={initial.role}
          isVerified={initial.isVerified}
          isPaidMember={initial.isPaidMember}
        />
      </section>

      {/* ═══ Card 2: الهوية ═══ */}
      <form className={styles.card} onSubmit={onProfileSubmit}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>البيانات الأساسية</h3>
          <p className={styles.cardDesc}>الاسم والكنية والنوع والنبذة</p>
        </header>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="display_name">
            الاسم
          </label>
          <input
            id="display_name"
            name="display_name"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            required
            placeholder="اسمك"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="alias">
            الكنية <span className={styles.optional}>(اختياري)</span>
          </label>
          <input
            id="alias"
            name="alias"
            className={styles.input}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            maxLength={30}
            placeholder="مثلاً: أبو حمزة"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>النوع</span>
          <input type="hidden" name="gender" value={gender} />
          <div className={styles.radioRow}>
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`${styles.radio} ${gender === 'male' ? styles.radioActive : ''}`}
            >
              ذكر
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`${styles.radio} ${gender === 'female' ? styles.radioActive : ''}`}
            >
              أنثى
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="bio">
            نبذة
          </label>
          <textarea
            id="bio"
            name="bio"
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={4}
            placeholder="اكتب حاجة عنك..."
          />
          <span className={styles.counter}>{bio.length} / 200</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>وضع الظهور</span>
          <input type="hidden" name="display_name_mode" value={mode} />
          <div className={styles.modesGrid}>
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`${styles.modeCard} ${mode === m.key ? styles.modeCardActive : ''}`}
              >
                <span className={styles.modeLabel}>{m.label}</span>
                <span className={styles.modeDesc}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pendingProfile}>
            {pendingProfile ? 'بيحفظ...' : 'حفظ البيانات'}
          </button>
          {profileMsg && <span className={styles.msg}>{profileMsg}</span>}
        </div>
      </form>

      {/* ═══ Card 3: الخصوصية ═══ */}
      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>الخصوصية</h3>
          <p className={styles.cardDesc}>تحكم في اللي يظهر للآخرين</p>
        </header>

        <div className={styles.toggleList}>
          <ToggleRow
            label="إخفاء الصورة الشخصية"
            desc="مش هتظهر لغيرك"
            checked={hideAvatar}
            onChange={setHideAvatar}
          />
          <ToggleRow
            label="إخفاء المفضلات"
            desc="قائمة المفضلات مش هتظهر"
            checked={hideFavorites}
            onChange={setHideFavorites}
          />
          <ToggleRow
            label="إخفاء المتابعات"
            desc="قائمة المتابعات مش هتظهر"
            checked={hideFollowing}
            onChange={setHideFollowing}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submit}
            onClick={onPrivacySubmit}
            disabled={pendingPrivacy}
          >
            {pendingPrivacy ? 'بيحفظ...' : 'حفظ الخصوصية'}
          </button>
          {privacyMsg && <span className={styles.msg}>{privacyMsg}</span>}
        </div>
      </section>
    </div>
  )
}

// ─── Toggle Row ───
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      className={styles.toggleRow}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{desc}</span>
      </div>
      <span className={`${styles.toggleSwitch} ${checked ? styles.toggleSwitchOn : ''}`}>
        <span className={styles.toggleKnob} />
      </span>
    </button>
  )
}
