import { createClient } from '@/lib/supabase/server'
import { TagIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './ads.module.css'

export const dynamic = 'force-dynamic'

type Slot = {
  id: string
  code: string
  name_ar: string
  description: string | null
  base_price_egp: number
  max_concurrent: number
}

async function getSlots(): Promise<Slot[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ad_slots')
    .select('id, code, name_ar, description, base_price_egp, max_concurrent')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (data ?? []) as Slot[]
}

export default async function AdminAdsPage() {
  const slots = await getSlots()

  return (
    <div>
      <AccountPageHeader
        title="الإعلانات"
        description={`${slots.length} مكان إعلاني`}
      />

      {slots.length === 0 ? (
        <EmptyState Icon={TagIcon} title="مفيش أماكن إعلانية" />
      ) : (
        <div className={styles.grid}>
          {slots.map((s) => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.icon}>
                  <TagIcon size={22} />
                </span>
                <div>
                  <h3 className={styles.name}>{s.name_ar}</h3>
                  {s.description && <p className={styles.desc}>{s.description}</p>}
                </div>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{s.base_price_egp}</span>
                <span className={styles.currency}>ج.م / أسبوع</span>
              </div>
              <div className={styles.meta}>
                {s.max_concurrent} {s.max_concurrent === 1 ? 'مكان' : 'أماكن'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
