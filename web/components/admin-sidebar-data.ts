import {
  LayoutDashboardIcon,
  StoreIcon,
  UserIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  AlertIcon,
  FileTextIcon,
  BellIcon,
  BroadcastIcon,
  TagIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  CartIcon,
  MapPinIcon,
  GiftIcon,
  HomeIcon,
  CompassIcon,
  HelpCircleIcon,
  SettingsIcon,
  LockIcon,
  QrCodeIcon,
  InfoIcon,
  MessageCircleIcon,
  TargetIcon,
  LampIcon,
  FireIcon,
} from '@/components/icons'

export type NavItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  badgeKey?: 'pendingBusinesses' | 'flaggedReviews' | 'pendingSubscriptions' | 'openReports'
  isShare?: boolean
}

export type NavGroup = {
  key: string
  title: string
  Icon: React.ComponentType<{ size?: number }>
  defaultOpen: boolean
  items: NavItem[]
}

export const ADMIN_GROUPS: NavGroup[] = [
  {
    key: 'admin',
    title: 'الإدارة',
    Icon: ShieldCheckIcon,
    defaultOpen: true,
    items: [
      { href: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboardIcon },
      { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
      { href: '/admin/health', label: 'صحة النظام', Icon: AlertIcon },
      { href: '/admin/studio', label: 'الاستوديو', Icon: SparklesIcon },
      {
        href: '/admin/businesses',
        label: 'الأنشطة',
        Icon: StoreIcon,
        badgeKey: 'pendingBusinesses',
      },
      { href: '/admin/businesses/new', label: 'إضافة نشاط', Icon: StoreIcon },
      { href: '/admin/featured', label: 'المميزة', Icon: CrownGoldIcon },
      { href: '/admin/business-types', label: 'أنواع الأنشطة', Icon: TagIcon },
      { href: '/admin/users', label: 'المستخدمون', Icon: UserIcon },
      {
        href: '/admin/subscriptions',
        label: 'الاشتراكات',
        Icon: CrownGoldIcon,
        badgeKey: 'pendingSubscriptions',
      },
      { href: '/admin/ads', label: 'الإعلانات', Icon: TagIcon },
      {
        href: '/admin/moderation',
        label: 'التقييمات',
        Icon: ShieldCheckIcon,
        badgeKey: 'flaggedReviews',
      },
      {
        href: '/admin/moderation?tab=reports',
        label: 'البلاغات',
        Icon: AlertIcon,
        badgeKey: 'openReports',
      },
      { href: '/admin/moderation?tab=fraud', label: 'كشف الاحتيال', Icon: ShieldCheckIcon },
      { href: '/admin/insights', label: 'تقارير الأنشطة', Icon: FileTextIcon },
      { href: '/admin/notifications', label: 'الإشعارات', Icon: BellIcon },
      {
        href: '/admin/notifications?tab=announcements',
        label: 'الإعلانات العامة',
        Icon: BroadcastIcon,
      },
    ],
  },
  {
    key: 'account',
    title: 'حسابي',
    Icon: UserIcon,
    defaultOpen: false,
    items: [
      { href: '/admin/profile', label: 'بروفايلي', Icon: UserIcon },
      { href: '/account/edit', label: 'تعديل البيانات', Icon: FileTextIcon },
      { href: '/account/security', label: 'الأمان', Icon: LockIcon },
    ],
  },
  {
    key: 'as-customer',
    title: 'رؤية كعميل',
    Icon: UserIcon,
    defaultOpen: false,
    items: [
      { href: '/account', label: 'لوحة العميل', Icon: LayoutDashboardIcon },
      { href: '/account/orders', label: 'طلباتي', Icon: CartIcon },
      { href: '/account/favorites', label: 'المفضلة', Icon: HeartIcon },
      { href: '/account/following', label: 'المتابعات', Icon: StarIcon },
      { href: '/account/points', label: 'النقاط', Icon: CrownGoldIcon },
      { href: '/account/loyalty', label: 'الولاء', Icon: GiftIcon },
      { href: '/account/badges', label: 'الشارات', Icon: CrownGoldIcon },
      { href: '/account/referral', label: 'الإحالات', Icon: TargetIcon },
      { href: '/account/notifications', label: 'إشعاراتي', Icon: BellIcon },
      { href: '/account/verify', label: 'التحقق', Icon: ShieldCheckIcon },
      { href: '#share', label: 'شارك EAH مع حبايبك', Icon: SparklesIcon, isShare: true },
    ],
  },
  {
    key: 'as-merchant',
    title: 'رؤية كتاجر',
    Icon: StoreIcon,
    defaultOpen: false,
    items: [
      { href: '/merchant', label: 'لوحة التاجر', Icon: LayoutDashboardIcon },
      { href: '/merchant/business', label: 'نشاطي', Icon: StoreIcon },
      { href: '/merchant/branches', label: 'الفروع', Icon: MapPinIcon },
      { href: '/merchant/orders', label: 'الطلبات', Icon: CartIcon },
      { href: '/merchant/offers', label: 'العروض', Icon: TagIcon },
      { href: '/merchant/ads', label: 'إعلاناتي', Icon: FireIcon },
      { href: '/merchant/insights', label: 'تحليلاتي', Icon: TrendingUpIcon },
      { href: '/merchant/subscription', label: 'الاشتراك', Icon: CrownGoldIcon },
      { href: '/merchant/qr', label: 'رمز QR', Icon: QrCodeIcon },
      { href: '/merchant/settings', label: 'الإعدادات', Icon: SettingsIcon },
      { href: '#share', label: 'شارك EAH مع حبايبك', Icon: SparklesIcon, isShare: true },
    ],
  },
  {
    key: 'public',
    title: 'المنصة العامة',
    Icon: CompassIcon,
    defaultOpen: false,
    items: [
      { href: '/', label: 'الرئيسية', Icon: HomeIcon },
      { href: '/explore', label: 'اكتشف', Icon: CompassIcon },
      { href: '/featured', label: 'المميزون', Icon: CrownGoldIcon },
      { href: '/trends', label: 'الترند', Icon: TrendingUpIcon },
      { href: '/offers', label: 'العروض', Icon: GiftIcon },
      { href: '/new', label: 'بدايات جديدة', Icon: LampIcon },
      { href: '/nearby', label: 'قريب منك', Icon: MapPinIcon },
      { href: '/about', label: 'مين إحنا', Icon: InfoIcon },
      { href: '/contact', label: 'تواصل معانا', Icon: MessageCircleIcon },
      { href: '/help', label: 'المساعدة', Icon: HelpCircleIcon },
      { href: '/terms', label: 'الشروط', Icon: FileTextIcon },
      { href: '/privacy', label: 'الخصوصية', Icon: LockIcon },
      { href: '#share', label: 'شارك EAH مع حبايبك', Icon: SparklesIcon, isShare: true },
    ],
  },
]
