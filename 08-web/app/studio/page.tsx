import EahStudioPro from '@/components/eah-studio-pro'
import { getPublishedBusinesses } from '@/lib/data'

export default async function StudioPage() {
  const businesses = await getPublishedBusinesses(8)
  return <EahStudioPro businesses={businesses} />
}
