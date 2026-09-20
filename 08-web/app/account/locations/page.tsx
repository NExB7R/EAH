import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getMyLocations } from '@/lib/locations'
import LocationPicker from '@/components/locations/location-picker'
import SavedLocationsList from '@/components/locations/saved-locations-list'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import PageLogo from '@/components/page-logo'
import SiteFooter from '@/components/site-footer'
import '@/components/locations/location-picker.css'
import './locations.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مواقعي' }

export default async function LocationsPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/account/locations')

  const locations = await getMyLocations()

  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <main className="e-page">
        <h1 className="e-page__title">مواقعي</h1>
        <p className="e-page__sub">احفظ مواقعك عشان تطلب وتبحث بسرعة</p>
        <SavedLocationsList initial={locations} />
      </main>
      <SiteFooter />
    </>
  )
}
