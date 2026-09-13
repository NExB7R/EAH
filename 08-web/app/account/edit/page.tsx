import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { updateProfile } from './actions'
import { AVATARS, framesForRole, titlesForRole, type Role } from '@/lib/profile-presets'
import './edit.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تعديل البروفايل | EAH' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name,avatar_key,title_key,frame_key,bio,phone,trust_score,gender')
    .eq('id', userData.user.id)
    .maybeSingle()

  const name = profile?.display_name ?? 'مستخدم'
  const initial = name.charAt(0).toUpperCase()
  const currentAvatar = profile?.avatar_key ?? AVATARS[0].key
  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  const role = (roleRow?.role ?? 'customer') as Role
  const gender = (profile?.gender as 'male' | 'female' | undefined) ?? null
  const availableTitles = titlesForRole(role, gender)
  const availableFrames = framesForRole(role)
  const currentTitle = profile?.title_key ?? availableTitles[0]?.key ?? 'elgoker'
  const currentFrame = profile?.frame_key ?? FRAMES[0].key

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="edit">
        <header className="edit__head">
          <Link href="/account" className="edit__back">← رجوع</Link>
          <div>
            <span className="edit__kicker">EDIT PROFILE</span>
            <h1 className="edit__title">✏️ عدّل بروفايلك</h1>
            <p className="edit__sub">خلّي حسابك يعبّر عنك — اسم، صورة، لقب، وإطار.</p>
          </div>
        </header>

        <form action={updateProfile} className="edit__form">
          {/* الاسم */}
          <section className="edit__section">
            <h2 className="edit__section-title">👤 الاسم الظاهر</h2>
            <input
              name="display_name"
              defaultValue={name}
              placeholder="مثلاً: نور الدين"
              required
              minLength={2}
              maxLength={40}
              className="edit__input"
            />
            <span className="edit__hint">ده اللي هيظهر لكل الناس على EAH.</span>
          </section>

          {/* الأفاتار */}
          <section className="edit__section">
            <h2 className="edit__section-title">🎨 صورتك الرمزية</h2>
            <p className="edit__section-sub">اختار لون يناسب شخصيتك — كل لون له روح مختلفة.</p>
            <div className="edit__avatars">
              {AVATARS.map((av) => (
                <label key={av.key} className="edit__avatar-option">
                  <input
                    type="radio"
                    name="avatar_key"
                    value={av.key}
                    defaultChecked={av.key === currentAvatar}
                  />
                  <span
                    className="edit__avatar-circle"
                    style={{ background: `linear-gradient(135deg, ${av.from}, ${av.to})` }}
                  >
                    {initial}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* اللقب */}
          <section className="edit__section">
            <h2 className="edit__section-title">🏷️ لقبك</h2>
            <p className="edit__section-sub">اختار اللقب اللي يعبّر عنك — كل لقب له حكاية.</p>
            <div className="edit__titles">
              {availableTitles.map((t) => (
                <label key={t.key} className="edit__title-option">
                  <input
                    type="radio"
                    name="title_key"
                    value={t.key}
                    defaultChecked={t.key === currentTitle}
                  />
                  <span className="edit__title-card">
                    <span className="edit__title-emoji">{t.emoji}</span>
                    <span className="edit__title-label">{t.label}</span>
                    <span className="edit__title-hint">{t.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* الإطار */}
          <section className="edit__section">
            <h2 className="edit__section-title">✨ إطار صورتك</h2>
            <p className="edit__section-sub">الإطار يظهر حوالين صورتك في كل مكان على EAH.</p>
            <div className="edit__frames">
              {availableFrames.map((f) => {
                const isGradient = f.border.startsWith('conic')
                const style = isGradient
                  ? { backgroundImage: f.border, border: 'none', boxShadow: `0 0 16px ${f.glow}` }
                  : { border: `3px solid ${f.border}`, boxShadow: `0 0 16px ${f.glow}` }
                return (
                  <label key={f.key} className="edit__frame-option">
                    <input
                      type="radio"
                      name="frame_key"
                      value={f.key}
                      defaultChecked={f.key === currentFrame}
                    />
                    <span className="edit__frame-circle" style={style}>
                      <span className="edit__frame-inner">{initial}</span>
                    </span>
                    <span className="edit__frame-label">{f.label}</span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* البايو */}
          <section className="edit__section">
            <h2 className="edit__section-title">💬 نبذة عنك</h2>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ''}
              placeholder="اكتب حاجة ظريفة عنك (اختياري)"
              maxLength={200}
              rows={3}
              className="edit__textarea"
            />
            <span className="edit__hint">200 حرف كحد أقصى.</span>
          </section>

          <div className="edit__actions">
            <Link href="/account" className="edit__cancel">إلغاء</Link>
            <button type="submit" className="edit__save">حفظ التعديلات ✓</button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </>
  )
}
