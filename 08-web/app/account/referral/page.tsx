import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import ClaimForm from './claim-form'
import './referral.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'ادعي صحابك' }

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/referral')

  const { data: profile } = await supabase
    .from('profiles').select('referral_code,referred_by').eq('id', userData.user.id).maybeSingle()

  const { data: refs } = await supabase
    .from('referrals').select('id,created_at,bonus_points')
    .eq('referrer_id', userData.user.id)
    .order('created_at', { ascending: false })

  const code = profile?.referral_code ?? '—'
  const totalRefs = refs?.length ?? 0
  const totalBonus = (refs ?? []).reduce((s, r) => s + (r.bonus_points ?? 0), 0)
  const shareText = `جرب EAH — منصة اكتشاف المطاعم والصيدليات في شبين القناطر. استعمل الكود: ${code}`
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eah-sq.vercel.app'

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="rf">
        <header className="rf__hero">
          <Link href="/account" className="rf__back">← رجوع</Link>
          <span className="rf__kicker">الإحالة</span>
          <h1 className="rf__title">ادعي صحابك</h1>
          <p className="rf__sub">كل صاحب يشترك = 50 نقطة ليك وليه</p>
        </header>

        <section className="rf__card">
          <span className="rf__card-label">كودك الخاص</span>
          <div className="rf__code">{code}</div>
          <div className="rf__actions">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank" rel="noreferrer" className="rf__btn rf__btn--whatsapp"
            >💚 شارك على واتساب</a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noreferrer" className="rf__btn rf__btn--facebook"
            >شارك على فيسبوك</a>
          </div>
        </section>

        <section className="rf__stats">
          <div className="rf__stat">
            <span className="rf__stat-val">{totalRefs}</span>
            <span className="rf__stat-label">صاحب اشترك</span>
          </div>
          <div className="rf__stat">
            <span className="rf__stat-val" style={{ color: '#FBBF24' }}>{totalBonus}</span>
            <span className="rf__stat-label">نقطة مكتسبة</span>
          </div>
        </section>

        {!profile?.referred_by && <ClaimForm />}

        {totalRefs > 0 && (
          <section className="rf__history">
            <h3 className="rf__history-title">📜 سجل الإحالات</h3>
            <div className="rf__history-list">
              {(refs ?? []).map(r => (
                <div key={r.id} className="rf__history-item">
                  <span>صاحب جديد</span>
                  <span className="rf__history-points">+{r.bonus_points}</span>
                  <span className="rf__history-date">
                    {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
