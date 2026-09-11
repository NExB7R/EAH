import EahStudio from '@/components/eah-studio'
import { getPublishedBusinesses } from '@/lib/data'

export default async function StudioPage() {
  const businesses = await getPublishedBusinesses(8)

  return <EahStudio businesses={businesses} />
}
