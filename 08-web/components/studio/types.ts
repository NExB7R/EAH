export type SectionType =
  | 'hero'
  | 'featured'
  | 'trending'
  | 'offers'
  | 'categories'
  | 'cta'
  | 'banner'
  | 'footer'

export type Section = {
  id: string
  type: SectionType
  visible: boolean
  props: Record<string, unknown>
}

export type Theme = {
  primaryColor: string
  bgColor: string
  fontFamily: string
}

export type DesignData = {
  theme: Theme
  sections: Section[]
}

export const SECTION_LABELS: Record<SectionType, { label: string; emoji: string }> = {
  hero:       { label: 'Hero',       emoji: '🎯' },
  featured:   { label: 'المميز',     emoji: '' },
  trending:   { label: 'الترند',     emoji: '' },
  offers:     { label: 'العروض',     emoji: '' },
  categories: { label: 'التصنيفات',  emoji: '📂' },
  cta:        { label: 'CTA',        emoji: '📣' },
  banner:     { label: 'بانر',       emoji: '' },
  footer:     { label: 'الفوتر',     emoji: '🔻' },
}

export function makeId(): string {
  return 's_' + Math.random().toString(36).slice(2, 10)
}

export function defaultProps(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return {
        title: 'اللي نفسك فيه ؟',
        subtitle: 'جمهورية شبين القناطر تتحدث...',
        ctaText: 'اكتشف',
        ctaHref: '/explore',
        align: 'center',
        showSearch: true,
      }
    case 'featured':
      return { title: 'المميز', subtitle: 'أماكن تستاهل', count: 6 }
    case 'trending':
      return { title: 'الترند', subtitle: 'الناس بتدور عليها', count: 6 }
    case 'offers':
      return { title: 'العروض', subtitle: 'خصومات على الآخر', count: 4 }
    case 'categories':
      return {
        title: 'بتدور على إيه؟',
        items: [
          { emoji: '️', label: 'مطاعم' },
          { emoji: '', label: 'صيدليات' },
          { emoji: '', label: 'توصيل' },
        ],
      }
    case 'cta':
      return {
        title: 'سجل وخلّي حسابك يستفيد',
        subtitle: 'احتفظ بالمفضلة، تابع العروض، واكسب نقاط',
        ctaText: 'سجّل بسرعة',
        ctaHref: '/auth',
      }
    case 'banner':
      return {
        text: 'قريبًا: تتبع طلبك مباشر',
        color: '#A855F7',
      }
    case 'footer':
      return {
        tagline: 'جمهورية شبين القناطر تتحدث...',
        copyright: '© 2026 EAH',
      }
  }
}

export function defaultDesign(): DesignData {
  return {
    theme: {
      primaryColor: '#A855F7',
      bgColor: '#07060B',
      fontFamily: 'Cairo',
    },
    sections: [
      { id: makeId(), type: 'hero', visible: true, props: defaultProps('hero') },
      { id: makeId(), type: 'categories', visible: true, props: defaultProps('categories') },
      { id: makeId(), type: 'featured', visible: true, props: defaultProps('featured') },
      { id: makeId(), type: 'trending', visible: true, props: defaultProps('trending') },
      { id: makeId(), type: 'offers', visible: true, props: defaultProps('offers') },
      { id: makeId(), type: 'cta', visible: true, props: defaultProps('cta') },
      { id: makeId(), type: 'footer', visible: true, props: defaultProps('footer') },
    ],
  }
}
