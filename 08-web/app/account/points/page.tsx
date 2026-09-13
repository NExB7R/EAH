import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import RewardCard from './reward-card'
import './points.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'نقاطي | EAH' }

export default async function PointsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/points')

  const [profileRes, rewardsRes, redemptionsRes] = await Promise.all([
    supabase.from('profiles').select('trust_score,streak_count,longest_streak,referral_code').eq('id', userData.user.id).maybeSingle(),
    supabase.from('reward_catalog').select('*').eq('is_active', true).order('sort_order', { ascending: true }).order('points_cost', { ascending: true }),
    supabase.from('reward_redemptions').select('id,code,status,points_spent,redeemed_at,expires_at,reward:reward_catalog(title,emoji)').eq('user_id', userData.user.id).order('redeemed_at', { ascending: false }).limit(20),
  ])

  const balance = profileRes.data?.trust_score ?? 0
  const streak = profileRes.data?.streak_count ?? 0
  const longest = profileRes.data?.longest_streak ?? 0
  const rewards = rewardsRes.data ?? []
  const redemptions = redemptionsRes.data ?? []

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="pt">
        <header className="pt__hero">
          <Link href="/account" className="pt__back">← حسابي</Link>
          <div className="pt__glow" aria-hidden />
          <span className="pt__kicker">MY POINTS</span>
          <h1 className="pt__title">💰 نقاطي</h1>
        </header>

        <section className="pt__stats">
          <div className="pt__stat pt__stat--primary">
            <span className="pt__stat-emoji">⭐</span>
            <span className="pt__stat-val">{balance}</span>
            <span className="pt__stat-label">نقطة متاحة</span>
          </div>
          <div className="pt__stat">
            <span className="pt__stat-emoji">🔥</span>
            <span className="pt__stat-val">{streak}</span>
            <span className="pt__stat-label">يوم متتالي</span>
          </div>
          <div className="pt__stat">
            <span className="pt__stat-emoji">🏆</span>
            <span className="pt__stat-val">{longest}</span>
            <span className="pt__stat-label">أطول streak</span>
          </div>
        </section>

        <section className="pt__howto">
          <h2 className="pt__howto-title">🎯 إزاي تكسب نقاط؟</h2>
          <div className="pt__howto-grid">
            <div className="pt__howto-item"><span>📅</span><strong>+5</strong> زيارة يومية</div>
            <div className="pt__howto-item"><span>🔥</span><strong>+7</strong> 3 أيام متتالية</div>
            <div className="pt__howto-item"><span>🔥🔥</span><strong>+10</strong> 7 أيام متتالية</div>
            <div className="pt__howto-item"><span>💎</span><strong>+20</strong> 30 يوم متتالي</div>
            <div className="pt__howto-item"><span>🎁</span><strong>+50</strong> دعوة صاحب</div>
          </div>
          <Link href="/account/referral" className="pt__howto-cta">🎁 ادعي صحابك ←</Link>
        </section>

        <section className="pt__rewards">
          <h2 className="pt__rewards-title">🎁 استبدل نقاطك</h2>
          {rewards.length === 0 ? (
            <div className="pt__empty">مفيش مكافآت متاحة دلوقتي</div>
          ) : (
            <div className="pt__grid">
              {rewards.map((r: any) => (
                <RewardCard key={r.id} reward={r} userBalance={balance} userStreak={streak} />
              ))}
            </div>
          )}
        </section>

        {redemptions.length > 0 && (
          <section className="pt__history">
            <h2 className="pt__history-title">📜 سجل الاستبدال</h2>
            <div className="pt__history-list">
              {redemptions.map((r: any) => (
                <div key={r.id} className="pt__history-item">
                  <span className="pt__history-emoji">{r.reward?.emoji ?? '🎁'}</span>
                  <div className="pt__history-info">
                    <strong>{r.reward?.title ?? 'مكافأة'}</strong>
                    <span className="pt__history-code">كود: {r.code}</span>
                  </div>
                  <span className={`pt__history-status pt__history-status--${r.status}`}>
                    {r.status === 'pending' && '⏳ معلق'}
                    {r.status === 'approved' && '✓ معتمد'}
                    {r.status === 'used' && '✅ مستعمل'}
                    {r.status === 'expired' && '⌛ انتهى'}
                    {r.status === 'rejected' && '❌ مرفوض'}
                  </span>
                  <span className="pt__history-date">{new Date(r.redeemed_at).toLocaleDateString('ar-EG')}</span>
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
