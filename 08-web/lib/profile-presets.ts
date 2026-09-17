export type Role = 'customer' | 'merchant' | 'admin' | 'super_admin'
export type Gender = 'male' | 'female'

export type PresetAvatar = { key: string; from: string; to: string }

/**
 * EAH Profile System — مبسط 2026
 *
 * مفيش ألقاب ولا فريمات معقدة.
 * نظام الشارات:
 *   👑 super_admin   → تاج ذهبي (فريد)
 *   💎 merchant_premium → ماسة (للاشتراك المدفوع)
 *    verified      → توثيق الحساب
 */

export const AVATARS: PresetAvatar[] = [
  { key: 'av1',  from: '#8B5CF6', to: '#EC4899' },
  { key: 'av2',  from: '#F59E0B', to: '#DC2626' },
  { key: 'av3',  from: '#06B6D4', to: '#8B5CF6' },
  { key: 'av4',  from: '#10B981', to: '#06B6D4' },
  { key: 'av5',  from: '#EC4899', to: '#F59E0B' },
  { key: 'av6',  from: '#6366F1', to: '#A855F7' },
  { key: 'av7',  from: '#F97316', to: '#EF4444' },
  { key: 'av8',  from: '#14B8A6', to: '#84CC16' },
  { key: 'av9',  from: '#A855F7', to: '#3B82F6' },
  { key: 'av10', from: '#EAB308', to: '#F97316' },
  { key: 'av11', from: '#EF4444', to: '#EC4899' },
  { key: 'av12', from: '#0EA5E9', to: '#6366F1' },
]

export function getAvatar(k: string | null | undefined): PresetAvatar {
  return AVATARS.find(a => a.key === k) ?? AVATARS[0]
}

// ═══════════════════════════════════════════════════════════
// Badge logic
// ═══════════════════════════════════════════════════════════

export type BadgeKind = 'crown' | 'premium' | 'verified' | null

export function roleBadge(
  role: string | null | undefined,
  isPremium: boolean,
  verified: boolean,
): BadgeKind {
  // super_admin = ملكي (فريد)
  if (role === 'super_admin') return 'crown'
  // merchant مشترك مدفوع = premium
  if (role === 'merchant' && isPremium) return 'premium'
  // توثيق
  if (verified) return 'verified'
  return null
}

export const ROLE_LABEL: Record<string, string> = {
  customer: 'عضو',
  merchant: 'تاجر',
  admin: 'إداري',
  super_admin: 'المالك',
}
