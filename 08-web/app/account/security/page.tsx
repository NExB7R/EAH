import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import TwoFactorSetup from '@/components/security/two-factor-setup'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import PageLogo from '@/components/page-logo'
import SiteFooter from '@/components/site-footer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'أمان الحساب' }

export default async function SecurityPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/account/security')

  // قائمة العوامل المفعلة (لو MFA متاح)
  let factors: { id: string; friendly_name?: string; status: string }[] = []
  try {
    const { data } = await (sb.auth as any).mfa.listFactors()
    factors = (data?.totp ?? []).map((f: any) => ({
      id: f.id,
      friendly_name: f.friendly_name,
      status: f.status,
    }))
  } catch { /* MFA مش مفعل في Supabase بعد */ }

  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <main className="e-page">
        <h1 className="acc-title e-gradient">أمان الحساب</h1>
        <p className="e-page__sub">حماية إضافية بحسابك</p>
        <TwoFactorSetup factors={factors} />
      </main>
      <SiteFooter />
    </>
  )
}
