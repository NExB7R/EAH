import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_TEXTS, type AppTexts } from '@/lib/app-texts'

// ═══════════════════════════════════════════════════════════
// EAH — App Texts Reader (cached 60s)
// ═══════════════════════════════════════════════════════════

export const getAppTexts = unstable_cache(
  async (): Promise<AppTexts> => {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'texts')
      .maybeSingle()

    if (!data?.value || typeof data.value !== 'object') return DEFAULT_TEXTS

    const raw = data.value as Record<string, unknown>
    const merged: AppTexts = { ...DEFAULT_TEXTS }
    for (const key of Object.keys(DEFAULT_TEXTS) as (keyof AppTexts)[]) {
      const v = raw[key]
      if (typeof v === 'string' && v.trim()) merged[key] = v
    }
    return merged
  },
  ['app-texts'],
  { revalidate: 60, tags: ['app-texts'] },
)
