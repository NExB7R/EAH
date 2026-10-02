import 'server-only'
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FLAGS, type FeatureFlags } from './features-shared'

// ═══════════════════════════════════════════════════════════
// EAH — Feature Flags (Server reader)
// ═══════════════════════════════════════════════════════════

export type { FeatureFlags } from './features-shared'
export { DEFAULT_FLAGS } from './features-shared'

async function readFlagsRaw(): Promise<FeatureFlags> {
  try {
    const service = createServiceClient()
    const { data } = await service
      .from('app_settings')
      .select('value')
      .eq('key', 'features')
      .maybeSingle()

    if (!data?.value) return DEFAULT_FLAGS
    return { ...DEFAULT_FLAGS, ...(data.value as Partial<FeatureFlags>) }
  } catch {
    return DEFAULT_FLAGS
  }
}

export const getFeatureFlags = unstable_cache(readFlagsRaw, ['feature-flags'], {
  revalidate: 60,
  tags: ['features'],
})

export async function isFeatureEnabled<K extends keyof FeatureFlags>(flag: K): Promise<boolean> {
  const flags = await getFeatureFlags()
  return flags[flag]
}
