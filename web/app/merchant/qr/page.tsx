import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { isFeatureEnabled } from '@/lib/features'
import { createClient } from '@/lib/supabase/server'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { StoreIcon } from '@/components/icons'
import QrGenerator from './qr-generator'
import styles from './qr.module.css'

export const dynamic = 'force-dynamic'

export default async function QrPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/qr')

  if (!(await isFeatureEnabled('qr_enabled'))) {
    redirect('/merchant')
  }

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug, name')
    .eq('owner_profile_id', session.userId)
    .limit(1)
    .maybeSingle()

  if (!business) {
    return (
      <div>
        <AccountPageHeader title="رمز الاستجابة السريعة للنشاط" description="رمز قابل للطباعة" />
        <EmptyState
          Icon={StoreIcon}
          title="مفيش نشاط"
          description="سجّل نشاطك الأول عشان تحصل على الرمز"
        />
      </div>
    )
  }

  return (
    <div>
      <AccountPageHeader
        title="رمز الاستجابة السريعة للنشاط"
        description="حمّل الكود واطبعه — العملاء يمسحوه ويفتحوا صفحتك فورًا"
      />

      <section className={styles.hero}>
        <p className={styles.hint}>
          حط الكود على: واجهة المحل، المنيو، السيارات، أو أي حتة يشوفها العملاء.
        </p>
      </section>

      <QrGenerator slug={business.slug} businessName={business.name} />
    </div>
  )
}
