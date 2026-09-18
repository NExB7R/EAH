import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getMyLoyalty, getTiers } from '@/lib/loyalty'
import LoyaltyRing from '@/components/loyalty/loyalty-ring'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مستواك' }

export default async function LoyaltyPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/account/loyalty')

  const [loyalty, tiers] = await Promise.all([getMyLoyalty(), getTiers()])
  if (!loyalty) {
    return (
      <>
        <FloatingCapsuleHeader />
        <main className="acc-page">
          <h1 className="acc-title">مستواك</h1>
          <p className="acc-sub">لسه مفيش نقاط — ابدأ من الرئيسية</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="acc-page">
        <h1 className="acc-title">مستواك</h1>
        <div className="lt-wrap">
          <LoyaltyRing data={loyalty} />
        </div>

        <h2 className="lt-tiers-title">المستويات</h2>
        <ul className="lt-tiers">
          {tiers.map((t) => {
            const active = t.code === loyalty.tier
            return (
              <li key={t.code} className={`lt-tier ${active ? 'lt-active' : ''}`}>
                <div className="lt-tier-head">
                  <span className="lt-tier-name">{t.name_ar}</span>
                  <span className="lt-tier-pts">{t.min_points}+ نقطة</span>
                </div>
                {Array.isArray(t.perks) && (
                  <ul className="lt-perks">
                    {t.perks.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
