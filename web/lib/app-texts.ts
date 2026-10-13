// ═══════════════════════════════════════════════════════════
// EAH — App Texts (Shared Client + Server)
// النصوص القابلة للتعديل من الاستوديو
// ═══════════════════════════════════════════════════════════

export type AppTexts = {
  hero_hook_line_1: string
  hero_hook_line_2: string
  hero_sign: string
  hero_slogan: string
  footer_copyright: string
  footer_tagline: string
}

export const DEFAULT_TEXTS: AppTexts = {
  hero_hook_line_1: 'شبيك لبيك',
  hero_hook_line_2: 'كل حاجة حواليك',
  hero_sign: 'دولة شبين القناطر تتحدث',
  hero_slogan: 'اللي نفسك فيه ؟',
  footer_copyright: 'حقوق النشر محفوظة © 2026 EAH',
  footer_tagline: 'من قلب شبين القناطر — فلسطين في القلب 🇵🇸',
}

export const TEXT_META: Record<
  keyof AppTexts,
  { label: string; desc: string; maxLength: number; group: 'hero' | 'footer' }
> = {
  hero_hook_line_1: {
    label: 'الهوك — السطر الأول',
    desc: 'يظهر في الـ Hero بحجم كبير',
    maxLength: 40,
    group: 'hero',
  },
  hero_hook_line_2: {
    label: 'الهوك — السطر الثاني',
    desc: 'يظهر في الـ Hero بحجم كبير',
    maxLength: 40,
    group: 'hero',
  },
  hero_sign: {
    label: 'لافتة الهيرو',
    desc: 'النص اللي فوق الهوك',
    maxLength: 60,
    group: 'hero',
  },
  hero_slogan: {
    label: 'السلوغان',
    desc: 'يظهر تحت اللوجو',
    maxLength: 40,
    group: 'hero',
  },
  footer_copyright: {
    label: 'حقوق النشر',
    desc: 'يظهر في أسفل الفوتر',
    maxLength: 100,
    group: 'footer',
  },
  footer_tagline: {
    label: 'سطر الفوتر المميز',
    desc: 'يظهر فوق الحقوق',
    maxLength: 100,
    group: 'footer',
  },
}
