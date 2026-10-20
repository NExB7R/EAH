import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Badges Data
// ═══════════════════════════════════════════════════════════

export type BadgeCatalogItem = {
  key: string
  label: string
  description: string
  icon: string
  category: string
  display_order: number
  earned: boolean
  earned_at: string | null
}

// ─── كل الكتالوج + حالة الإنجاز ───
export async function getBadgeCatalogWithStatus(userId: string): Promise<BadgeCatalogItem[]> {
  const supabase = await createServiceClient()

  const [{ data: catalog }, { data: earned }] = await Promise.all([
    supabase
      .from('badge_catalog')
      .select('key, label, description, icon, category, display_order')
      .order('display_order', { ascending: true }),
    supabase
      .from('trust_badges')
      .select('badge_key, earned_at')
      .eq('entity_type', 'user')
      .eq('entity_id', userId),
  ])

  const earnedMap = new Map<string, string>()
  for (const e of earned ?? []) {
    earnedMap.set(e.badge_key, e.earned_at)
  }

  return (catalog ?? []).map((c) => ({
    key: c.key,
    label: c.label,
    description: c.description,
    icon: c.icon,
    category: c.category,
    display_order: c.display_order,
    earned: earnedMap.has(c.key),
    earned_at: earnedMap.get(c.key) ?? null,
  }))
}

// ─── Helper: ربط الشارات بأحداث معينة ───
export async function runBadgeChecks(userId: string): Promise<void> {
  const supabase = await createClient()
  await Promise.all([
    supabase.rpc('check_streak_badges', { p_user_id: userId }),
    supabase.rpc('check_reviewer_badges', { p_user_id: userId }),
    supabase.rpc('check_social_badges', { p_user_id: userId }),
  ])
}
