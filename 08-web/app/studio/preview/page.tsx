import { createClient } from '@/lib/supabase-server'
import DesignRenderer from '@/components/studio/design-renderer'

export const dynamic = 'force-dynamic'

export default async function StudioPreviewPage() {
  const supabase = await createClient()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,is_featured')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return <DesignRenderer initial={null} businesses={businesses ?? []} />
}
