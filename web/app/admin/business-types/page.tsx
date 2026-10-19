import { createClient } from '@/lib/supabase/server'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { SparklesIcon } from '@/components/icons'
import BusinessTypesList from './business-types-list'
import styles from './business-types.module.css'

export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Types Approval
// يعرض الأنشطة اللي عندها custom_business_type بانتظار الموافقة
// ═══════════════════════════════════════════════════════════

export type PendingType = {
  id: string
  name: string
  slug: string
  custom_business_type: string | null
  area: string | null
  created_at: string
}

async function getPendingTypes(): Promise<PendingType[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id, name, slug, custom_business_type, area, created_at')
    .eq('business_type_status', 'pending')
    .order('created_at', { ascending: false })

  return (data ?? []) as PendingType[]
}

export default async function BusinessTypesPage() {
  const pending = await getPendingTypes()

  return (
    <div>
      <AccountPageHeader
        title="أنواع الأنشطة الجديدة"
        description={`${pending.length} نوع بحاجة موافقة`}
      />

      {pending.length === 0 ? (
        <EmptyState
          Icon={SparklesIcon}
          title="مفيش أنواع جديدة"
          description="الأنشطة اللي بيختاروا نوع مخصص هيظهروا هنا للموافقة"
        />
      ) : (
        <div className={styles.wrap}>
          <BusinessTypesList items={pending} />
        </div>
      )}
    </div>
  )
}
