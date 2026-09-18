import DesignRenderer from '@/components/studio/design-renderer'
import { getPublishedBusinesses } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function StudioPreviewPage() {
  const raw = await getPublishedBusinesses(60)
  const businesses = raw.map((b) => ({
    id: b.businessId ?? b.slug,
    name: b.name,
    slug: b.slug,
    hook: (b as any).hook ?? null,
    business_type: b.type,
    is_featured: !!b.featured,
  }))
  return <DesignRenderer initial={null} businesses={businesses as any} />
}
