import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import CreateAdForm from './CreateAdForm'
import './new.css'
import { IcMegaphone } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعلان جديد' }

export default async function NewAdPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/auth?next=/merchant/ads/new')

  const { data: slots } = await supabase.from('ad_slots').select('id,code,name_ar,slot_type').eq('is_active', true).order('display_order')

  return (
    <main className="anew">
      <header className="anew__hero">
        <Link href="/merchant/ads" className="anew__back">← إعلاناتي</Link>
        <span className="anew__kicker">إعلان جديد</span>
        <h1 className="anew__title"><IcMegaphone /> اطلب إعلانك</h1>
        <p className="anew__sub">اختار المكان، حدّد المدة، واحنا نراجعه ونشغله</p>
      </header>
      <CreateAdForm slots={slots ?? []} />
    </main>
  )
}
