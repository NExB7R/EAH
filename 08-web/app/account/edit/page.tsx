import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { updateProfile } from './actions'
import AvatarUploader from '@/components/avatar-uploader'
import GenderPicker from '@/components/gender-picker'
import './edit.css'
import { IcEdit, IcCamera, IcUsers, IcChat, IcCheck, IcBan, IcCrown } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تعديل البروفايل' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name,avatar_key,bio,phone,gender,avatar_url,verified_at')
    .eq('id', userData.user.id)
    .maybeSingle()

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  const role = roleRow?.role ?? 'customer'
  const isVerified = !!profile?.verified_at
  const name = profile?.display_name ?? 'مستخدم'

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="edit">
        <header className="edit__head">
          <Link href="/account" className="edit__back">← رجوع</Link>
          <div>
            <span className="edit__kicker">تعديل بياناتي</span>
            <h1 className="edit__title"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> عدّل بروفايلك</h1>
            <p className="edit__sub">اسمك، صورتك، ونبذة قصيرة.</p>
          </div>
        </header>

        <div className="edit__status">
          <div className={`edit__status-card ${isVerified ? 'is-verified' : ''}`}>
            <span className="edit__status-icon">{isVerified ? <IcCheck /> : <IcBan />}</span>
            <div>
              <strong className="edit__status-title">
                {isVerified ? 'حسابك موثق' : 'حسابك غير موثق'}
              </strong>
              <span className="edit__status-sub">
                {isVerified
                  ? 'مميزات إضافية مفعّلة على حسابك'
                  : 'وثّق حسابك لمميزات أكثر وثقة أعلى'}
              </span>
            </div>
            {!isVerified && (
              <Link href="/account/verify" className="edit__status-btn">
                وثّق الآن →
              </Link>
            )}
          </div>

          {role === 'super_admin' && (
            <div className="edit__status-card edit__status-card--admin">
              <span className="edit__status-icon"><IcCrown /></span>
              <div>
                <strong className="edit__status-title">حساب المالك</strong>
                <span className="edit__status-sub">
                  صلاحيات كاملة على المنصة
                </span>
              </div>
            </div>
          )}
        </div>

        <form action={updateProfile} className="edit__form">
          <section className="edit__section">
            <h2 className="edit__section-title">
              <IcEdit />
              الاسم الظاهر
            </h2>
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

          <section className="edit__section">
            <h2 className="edit__section-title">
              <IcCamera />
              صورتك
            </h2>
            <p className="edit__section-sub">ارفع صورة من جهازك، أو اختار لون افتراضي.</p>
            <AvatarUploader
              userId={userData.user.id}
              initialUrl={profile?.avatar_url ?? null}
              initialKey={profile?.avatar_key ?? null}
            />
          </section>

          <section className="edit__section">
            <h2 className="edit__section-title">
              <IcUsers />
              النوع
            </h2>
            <GenderPicker initial={(profile?.gender as 'male' | 'female' | null) ?? null} />
          </section>

          <section className="edit__section">
            <h2 className="edit__section-title">
              <IcChat />
              نبذة عنك
            </h2>
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
            <button type="submit" className="edit__save"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> حفظ التعديلات</button>
          </div>
        </form>

        <div className="edit__footer-note">
          <span></span>
          <p>
            بروفايلك محمي. صورة، اسم، ونبذة فقط — بدون أي بيانات إضافية.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
