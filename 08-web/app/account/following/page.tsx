import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getMyFollowingIds } from '@/lib/follows'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import PageLogo from '@/components/page-logo'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'بتتابع إيه' }

export default async function FollowingPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/account/following')

  const ids = await getMyFollowingIds(user.id)
  let businesses: { id: string; slug: string; name: string; business_type: string; area: string | null }[] = []
  if (ids.length) {
    const { data } = await sb
      .from('businesses')
      .select('id,slug,name,business_type,area')
      .in('id', ids)
      .eq('is_published', true)
    businesses = (data ?? []) as any
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <BackToTop />
      <main className="e-page">
        <h1 className="acc-title e-gradient">بتتابع إيه</h1>
        <p className="e-page__sub">{businesses.length} نشاط</p>

        {businesses.length === 0 ? (
          <div className="acc-empty">
            <p>لسه مش بتتابع حد</p>
            <Link href="/explore" className="acc-cta">اكتشف أنشطة</Link>
          </div>
        ) : (
          <ul className="acc-list">
            {businesses.map((b) => (
              <li key={b.id}>
                <Link href={`/businesses/${b.slug}`} className="acc-item">
                  <div className="acc-item-name">{b.name}</div>
                  <div className="acc-item-meta">
                    <span>{b.business_type}</span>
                    {b.area && <span>· {b.area}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
