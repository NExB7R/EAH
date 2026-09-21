import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import PageLogo from '@/components/page-logo'
import InvitationCard from './InvitationCard'
import './InvitationCard.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'دعواتي' }

export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/account/partners/invitations')

  const { data: rows } = await supabase
    .from('business_partners')
    .select(`
      id, role, status, invited_at, notes,
      business:businesses!business_partners_business_id_fkey(name, slug),
      inviter:profiles!business_partners_invited_by_fkey(display_name)
    `)
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false })

  const invitations = (rows ?? []) as any[]

  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <main className="invp">
        <header className="invp__hero">
          <div className="invp__hero-glow" aria-hidden />
          <span className="invp__kicker">🪄 دعواتي</span>
          <h1 className="invp__title">دعوات الانضمام</h1>
          <p className="invp__sub">
            {invitations.length === 0
              ? 'مفيش دعوات لسه'
              : `عندك ${invitations.length} ${invitations.length === 1 ? 'دعوة' : 'دعوات'} — اقبل أو ارفض`}
          </p>
        </header>

        {invitations.length === 0 ? (
          <div className="invp__empty">
            <div className="invp__empty-icon">🕊️</div>
            <h2 className="invp__empty-title">مفيش دعوات لسه</h2>
            <p className="invp__empty-msg">
              لما صاحب نشاط يدعيك كشريك، هتلاقي الدعوة هنا
            </p>
            <Link href="/account" className="invp__empty-btn">
              ← رجوع للحساب
            </Link>
          </div>
        ) : (
          <div className="invp__grid">
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                partnerId={inv.id}
                businessName={inv.business?.name ?? 'نشاط'}
                businessSlug={inv.business?.slug ?? ''}
                role={inv.role}
                invitedAt={inv.invited_at}
                notes={inv.notes}
                invitedByName={inv.inviter?.display_name}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
