import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SlotAdminClient from './SlotAdminClient'
import './slot.css'

export const dynamic = 'force-dynamic'

export default async function SlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const { data: slot } = await supabase.from('ad_slots').select('*').eq('id', id).maybeSingle()
  if (!slot) notFound()

  const { data: ads } = await supabase
    .from('ads').select('*').eq('slot_id', id).order('created_at', { ascending: false })

  return (
    <main className="slot">
      <header className="slot__hero">
        <Link href="/admin/ads" className="slot__back">← الإعلانات</Link>
        <span className="slot__kicker">{slot.code}</span>
        <h1 className="slot__title">{slot.name_ar}</h1>
        <p className="slot__sub">{slot.description}</p>
      </header>
      <SlotAdminClient slot={slot} ads={ads ?? []} />
    </main>
  )
}
