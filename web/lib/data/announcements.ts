import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

// ═══════════════════════════════════════════════════════════
// EAH — Announcements Data
// ═══════════════════════════════════════════════════════════

export type Announcement = {
  id: string
  title: string
  body: string | null
  theme: 'gold' | 'purple' | 'orange' | 'teal'
  dismissible: boolean
  link_url: string | null
  link_label: string | null
}

export const getActiveAnnouncements = unstable_cache(
  async (): Promise<Announcement[]> => {
    const supabase = createPublicClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, theme, dismissible, link_url, link_label')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('[data] getActiveAnnouncements error:', error.message)
      return []
    }
    return (data ?? []) as Announcement[]
  },
  ['announcements-active'],
  { revalidate: 60, tags: ['announcements'] },
)
