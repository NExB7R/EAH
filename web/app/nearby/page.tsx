import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { getFullProfile, getFavoriteIds } from '@/lib/data/account'
import { getUserSession } from '@/lib/data/user'
import { distanceKm, isValidLatLng } from '@/lib/utils/distance'
import { MapPinIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import NearbyGrid from '@/components/nearby-grid'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'قريب منك',
  description: 'اكتشف الأنشطة القريبة من موقعك أو منطقتك المختارة في EAH',
}

export default async function NearbyPage() {
  const session = await getUserSession()
  const profile = session ? await getFullProfile(session.userId) : null
  const candidateLocation =
    profile?.default_latitude !== null && profile?.default_latitude !== undefined &&
    profile?.default_longitude !== null && profile?.default_longitude !== undefined
      ? { lat: profile.default_latitude, lng: profile.default_longitude }
      : null
  const viewerLocation = isValidLatLng(candidateLocation) ? candidateLocation : null
  const viewerArea = profile?.default_area?.trim() || null

  const [raw, favoriteIds] = await Promise.all([
    session ? getNearbyBusinesses(viewerLocation ? undefined : viewerArea ?? undefined, 1000) : Promise.resolve([]),
    session ? getFavoriteIds(session.userId) : Promise.resolve(new Set<string>()),
  ])

  const businesses = viewerLocation
    ? raw
        .map((business) => ({
          business,
          distance: business.location ? distanceKm(viewerLocation, business.location) : Number.POSITIVE_INFINITY,
        }))
        .filter((entry) => Number.isFinite(entry.distance) && entry.distance <= 5)
        .sort((a, b) => a.distance - b.distance || a.business.id.localeCompare(b.business.id))
        .map((entry) => entry.business)
    : viewerArea
      ? raw
      : []

  return (
    <main>
      <SecondaryHero
        activeKey="nearby"
        title="قريب منك"
        Icon={MapPinIcon}
        tone="teal"
        count={businesses.length}
      />
      <NearbyGrid
        businesses={businesses}
        favoriteIds={favoriteIds}
        isLoggedIn={!!session}
        viewerLocation={viewerLocation}
        viewerArea={viewerArea}
      />
    </main>
  )
}
