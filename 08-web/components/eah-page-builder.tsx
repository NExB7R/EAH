'use client'

import Link from 'next/link'
import type { Config } from '@puckeditor/core'
import BusinessCard from '@/components/business-card'

export type EahBusiness = {
  slug: string
  name: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  open: boolean
  badge?: string
  vibe: string[]
  reason: string
}

export type EahBlock =
  | {
      type: 'Hero'
      props: {
        eyebrow: string
        title: string
        description: string
        searchPlaceholder: string
        align: 'center' | 'start'
        density: 'airy' | 'compact'
      }
    }
  | {
      type: 'BusinessSection'
      props: {
        title: string
        subtitle: string
        variant: 'trend' | 'personalized' | 'offers' | 'new' | 'pharmacy' | 'groceries' | 'delivery'
        limit: number
        showLink: boolean
      }
    }
  | {
      type: 'CTA'
      props: {
        eyebrow: string
        title: string
        description: string
        href: string
        tone: 'purple' | 'soft'
      }
    }
  | {
      type: 'StickerBand'
      props: {
        label: string
        density: 'calm' | 'playful'
      }
    }

export type EahPageData = {
  content: EahBlock[]
  root?: Record<string, never>
}

export const defaultEahPageData: EahPageData = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero',
        eyebrow: 'شبين القناطر وما حواليها',
        title: 'اللي نفسك فيه ؟',
        description: 'اكتشف مكان مناسب ليك. وكل ما تستخدم EAH، الترشيحات تظبط أكتر على ذوقك.',
        searchPlaceholder: 'دور على مطعم، صيدلية، سوبر ماركت...',
        align: 'center',
        density: 'airy',
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'trend',
        title: 'الترند في المطاعم بيقول إيه !',
        subtitle: 'اكتشاف سريع لحاجات الناس بتتفاعل معاها',
        variant: 'trend',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'CTA',
      props: {
        id: 'recommend',
        eyebrow: 'مش عارف تختار؟',
        title: 'رشّحلي على زوقي',
        description: 'قولّي ميزانيتك ومزاجك وأنا أطلعلك كام اختيار مناسب.',
        href: '/recommend',
        tone: 'purple',
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'offers',
        title: 'العروض ع إيه !',
        subtitle: 'عروض متجددة من الأماكن اللي تهمك',
        variant: 'offers',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'new',
        title: 'جرب الجديد',
        subtitle: 'مشاريع وأماكن لسه طالعة للنور',
        variant: 'new',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'pharmacy',
        title: 'ناقصك إيه من الصيدلية ؟',
        subtitle: 'اختيارات قريبة وسريعة وقت ما تحتاج',
        variant: 'pharmacy',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'groceries',
        title: 'البيت محتاج إيه ؟',
        subtitle: 'مقاضيك من غير لَف كتير',
        variant: 'groceries',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'BusinessSection',
      props: {
        id: 'delivery',
        title: 'الطلب هيطير إزاي ؟',
        subtitle: 'مكاتب توصيل حسب نطاق التغطية',
        variant: 'delivery',
        limit: 4,
        showLink: true,
      },
    },
    {
      type: 'StickerBand',
      props: {
        id: 'stickers',
        label: 'كل اللي نفسك فيه في مكان واحد',
        density: 'calm',
      },
    },
  ],
}

function sectionIcon(variant: EahBlock['props'] extends infer _ ? never : never) {
  return ''
}

const trendItems = [
  { title: 'كومبو الغدا', meta: '🔥 الناس بتتفاعل معاه', vibe: 'مزاج الغدا' },
  { title: 'وجبة فردي', meta: '⚡ اختيار سريع', vibe: 'سريع' },
  { title: 'منيو جديد', meta: '👀 لسه نازل', vibe: 'جديد' },
  { title: 'عرض العيلة', meta: '❤️ مناسب للبيت', vibe: 'لمة' },
]

function HeroBlock({ props, editor = false }: { props: Extract<EahBlock, { type: 'Hero' }>['props']; editor?: boolean }) {
  return (
    <section className={`hero hero--${props.density} hero--${props.align}`} data-editor-section="hero">
      <span className="hero-logo" aria-label="EAH">EAH<span className="brand-bang" aria-hidden="true">!</span></span>
      <div className="eyebrow">{props.eyebrow}</div>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <div className="search" role="search">
        <input aria-label="ابحث" placeholder={props.searchPlaceholder} readOnly={editor} />
        <button className="primary" type="button">ابحث</button>
      </div>
      <div className="intent-row">
        <span className="intent-chip active">🍔 أكل</span>
        <span className="intent-chip">💊 صيدلية</span>
        <span className="intent-chip">🛒 مقاضي</span>
        <span className="intent-chip">📦 توصيل</span>
      </div>
    </section>
  )
}

