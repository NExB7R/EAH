import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './points.css'
import { IcCalendar, IcCheck, IcScroll, IcTrophy, IcSparkle, IcFire, IcGift, IcHeart, IcChat, IcStore, IcPackage, IcCrown } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'نقاطي' }

export default async function PointsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/points')

  const { data: profile } = await supabase
    .from('profiles')
    .select('trust_score,streak_count,longest_streak')
    .eq('id', userData.user.id)
    .maybeSingle()

  const balance = profile?.trust_score ?? 0
  const streak = profile?.streak_count ?? 0
  const longest = profile?.longest_streak ?? 0

  // أول 5 مستخدمين — للترتيب
  const { data: top } = await supabase
    .from('profiles')
    .select('display_name,trust_score')
    .order('trust_score', { ascending: false })
    .limit(5)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pt">
        <header className="pt__hero">
          <Link href="/account" className="pt__back">← حسابي</Link>
          <div className="pt__glow" aria-hidden />
          <span className="pt__kicker">نقاطي</span>
          <h1 className="pt__title">رصيدك من النقاط</h1>
          <p className="pt__sub">كل تفاعل على EAH = نقاط. احتفظ بيها — هتعرف قيمتها قريب.</p>
        </header>

        <section className="pt__stats">
          <div className="pt__stat pt__stat--primary">
            <span className="pt__stat-emoji"><IcSparkle /></span>
            <span className="pt__stat-val">{balance}</span>
            <span className="pt__stat-label">نقطة متاحة</span>
          </div>
          <div className="pt__stat">
            <span className="pt__stat-emoji"><IcFire /></span>
            <span className="pt__stat-val">{streak}</span>
            <span className="pt__stat-label">يوم متتالي</span>
          </div>
          <div className="pt__stat">
            <span className="pt__stat-emoji"><IcTrophy /></span>
            <span className="pt__stat-val">{longest}</span>
            <span className="pt__stat-label">أطول سلسلة</span>
          </div>
        </section>

        {/* Banner غامض */}
        <section className="pt__mystery">
          <div className="pt__mystery-glow" aria-hidden />
          <span className="pt__mystery-icon"><IcGift /></span>
          <h2 className="pt__mystery-title">قريبًا هتعرفوا النقاط بتستبدل بإيه</h2>
          <p className="pt__mystery-text">
            بنجهز حاجة كبيرة — <strong>مفاجأة</strong>. كل نقطة بتجمعها دلوقتي هتفرق.
            كمّل تفاعلك وخلّي رصيدك يكبر.
          </p>
          <div className="pt__mystery-bar" aria-hidden>
            <div className="pt__mystery-bar-fill" />
          </div>
          <span className="pt__mystery-hint">في انتظار الإعلان الرسمي</span>
        </section>

        {/* إزاي تكسب */}
        <section className="pt__howto">
          <h2 className="pt__howto-title">إزاي تكسب نقاط؟</h2>
          <div className="pt__howto-grid">
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcCalendar /></span>
              <div>
                <strong>+5 نقاط</strong>
                <span>دخول يومي</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcFire /></span>
              <div>
                <strong>+7 نقاط</strong>
                <span>3 أيام متتالية</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcSparkle /></span>
              <div>
                <strong>+10 نقاط</strong>
                <span>7 أيام متتالية</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcTrophy /></span>
              <div>
                <strong>+20 نقاط</strong>
                <span>30 يوم متتالي</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcPackage /></span>
              <div>
                <strong>+15 نقاط</strong>
                <span>أول أوردر</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcChat /></span>
              <div>
                <strong>+10 نقاط</strong>
                <span>رأي أو تعليق</span>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcHeart /></span>
              <div>
                <strong>+3 نقاط</strong>
                <span>زيارة فريدة</span>
                <small>لما تطلب أوردر فعلي أو تكشف رقم الفون</small>
              </div>
            </div>
            <div className="pt__howto-item">
              <span className="pt__howto-icon"><IcCrown /></span>
              <div>
                <strong>+50 نقاط</strong>
                <span>دعوة صاحب</span>
              </div>
            </div>
          </div>
          <Link href="/account/referral" className="pt__howto-cta">
            ادعي صحابك ←
          </Link>
        </section>

        {/* Top 5 */}
        {top && top.length > 0 && (
          <section className="pt__leaderboard">
            <header className="pt__lb-head">
              <span className="pt__lb-icon"><IcTrophy /></span>
              <h2 className="pt__lb-title">أعلى النقاط</h2>
            </header>
            <div className="pt__lb-list">
              {top.map((p, i) => (
                <div key={i} className="pt__lb-row">
                  <span className={`pt__lb-rank pt__lb-rank--${i + 1}`}>{i + 1}</span>
                  <span className="pt__lb-name">{p.display_name ?? 'مستخدم'}</span>
                  <span className="pt__lb-score">{p.trust_score ?? 0}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pt__cta">
          <Link href="/explore" className="pt__cta-btn">اكتشف الأماكن واكسب نقاط</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
