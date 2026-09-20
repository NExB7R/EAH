import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import TrustBadge from '@/components/trust-badge'
import { IcCheck, IcStar, IcTrophy, IcGift, IcLock } from '@/components/eah-icons'
import './trust.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مصداقيتي' }

const TIER_META: Record<string, { label: string; desc: string; perks: string[] }> = {
  newbie: {
    label: 'مبتدئ',
    desc: 'أهلاً بيك! ابدأ رحلتك على EAH',
    perks: ['تصفح كامل', 'تقييمات', 'حفظ المفضلة'],
  },
  trusted: {
    label: 'موثوق',
    desc: 'إنت عميل بيثق فيه — كمل كده',
    perks: ['كل مميزات المبتدئ', 'أولوية خفيفة في الرد', 'كوبونات ترحيبية'],
  },
  pro: {
    label: 'محترف',
    desc: 'مصداقيتك عالية — الأنشطة بتفضلك',
    perks: ['أولوية في الرد على الأوردرات', 'كوبونات حصرية', 'خصومات من شركاء'],
  },
  vip: {
    label: 'VIP',
    desc: 'إنت من نخبة EAH',
    perks: ['أعلى أولوية', 'خصومات دائمة', 'دعم سريع', 'شارة VIP ذهبية'],
  },
}

export default async function TrustPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/account/trust')

  const [profileRes, eventsRes, badgesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('trust_score,trust_tier,verified_at,successful_orders,cancelled_orders,total_reviews_received')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('trust_events')
      .select('event_type,delta,score_before,score_after,metadata,created_at')
      .eq('entity_type', 'customer')
      .eq('entity_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('trust_badges')
      .select('badge_key,earned_at')
      .eq('entity_type', 'customer')
      .eq('entity_id', user.id)
      .order('earned_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const events = eventsRes.data ?? []
  const badges = badgesRes.data ?? []

  const score = profile?.trust_score ?? 50
  const tier = profile?.trust_tier ?? 'trusted'
  const meta = TIER_META[tier] ?? TIER_META.trusted

  const nextTierScore = tier === 'vip' ? 100 : tier === 'pro' ? 90 : tier === 'trusted' ? 75 : 50
  const progress = Math.min(100, (score / nextTierScore) * 100)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="trp">
        <header className="trp__hero">
          <Link href="/account" className="trp__back">← رجوع</Link>
          <h1 className="trp__title">مصداقيتي</h1>
          <p className="trp__sub">سمعتك على EAH — بتبنيها بكل تفاعل</p>
        </header>

        {/* ─── الكارت الرئيسي ─── */}
        <section className={`trp__main trp__main--${tier}`}>
          <div className="trp__score-wrap">
            <div className="trp__score-num">{score}</div>
            <div className="trp__score-max">/100</div>
          </div>
          <TrustBadge score={score} tier={tier} size="lg" />
          <p className="trp__tier-desc">{meta.desc}</p>

          {/* شريط التقدم */}
          <div className="trp__progress">
            <div className="trp__progress-track">
              <div className="trp__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="trp__progress-labels">
              <span>{meta.label}</span>
              {tier !== 'vip' && (
                <span>{nextTierScore} = {TIER_META[tier === 'trusted' ? 'pro' : tier === 'pro' ? 'vip' : 'trusted'].label}</span>
              )}
            </div>
          </div>
        </section>

        {/* ─── المميزات ─── */}
        <section className="trp__section">
          <h2 className="trp__section-title">
            <IcTrophy /> مميزاتك الحالية
          </h2>
          <ul className="trp__perks">
            {meta.perks.map((p, i) => (
              <li key={i} className="trp__perk">
                <span className="trp__perk-icon"><IcCheck /></span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── الشارات ─── */}
        {badges.length > 0 && (
          <section className="trp__section">
            <h2 className="trp__section-title">
              <IcGift /> شاراتك
            </h2>
            <div className="trp__badges">
              {badges.map((b) => (
                <div key={b.badge_key} className="trp__badge">
                  <span className="trp__badge-icon">🏆</span>
                  <span className="trp__badge-label">{b.badge_key}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── السجل ─── */}
        <section className="trp__section">
          <h2 className="trp__section-title">
            <IcStar /> تاريخ مصداقيتك
          </h2>
          {events.length === 0 ? (
            <p className="trp__empty">لسه مفيش أحداث. ابدأ تفاعل عشان نبني مصداقيتك.</p>
          ) : (
            <ul className="trp__events">
              {events.map((ev, i) => (
                <li key={i} className="trp__event">
                  <span className={`trp__event-delta ${ev.delta > 0 ? 'is-plus' : ev.delta < 0 ? 'is-minus' : 'is-zero'}`}>
                    {ev.delta > 0 ? `+${ev.delta}` : ev.delta}
                  </span>
                  <div className="trp__event-info">
                    <span className="trp__event-label">{ev.event_type.replace(/_/g, ' ')}</span>
                    <span className="trp__event-date">
                      {new Date(ev.created_at).toLocaleDateString('ar-EG', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="trp__event-score">
                    {ev.score_before} → {ev.score_after}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── إزاي تتحسّن ─── */}
        <section className="trp__section trp__section--tips">
          <h2 className="trp__section-title">
            <IcStar /> إزاي ترفع مصداقيتك
          </h2>
          <ul className="trp__tips">
            <li>✅ وثّق حسابك (+15)</li>
            <li>✅ أضف رقم موبايلك (+10)</li>
            <li>✅ كمّل أوردرات ناجحة (+1 لكل أوردر)</li>
            <li>✅ قيّم تجاربك بعد الأوردرات (+2 لكل تقييم)</li>
            <li>✅ اقعد معانا — كل 3 شهور +5</li>
            <li>⚠️ كل إلغاء أوردر = −10</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