function BusinessSectionBlock({ props, businesses }: { props: Extract<EahBlock, { type: 'BusinessSection' }>['props']; businesses: EahBusiness[] }) {
  const selected = businesses.slice(0, Math.max(1, Math.min(props.limit || 4, 8)))
  const isTrend = props.variant === 'trend'

  return (
    <section className={`section editor-section editor-section--${props.variant}`} data-editor-section={props.variant}>
      <div className="section-head">
        <div>
          <h2>{props.title}</h2>
          <span>{props.subtitle}</span>
        </div>
        {props.showLink && <Link href="/explore">شوف الكل ←</Link>}
      </div>
      {isTrend ? (
        <div className="trend-grid">
          {trendItems.slice(0, props.limit).map((item) => (
            <article className="trend-card" key={item.title}>
              <span className="badge">{item.vibe}</span>
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
              <span className="trend-link">شوف ليه الناس بتتكلم عنه →</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid">
          {selected.map((business) => <BusinessCard business={business} key={business.slug} />)}
        </div>
      )}
    </section>
  )
}

function CtaBlock({ props }: { props: Extract<EahBlock, { type: 'CTA' }>['props'] }) {
  return (
    <Link className={`recommend-card recommend-card--${props.tone}`} href={props.href} data-editor-section="cta">
      <div>
        <span className="eyebrow">{props.eyebrow}</span>
        <h3>{props.title}</h3>
        <p>{props.description}</p>
      </div>
      <span className="arrow">←</span>
    </Link>
  )
}

function StickerBandBlock({ props }: { props: Extract<EahBlock, { type: 'StickerBand' }>['props'] }) {
  return (
    <section className={`sticker-band sticker-band--${props.density}`} aria-label={props.label}>
      <span>🍔</span><span>💊</span><span>🛒</span><span>📦</span><strong>{props.label}</strong><span>✦</span><span>🥤</span><span>✨</span>
    </section>
  )
}

export function EahPageRenderer({ data, businesses, editor = false }: { data: EahPageData; businesses: EahBusiness[]; editor?: boolean }) {
  return (
    <div className="eah-page-builder">
      {data.content.map((block, index) => {
        const key = String(block.props.id || `${block.type}-${index}`)
        switch (block.type) {
          case 'Hero': return <HeroBlock key={key} props={block.props} editor={editor} />
          case 'BusinessSection': return <BusinessSectionBlock key={key} props={block.props} businesses={businesses} />
          case 'CTA': return <CtaBlock key={key} props={block.props} />
          case 'StickerBand': return <StickerBandBlock key={key} props={block.props} />
          default: return null
        }
      })}
    </div>
  )
}

export function createEahPuckConfig(businesses: EahBusiness[]): Config {
  return {
    categories: {
      EAH: {
        title: 'EAH',
        components: ['Hero', 'BusinessSection', 'CTA', 'StickerBand'],
      },
    },
    components: {
      Hero: {
        fields: {
          eyebrow: { type: 'text', label: 'السطر الصغير', contentEditable: true },
          title: { type: 'text', label: 'العنوان', contentEditable: true },
          description: { type: 'textarea', label: 'الوصف' },
          searchPlaceholder: { type: 'text', label: 'نص البحث' },
          align: {
            type: 'select',
            label: 'المحاذاة',
            options: [
              { label: 'منتصف', value: 'center' },
              { label: 'بداية', value: 'start' },
            ],
          },
          density: {
            type: 'select',
            label: 'المساحة',
            options: [
              { label: 'واسعة', value: 'airy' },
              { label: 'مضغوطة', value: 'compact' },
            ],
          },
        },
        defaultProps: defaultEahPageData.content[0].props,
        render: (props) => <HeroBlock props={props as Extract<EahBlock, { type: 'Hero' }>['props']} editor />,
      },
      BusinessSection: {
        fields: {
          title: { type: 'text', label: 'عنوان القسم', contentEditable: true },
          subtitle: { type: 'text', label: 'الوصف' },
          variant: {
            type: 'select',
            label: 'نوع القسم',
            options: [
              { label: 'ترند مطاعم', value: 'trend' },
              { label: 'على ذوقك', value: 'personalized' },
              { label: 'عروض', value: 'offers' },
              { label: 'جرب الجديد', value: 'new' },
              { label: 'صيدلية', value: 'pharmacy' },
              { label: 'مقاضي', value: 'groceries' },
              { label: 'توصيل', value: 'delivery' },
            ],
          },
          limit: { type: 'number', label: 'عدد الكروت', min: 1, max: 8 },
          showLink: { type: 'select', label: 'إظهار شوف الكل', options: [{ label: 'نعم', value: true }, { label: 'لا', value: false }] },
        },
        defaultProps: defaultEahPageData.content[1].props,
        render: (props) => <BusinessSectionBlock props={props as Extract<EahBlock, { type: 'BusinessSection' }>['props']} businesses={businesses} />,
      },
      CTA: {
        fields: {
          eyebrow: { type: 'text', label: 'السطر الصغير', contentEditable: true },
          title: { type: 'text', label: 'العنوان', contentEditable: true },
          description: { type: 'textarea', label: 'الوصف' },
          href: { type: 'text', label: 'الرابط' },
          tone: { type: 'select', label: 'الستايل', options: [{ label: 'بنفسجي', value: 'purple' }, { label: 'هادئ', value: 'soft' }] },
        },
        defaultProps: defaultEahPageData.content[2].props,
        render: (props) => <CtaBlock props={props as Extract<EahBlock, { type: 'CTA' }>['props']} />,
      },
      StickerBand: {
        fields: {
          label: { type: 'text', label: 'النص', contentEditable: true },
          density: { type: 'select', label: 'الكثافة', options: [{ label: 'هادية', value: 'calm' }, { label: 'مرحة', value: 'playful' }] },
        },
        defaultProps: defaultEahPageData.content[8].props,
        render: (props) => <StickerBandBlock props={props as Extract<EahBlock, { type: 'StickerBand' }>['props']} />,
      },
    },
    root: {
      fields: {},
      render: ({ children }) => <div className="container eah-editor-canvas">{children}</div>,
    },
  }
}
