import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { updateProfile } from './actions'
import AvatarUploader from '@/components/avatar-uploader'
import './edit.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تعديل البروفايل' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name,avatar_key,bio,phone,gender,avatar_url')
    .eq('id', userData.user.id)
    .maybeSingle()

  const name = profile?.display_name ?? 'مستخدم'

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="edit">
        <header className="edit__head">
          <Link href="/account" className="edit__back">← رجوع</Link>
          <div>
            <span className="edit__kicker">EDIT PROFILE</span>
            <h1 className="edit__title">✏️ عدّل بروفايلك</h1>
            <p className="edit__sub">اسمك، صورتك، ونبذة قصيرة عنك.</p>
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
            <h2 className="edit__section-title">🎨 صورتك</h2>
            <p className="edit__section-sub">ارفع صورة من جهازك، أو اختار لون افتراضي.</p>
            <AvatarUploader
              userId={userData.user.id}
              initialUrl={profile?.avatar_url ?? null}
              initialKey={profile?.avatar_key ?? null}
            />
          </section>

          {/* الجنس */}
          <section className="edit__section">
            <h2 className="edit__section-title">👤 النوع</h2>
            <div className="edit__gender">
              <label className={`edit__gender-btn ${profile?.gender === 'male' ? 'is-active' : ''}`}>
                <input type="radio" name="gender" value="male" defaultChecked={profile?.gender === 'male'} />
                <span>👨 ذكر</span>
              </label>
              <label className={`edit__gender-btn ${profile?.gender === 'female' ? 'is-active' : ''}`}>
                <input type="radio" name="gender" value="female" defaultChecked={profile?.gender === 'female'} />
                <span>👩 أنثى</span>
              </label>
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
