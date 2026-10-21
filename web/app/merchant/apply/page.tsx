import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { StoreIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import { getUserSession } from '@/lib/data/user'
import { createClient } from '@/lib/supabase/server'
import { AREAS } from '@/lib/data/areas'
import ApplyWizard from './apply-wizard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'سجّل نشاطك · EAH',
  description: 'سجّل نشاطك مجاناً — تطبيقك الخاص على EAH',
}

export default async function MerchantApplyPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=%2Fmerchant%2Fapply')

  // A business must be linked to the authenticated user who submits it.
  // Never present a form that can only fail after an anonymous submission.
  {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_profile_id', session.userId)
      .limit(1)
      .maybeSingle()

    if (data) redirect('/merchant')
  }

  return (
    <main>
      <SecondaryHero
        activeKey="merchant"
        title="سجّل نشاطك"
        Icon={StoreIcon}
        tone="gold"
        countLabel="مجاناً"
        showNav={false}
      />

      <section style={{ padding: '20px 0 60px' }}>
        <ApplyWizard areas={AREAS} />
      </section>
    </main>
  )
}
