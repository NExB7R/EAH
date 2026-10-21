import type { ComponentType } from 'react'
import {
  AlertIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownGoldIcon,
  FileTextIcon,
  SparklesIcon,
  StoreIcon,
  TagIcon,
  TrendingUpIcon,
  SettingsIcon,
  UserIcon,
} from '@/components/icons'

export type CommandGroup = 'navigation' | 'actions'

export type Command = {
  id: string
  label: string
  description: string
  href: string
  icon: ComponentType<{ size?: number }>
  group: CommandGroup
  keywords: string[]
}

export const COMMANDS: Command[] = [
  {
    id: 'admin-home',
    label: 'لوحة التحكم',
    description: 'الصفحة الرئيسية للأدمن',
    href: '/admin',
    icon: TrendingUpIcon,
    group: 'navigation',
    keywords: ['home', 'dashboard', 'main', 'لوحة', 'رئيسية'],
  },
  {
    id: 'admin-businesses',
    label: 'الأنشطة',
    description: 'إدارة كل الأنشطة',
    href: '/admin/businesses',
    icon: StoreIcon,
    group: 'navigation',
    keywords: ['businesses', 'stores', 'shops', 'أنشطة', 'متاجر'],
  },
  {
    id: 'admin-business-types',
    label: 'أنواع الأنشطة',
    description: 'إدارة التصنيفات المتاحة على المنصة',
    href: '/admin/business-types',
    icon: SparklesIcon,
    group: 'navigation',
    keywords: ['business types', 'categories', 'أنواع', 'تصنيفات'],
  },
  {
    id: 'admin-users',
    label: 'المستخدمين',
    description: 'إدارة الحسابات',
    href: '/admin/users',
    icon: UserIcon,
    group: 'navigation',
    keywords: ['users', 'accounts', 'مستخدمين', 'حسابات'],
  },
  {
    id: 'admin-subscriptions',
    label: 'الاشتراكات',
    description: 'اشتراكات التجار',
    href: '/admin/subscriptions',
    icon: CrownGoldIcon,
    group: 'navigation',
    keywords: ['subscriptions', 'plans', 'اشتراكات', 'باقات'],
  },
  {
    id: 'admin-featured',
    label: 'المميزين',
    description: 'الأنشطة المميزة',
    href: '/admin/featured',
    icon: CrownGoldIcon,
    group: 'navigation',
    keywords: ['featured', 'premium', 'مميزين'],
  },
  {
    id: 'admin-ads',
    label: 'الإعلانات',
    description: 'إدارة الإعلانات',
    href: '/admin/ads',
    icon: TagIcon,
    group: 'navigation',
    keywords: ['ads', 'advertising', 'إعلانات'],
  },
  {
    id: 'admin-moderation',
    label: 'المراجعة والأمان',
    description: 'التقييمات والإبلاغات',
    href: '/admin/moderation',
    icon: CheckCircleIcon,
    group: 'navigation',
    keywords: ['moderation', 'reviews', 'reports', 'مراجعة', 'تقييمات', 'إبلاغات'],
  },



  {
    id: 'admin-notifications',
    label: 'الإشعارات',
    description: 'إرسال إشعارات + السجل',
    href: '/admin/notifications',
    icon: BellIcon,
    group: 'navigation',
    keywords: ['notifications', 'push', 'broadcast', 'إشعارات'],
  },
  {
    id: 'admin-studio',
    label: 'الاستوديو',
    description: 'الميزات والنصوص',
    href: '/admin/studio',
    icon: SparklesIcon,
    group: 'navigation',
    keywords: ['studio', 'flags', 'texts', 'استوديو', 'ميزات'],
  },
  {
    id: 'admin-settings',
    label: 'الإعدادات',
    description: 'إعدادات المنصة',
    href: '/admin/settings',
    icon: SettingsIcon,
    group: 'navigation',
    keywords: ['settings', 'config', 'إعدادات'],
  },
  {
    id: 'admin-analytics',
    label: 'التحليلات',
    description: 'إحصائيات المنصة',
    href: '/admin/analytics',
    icon: TrendingUpIcon,
    group: 'navigation',
    keywords: ['analytics', 'stats', 'تحليلات', 'إحصائيات'],
  },
  {
    id: 'admin-audit',
    label: 'سجل التدقيق',
    description: 'كل إجراءات الأدمن',
    href: '/admin/audit',
    icon: ClockIcon,
    group: 'navigation',
    keywords: ['audit', 'log', 'تدقيق', 'سجل'],
  },
  {
    id: 'admin-insights',
    label: 'تخزين التقارير الذكية',
    description: 'عرض محفوظات الرؤى الذكية حسب النشاط',
    href: '/admin/insights',
    icon: SparklesIcon,
    group: 'navigation',
    keywords: ['insights', 'storage', 'reports', 'ai', 'تخزين', 'تقارير', 'رؤى'],
  },
  {
    id: 'admin-health',
    label: 'صحة النظام والأخطاء',
    description: 'متابعة الأعطال والسجلات غير المحلولة',
    href: '/admin/health',
    icon: AlertIcon,
    group: 'navigation',
    keywords: ['health', 'errors', 'system', 'صحة', 'أخطاء', 'النظام'],
  },
  {
    id: 'action-new-business',
    label: 'نشاط جديد',
    description: 'إضافة نشاط من لوحة الأدمن',
    href: '/admin/businesses/new',
    icon: StoreIcon,
    group: 'actions',
    keywords: ['new', 'create', 'add', 'جديد', 'إضافة'],
  },
  {
    id: 'action-export-businesses',
    label: 'تصدير الأنشطة CSV',
    description: 'تحميل كل الأنشطة',
    href: '/api/admin/export?type=businesses',
    icon: FileTextIcon,
    group: 'actions',
    keywords: ['export', 'csv', 'businesses', 'تصدير', 'أنشطة'],
  },
  {
    id: 'action-export-users',
    label: 'تصدير المستخدمين CSV',
    description: 'تحميل كل المستخدمين',
    href: '/api/admin/export?type=users',
    icon: FileTextIcon,
    group: 'actions',
    keywords: ['export', 'csv', 'users', 'تصدير', 'مستخدمين'],
  },
  {
    id: 'action-export-audit',
    label: 'تصدير سجل التدقيق CSV',
    description: 'تحميل كل الإجراءات',
    href: '/api/admin/export?type=audit',
    icon: FileTextIcon,
    group: 'actions',
    keywords: ['export', 'csv', 'audit', 'تصدير', 'تدقيق'],
  },
]
