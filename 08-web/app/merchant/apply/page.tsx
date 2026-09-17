import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import ApplyCategoryPicker from './ApplyCategoryPicker'
import './apply.css'

async function submitApplication(formData: FormData) {
  'use server'
  const businessName = String(formData.get('business_name') || '').trim()
  const rawCategory = String(formData.get('category') || '').trim()
  const customCategory = String(formData.get('custom_category') || '').trim()
  const customEmoji = String(formData.get('custom_emoji') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (businessName.length < 2) {
    throw new Error('اكتب اسم النشاط.')
  }

  // لو اختار "أخرى" → نجمع الأيقونة + الاسم
  let category = rawCategory
  if (rawCategory === 'other') {
    if (customCategory.length < 2) {
      throw new Error('اكتب اسم المجال المخصص.')
    }
    category = `${customEmoji} ${customCategory}`
  } else if (category.length < 2) {
    throw new Error('اختار نوع النشاط.')
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { error } = await supabase.from('merchant_applications').insert({
    user_id: userData.user.id,
    business_name: businessName,
    category,
    description: description || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/merchants')
  redirect('/merchant/apply?sent=1')
}

const STEPS = [
  { n: 1, emoji: '', title: 'قدم الطلب',   desc: 'اسم النشاط + نوعه + نبذة' },
  { n: 2, emoji: '', title: 'مراجعة سريعة', desc: 'فريق EAH بيراجع خلال 24 ساعة' },
  { n: 3, emoji: '', title: 'لوحة النشاط', desc: 'تتحول لـ Merchant وتدير مكانك' },
]

export const metadata = {
  title: 'سجّل نشاطك',
  description: 'قدّم طلب تسجيل نشاطك على EAH — عرض مجاني لآلاف العملاء.',
}

export default async function MerchantApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { data: applications } = await supabase
    .from('merchant_applications')
    .select('id,business_name,category,status,admin_note,created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })

  const hasPending = (applications ?? []).some((a) => a.status === 'pending')

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ap">
        <section className="ap-hero">
          <div className="ap-hero__glow" aria-hidden />
          <span className="ap-hero__kicker">شريك EAH</span>
          <h1 className="ap-hero__title">
            سجّل <span className="ap-hero__accent">نشاطك</span> على EAH
          </h1>
          <p className="ap-hero__lead">
            قدم بيانات نشاطك مرة واحدة، وبعد موافقة الإدارة يتحول حسابك لـ Merchant.
          </p>
        </section>

        <section className="ap-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="ap-step">
              <span className="ap-step__n">{s.n}</span>
              <span className="ap-step__emoji">{s.emoji}</span>
              <span className="ap-step__title">{s.title}</span>
              <span className="ap-step__desc">{s.desc}</span>
            </div>
          ))}
        </section>

        {sent === '1' && (
          <div className="ap-alert ap-alert--success">
            <span className="ap-alert__emoji"></span>
            <div>
              <strong className="ap-alert__title">تم إرسال طلبك</strong>
              <p className="ap-alert__text">فريق EAH هيراجعه وهيرد عليك قريب.</p>
            </div>
          </div>
        )}

        {hasPending ? (
          <div className="ap-alert ap-alert--info">
            <span className="ap-alert__emoji"></span>
            <div>
              <strong className="ap-alert__title">عندك طلب قيد المراجعة</strong>
              <p className="ap-alert__text">هنتواصل معاك على رقم موبايلك بعد المراجعة.</p>
            </div>
          </div>
        ) : (
          <section className="ap-card">
            <header className="ap-card__head">
              <h2 className="ap-card__title">بيانات النشاط</h2>
              <p className="ap-card__sub">كل البيانات سرية — مش هتظهر لأي حد غير فريق EAH.</p>
            </header>

            <form action={submitApplication} className="ap-form">
              <div className="ap-field">
                <label htmlFor="business_name" className="ap-label">اسم النشاط *</label>
                <input
                  id="business_name"
                  name="business_name"
                  placeholder="مثلاً: مطعم البلد"
                  required
                  minLength={2}
                  maxLength={80}
                  className="ap-input"
                />
              </div>

              <ApplyCategoryPicker />

              <div className="ap-field">
                <label htmlFor="description" className="ap-label">نبذة عن النشاط</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="اكتب نبذة بسيطة عن نشاطك، موقعه، وليه الناس تحبه"
                  rows={4}
                  maxLength={300}
                  className="ap-textarea"
                />
              </div>

              <button type="submit" className="ap-submit">
                إرسال طلب صاحب النشاط
              </button>
            </form>
          </section>
        )}

        {(applications ?? []).length > 0 && (
          <section className="ap-history">
            <h2 className="ap-history__title">📜 طلباتك السابقة</h2>
            <div className="ap-history__list">
              {(applications ?? []).map((a) => (
                <div key={a.id} className="ap-history__item">
                  <div className="ap-history__info">
                    <strong className="ap-history__name">{a.business_name}</strong>
                    <span className="ap-history__date">
                      {new Date(a.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <span
                    className={`ap-status ap-status--${a.status}`}
                  >
                    {a.status === 'pending' && 'قيد المراجعة'}
                    {a.status === 'approved' && 'تمت الموافقة'}
                    {a.status === 'rejected' && 'مرفوض'}
                    {!['pending', 'approved', 'rejected'].includes(a.status) && a.status}
                  </span>
                  {a.admin_note && (
                    <p className="ap-history__note">{a.admin_note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="ap-help">
          <span className="ap-help__emoji"></span>
          <div>
            <strong className="ap-help__title">محتاج مساعدة؟</strong>
            <p className="ap-help__text">
              كلمنا على <Link href="/contact" className="ap-help__link">صفحة التواصل</Link> لو عندك أي سؤال.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
