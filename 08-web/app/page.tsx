import EahHomeClient from '@/components/eah-home-client'
import { getPublishedBusinesses } from '@/lib/data'

export default async function Page() {
  const businesses = await getPublishedBusinesses(8)
  return <EahHomeClient businesses={businesses} />
}
