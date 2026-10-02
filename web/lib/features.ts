import 'server-only'
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Feature Flags
// تخزين: app_settings (key='features')
// caching: 60s + tag 'features' (يتم revalidate عند التعديل)
// ═══════════════════════════════════════════════════════════

export type FeatureFlags = {
  featured_enabled: boolean
  trends_enabled: boolean
  offers_enabled: boolean
  new_enabled: boolean
  nearby_enabled: boolean
  ai_agent_enabled: boolean
  support_bot_enabled: boolean
  push_enabled: boolean
  qr_enabled: boolean
  announcements_enabled: boolean
  reviews_enabled: boolean
  orders_enabled: boolean
}

export const DEFAULT_FLAGS: FeatureFlags = {
  featured_enabled: true,
  trends_enabled: true,
  offers_enabled: true,
  new_enabled: true,
  nearby_enabled: true,
  ai_agent_enabled: true,
  support_bot_enabled: true,
  push_enabled: true,
  qr_enabled: true,
  announcements_enabled: true,
  reviews_enabled: true,
  orders_enabled: true,
}

export const FEATURE_META: Record<
  keyof FeatureFlags,
  { label: string; desc: string; group: 'home' | 'features' | 'system' }
> = {
  featured_enabled: {
    label: 'المميزون',
    desc: 'قسم المميزين في Home + صفحة /featured',
    group: 'home',
  },
  trends_enabled: {
    label: 'الترند',
    desc: 'قسم الترند في Home + صفحة /trends',
    group: 'home',
  },
  offers_enabled: {
    label: 'العروض',
    desc: 'قسم العروض في Home + صفحة /offers',
    group: 'home',
  },
  new_enabled: {
    label: 'الأنشطة الجديدة',
    desc: 'قسم الجديد في Home + صفحة /new',
    group: 'home',
  },
  nearby_enabled: {
    label: 'قريب منك',
    desc: 'قسم قريب منك + صفحة /nearby',
    group: 'home',
  },
  ai_agent_enabled: {
    label: 'AI Agent (المساعد الذكي)',
    desc: 'Widget البحث والإرشاد العائم',
    group: 'features',
  },
  support_bot_enabled: {
    label: 'Support Bot (الدعم الفني)',
    desc: 'Bot /help للأسئلة الفنية',
    group: 'features',
  },
  push_enabled: {
    label: 'الإشعارات Push',
    desc: 'Web Push Notifications',
    group: 'features',
  },
  qr_enabled: {
    label: 'QR للتاجر',
    desc: 'توليد QR للنشاط',
    group: 'features',
  },
  announcements_enabled: {
    label: 'إشعارات المسؤول',
    desc: 'إرسال رسائل رسمية لكل المستخدمين',
    group: 'system',
  },
  reviews_enabled: {
    label: 'التقييمات',
    desc: 'كتابة + قراءة التقييمات',
    group: 'system',
  },
  orders_enabled: {
    label: 'الطلبات',
    desc: 'OrderModal + flow كامل',
    group: 'system',
  },
}

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
