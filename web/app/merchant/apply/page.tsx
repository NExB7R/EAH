import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { StoreIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import { getUserSession } from '@/lib/data/user'
import { createClient } from '@/lib/supabase/server'
import { AREAS } from '@/lib/data/areas'
import ApplyWizard from './apply-wizard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'سجّل نشاطك',
  description: 'سجّل نشاطك مجاناً — تطبيقك الخاص على EAH',
}

export default async function MerchantApplyPage() {
  const session = await getUserSession()

  // Applications must be linked to a real, signed-in account; admin-created
  // activities belong in the admin workflow instead.
  if (!session) redirect('/auth?next=%2Fmerchant%2Fapply')
  if (session.role === 'super_admin') redirect('/admin')

  const supabase = await createClient()
  const { data: existing, error: existingError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', session.userId)
    .limit(1)
    .maybeSingle()

  if (existing) redirect('/merchant')
  if (existingError) {
    return (
      <main>
        <SecondaryHero showNav={false} />
        <section style={{ padding: '24px 16px 60px', textAlign: 'center' }}>
          <h1>تعذر التحقق من حسابك</h1>
          <p role="status">
            مش قادرين نتأكد دلوقتي إذا كان فيه نشاط مربوط بحسابك. حاول مرة تانية قبل إنشاء طلب جديد.
          </p>
          <Link href="/merchant">العودة للوحة النشاط</Link>
        </section>
      </main>
    )
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
