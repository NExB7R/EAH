// EAH — Role theme + badges (shared across all profile pages)
export type ProfileRole = 'super_admin' | 'admin' | 'merchant' | 'advertiser' | 'customer'
export type BadgeKind = 'verified' | 'premium' | 'new' | 'advertiser' | 'merchant'

export const ROLE_THEME: Record<
  ProfileRole,
  { label: string; gradient: string; soft: string; onSoft: string }
> = {
  super_admin: {
    label: 'سوبر أدمن',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    soft: '#ede9fe',
    onSoft: '#5b21b6',
  },
  admin: {
    label: 'أدمن',
    gradient: 'linear-gradient(135deg,#6366f1,#4338ca)',
    soft: '#e0e7ff',
    onSoft: '#3730a3',
  },
  merchant: {
    label: 'تاجر',
    gradient: 'linear-gradient(135deg,#10b981,#047857)',
    soft: '#d1fae5',
    onSoft: '#065f46',
  },
  advertiser: {
    label: 'معلن',
    gradient: 'linear-gradient(135deg,#f59e0b,#b45309)',
    soft: '#fef3c7',
    onSoft: '#92400e',
  },
  customer: {
    label: 'عميل',
    gradient: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
    soft: '#e0f2fe',
    onSoft: '#075985',
  },
}

export const BADGE_META: Record<BadgeKind, { label: string; bg: string; fg: string }> = {
  verified: { label: 'موثّق', bg: '#0ea5e9', fg: '#ffffff' },
  premium: { label: 'مميز', bg: '#f59e0b', fg: '#1f2937' },
  new: { label: 'جديد', bg: '#22c55e', fg: '#ffffff' },
  advertiser: { label: 'معلن', bg: '#f59e0b', fg: '#1f2937' },
  merchant: { label: 'تاجر', bg: '#10b981', fg: '#ffffff' },
}
