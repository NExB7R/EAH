import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PromoSubmit from '@/components/promo/promo-submit'
import PromoStatus from '@/components/promo/promo-status'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import '@/components/promo/promo.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'شارك EAH' }

export default async function PromoPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/merchant/promo')

  const { data: biz } = await sb
    .from('businesses')
    .select('id,name,slug')
    .eq('owner_profile_id', user.id)
    .maybeSingle()

  if (!biz) {
    return (
      <>
        <FloatingCapsuleHeader />
        <main className="e-page">
          <h1 className="e-page__title">شارك EAH</h1>
          <p className="e-page__sub">لازم تكون صاحب نشاط</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const { data: posts } = await sb
    .from('promo_posts')
    .select('id,post_url,status,review_note,days_granted,created_at,reviewed_at')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })

  const hasApproved = (posts ?? []).some((p) => p.status === 'approved')
  const hasPending = (posts ?? []).some((p) => p.status === 'pending')

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="e-page">
        <h1 className="e-page__title">شارك EAH</h1>
        <p className="e-page__sub">
          اعمل بوست على صفحة {biz.name} يعرّف بـ EAH — وخد 15 يوم إضافي مجاناً
        </p>

        <PromoSubmit
          businessId={biz.id}
          disabled={hasApproved || hasPending}
          reason={hasApproved ? 'استخدمت الميزة قبل كده' : hasPending ? 'عندك طلب قيد المراجعة' : null}
        />

        {posts && posts.length > 0 && <PromoStatus posts={posts} />}
      </main>
      <SiteFooter />
    </>
  )
}
