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

type ThemeProps = {
  background: string
  surface: string
  accent: string
  accentStrong: string
  text: string
  muted: string
  maxWidth: number
  sectionGap: number
  radius: number
  stickerOpacity: number
  showStickers: boolean
}

type EahBlock =
  | { type: 'Branding'; props: { tagline: string; title: string; showBang: boolean; glow: number } }
  | { type: 'Hero'; props: { eyebrow: string; title: string; description: string; searchPlaceholder: string; align: 'center' | 'start'; density: 'airy' | 'compact' } }
  | { type: 'BusinessSection'; props: { title: string; subtitle: string; variant: 'trend' | 'personalized' | 'offers' | 'new' | 'pharmacy' | 'groceries' | 'delivery'; limit: number; showLink: boolean; tone: 'default' | 'accent' | 'spotlight' | 'soft' } }
  | { type: 'CTA'; props: { eyebrow: string; title: string; description: string; href: string; tone: 'purple' | 'soft' } }
  | { type: 'Text'; props: { text: string; size: number; weight: '400' | '700' | '900'; align: 'right' | 'center' | 'left'; tone: 'text' | 'muted' | 'accent' } }
  | { type: 'Button'; props: { label: string; href: string; variant: 'primary' | 'ghost'; size: 'sm' | 'md' | 'lg' } }
  | { type: 'Image'; props: { src: string; alt: string; height: number; radius: number; fit: 'cover' | 'contain' } }
  | { type: 'StickerCloud'; props: { density: 'calm' | 'playful'; opacity: number; speed: 'slow' | 'off'; icons: string[] } }
  | { type: 'Spacer'; props: { height: number } }
  | { type: 'Divider'; props: { tone: 'soft' | 'accent'; width: number } }
  | { type: 'CardGrid'; props: { title: string; subtitle: string; columns: 1 | 2 | 3 | 4; gap: number; tone: 'default' | 'purple' } }

export type EahPageData = { content: EahBlock[]; root?: { props?: Partial<ThemeProps> } }

export const defaultEahPageData: EahPageData = {
  root: { props: { background: '#07060B', surface: 'rgba(255,255,255,.045)', accent: '#8B5CF6', accentStrong: '#A855F7', text: '#F4F2FA', muted: '#A29DB5', maxWidth: 1120, sectionGap: 28, radius: 20, stickerOpacity: .12, showStickers: true } },
  content: [
    { type: 'Branding', props: { id: 'brand', tagline: 'اللي نفسك فيه ؟', title: 'EAH', showBang: true, glow: 1 } },
    { type: 'Hero', props: { id: 'hero', eyebrow: 'شبين القناطر وما حواليها', title: 'اللي نفسك فيه ؟', description: 'اكتشف اللي مناسب ليك. وكل ما تستخدم EAH، الترشيحات تظبط أكتر على ذوقك.', searchPlaceholder: 'دور على مطعم، صيدلية، سوبر ماركت...', align: 'center', density: 'airy' } },
    { type: 'BusinessSection', props: { id: 'trend', title: 'الترند في المطاعم بيقول إيه !', subtitle: 'حاجات الناس بتتفاعل معاها دلوقتي', variant: 'trend', limit: 4, showLink: true, tone: 'spotlight' } },
    { type: 'CTA', props: { id: 'recommend', eyebrow: 'مش عارف تختار؟', title: 'رشّحلي على زوقي', description: 'قولّي ميزانيتك ومزاجك وأنا أطلعلك كام اختيار مناسب.', href: '/recommend', tone: 'purple' } },
    { type: 'BusinessSection', props: { id: 'offers', title: 'العروض ع إيه !', subtitle: 'عروض متجددة من الأماكن اللي تهمك', variant: 'offers', limit: 4, showLink: true, tone: 'accent' } },
    { type: 'BusinessSection', props: { id: 'new', title: 'جرب الجديد', subtitle: 'مشاريع وأماكن لسه طالعة للنور', variant: 'new', limit: 4, showLink: true, tone: 'default' } },
    { type: 'BusinessSection', props: { id: 'pharmacy', title: 'ناقصك إيه من الصيدلية ؟', subtitle: 'اختيارات قريبة وسريعة وقت ما تحتاج', variant: 'pharmacy', limit: 4, showLink: true, tone: 'soft' } },
    { type: 'BusinessSection', props: { id: 'groceries', title: 'البيت محتاج إيه ؟', subtitle: 'مقاضيك من غير لَف كتير', variant: 'groceries', limit: 4, showLink: true, tone: 'soft' } },
    { type: 'BusinessSection', props: { id: 'delivery', title: 'الطلب هيطير إزاي ؟', subtitle: 'مكاتب توصيل حسب نطاق التغطية', variant: 'delivery', limit: 4, showLink: true, tone: 'soft' } },
    { type: 'StickerCloud', props: { id: 'stickers', density: 'calm', opacity: .12, speed: 'slow', icons: ['🍔','🥤','🍟','💊','🧴','🛒','📦','✦','✨','🍕','☕','🏪','🥡','🛵'] } },
  ],
}

const trendItems = [
  { title: 'كومبو الغدا', meta: '🔥 الناس بتتفاعل معاه', vibe: 'مزاج الغدا' },
  { title: 'وجبة فردي', meta: '⚡ اختيار سريع', vibe: 'سريع' },
  { title: 'منيو جديد', meta: '👀 لسه نازل', vibe: 'جديد' },
  { title: 'عرض العيلة', meta: '❤️ مناسب للبيت', vibe: 'لمة' },
]

function BrandingBlock({ props }: { props: Extract<EahBlock, { type:'Branding' }>['props'] }) {
  return <section className="eah-branding-block" style={{ ['--eah-glow' as string]: props.glow }}><div className="eah-mark"><span>{props.title}</span>{props.showBang && <b>!</b>}</div><div className="eah-brand-tagline">{props.tagline}</div></section>
}

function HeroBlock({ props, editor = false }: { props: Extract<EahBlock, { type:'Hero' }>['props']; editor?: boolean }) {
  return <section className={`hero hero--${props.density} hero--${props.align}`}><div className="hero-logo">EAH<span className="brand-bang">!</span></div><div className="eyebrow">{props.eyebrow}</div><h1>{props.title}</h1><p>{props.description}</p><div className="search"><input aria-label="بحث" placeholder={props.searchPlaceholder} readOnly={editor}/><button className="primary" type="button">ابحث</button></div><div className="intent-row"><span className="intent-chip active">🍔 أكل</span><span className="intent-chip">💊 صيدلية</span><span className="intent-chip">🛒 مقاضي</span><span className="intent-chip">📦 توصيل</span></div></section>
}

function BusinessSectionBlock({ props, businesses }: { props: Extract<EahBlock, { type:'BusinessSection' }>['props']; businesses:EahBusiness[] }) {
  const selected = businesses.slice(0, Math.max(1, Math.min(props.limit || 4, 8)))
  return <section className={`section editor-section tone-${props.tone}`}><div className="section-head"><div><h2>{props.title}</h2><span>{props.subtitle}</span></div>{props.showLink && <Link href="/explore">شوف الكل ←</Link>}</div>{props.variant === 'trend' ? <div className="trend-grid">{trendItems.slice(0,props.limit).map(item => <article className="trend-card" key={item.title}><span className="badge">{item.vibe}</span><h3>{item.title}</h3><p>{item.meta}</p><span className="trend-link">شوف ليه الناس بتتكلم عنه →</span></article>)}</div> : <div className="grid">{selected.map(b => <BusinessCard business={b} key={b.slug}/>)}</div>}</section>
}

function CtaBlock({ props }: { props: Extract<EahBlock, { type:'CTA' }>['props'] }) { return <Link className={`recommend-card recommend-card--${props.tone}`} href={props.href}><div><span className="eyebrow">{props.eyebrow}</span><h3>{props.title}</h3><p>{props.description}</p></div><span className="arrow">←</span></Link> }
function TextBlock({ props }: { props: Extract<EahBlock, { type:'Text' }>['props'] }) { return <p style={{fontSize:props.size,fontWeight:Number(props.weight),textAlign:props.align,color:props.tone==='accent'?'var(--accent-strong)':props.tone==='muted'?'var(--muted)':'var(--text)',margin:'0 0 12px'}}>{props.text}</p> }
function ButtonBlock({ props }: { props: Extract<EahBlock, { type:'Button' }>['props'] }) { return <Link className={`${props.variant==='primary'?'primary':'ghost-btn'} btn-${props.size}`} href={props.href}>{props.label}</Link> }
function ImageBlock({ props }: { props: Extract<EahBlock, { type:'Image' }>['props'] }) { return <img src={props.src} alt={props.alt} style={{width:'100%',height:props.height,borderRadius:props.radius,objectFit:props.fit,display:'block'}}/> }
function StickerCloudBlock({ props }: { props: Extract<EahBlock, { type:'StickerCloud' }>['props'] }) { return <div className={`sticker-cloud sticker-cloud--${props.density} sticker-cloud--${props.speed}`} style={{opacity:props.opacity}} aria-hidden>{props.icons.slice(0,18).map((icon,i)=><span key={`${icon}-${i}`} style={{['--i' as string]:i}}>{icon}</span>)}</div> }
function SpacerBlock({ props }: { props: Extract<EahBlock, { type:'Spacer' }>['props'] }) { return <div style={{height:props.height}} aria-hidden/> }
function DividerBlock({ props }: { props: Extract<EahBlock, { type:'Divider' }>['props'] }) { return <div style={{height:1,width:`${Math.min(100,Math.max(10,props.width))}%`,margin:'24px auto',background:props.tone==='accent'?'linear-gradient(90deg,transparent,var(--accent),transparent)':'var(--border)'}}/> }
function CardGridBlock({ props }: { props: Extract<EahBlock, { type:'CardGrid' }>['props'] }) { return <section className={`designer-grid tone-${props.tone}`}><div className="section-head"><div><h2>{props.title}</h2><span>{props.subtitle}</span></div></div><div className="designer-grid-inner" style={{gridTemplateColumns:`repeat(${props.columns},minmax(0,1fr))`,gap:props.gap}}>{Array.from({length:props.columns},(_,i)=><div className="designer-placeholder-card" key={i}><span>EAH</span><b>مساحة تصميم {i+1}</b></div>)}</div></section> }

export function EahPageRenderer({ data, businesses, editor=false }: { data:EahPageData; businesses:EahBusiness[]; editor?:boolean }) {
  const theme = {...(defaultEahPageData.root?.props as ThemeProps), ...(data.root?.props || {})}
  return <main className="eah-design-root" style={{'--eah-bg':theme.background,'--eah-surface':theme.surface,'--accent':theme.accent,'--accent-strong':theme.accentStrong,'--text':theme.text,'--muted':theme.muted,'--eah-max':`${theme.maxWidth}px`,'--eah-gap':`${theme.sectionGap}px`,'--radius':`${theme.radius}px`} as React.CSSProperties}>{theme.showStickers && <StickerCloudBlock props={{density:'calm',opacity:theme.stickerOpacity,speed:'slow',icons:defaultEahPageData.content.find(b=>b.type==='StickerCloud')?.props.icons || []}}/>}<div className="eah-design-inner">{data.content.map((block,index)=>{const key=String((block.props as any).id || `${block.type}-${index}`);switch(block.type){case 'Branding':return <BrandingBlock key={key} props={block.props}/>;case 'Hero':return <HeroBlock key={key} props={block.props} editor={editor}/>;case 'BusinessSection':return <BusinessSectionBlock key={key} props={block.props} businesses={businesses}/>;case 'CTA':return <CtaBlock key={key} props={block.props}/>;case 'Text':return <TextBlock key={key} props={block.props}/>;case 'Button':return <ButtonBlock key={key} props={block.props}/>;case 'Image':return <ImageBlock key={key} props={block.props}/>;case 'StickerCloud':return <StickerCloudBlock key={key} props={block.props}/>;case 'Spacer':return <SpacerBlock key={key} props={block.props}/>;case 'Divider':return <DividerBlock key={key} props={block.props}/>;case 'CardGrid':return <CardGridBlock key={key} props={block.props}/>;default:return null}})}</div></main>
}

export function createEahPuckConfig(businesses:EahBusiness[]): Config {
  return {
    categories:{EAH:{title:'EAH',components:['Branding','Hero','BusinessSection','CTA','Text','Button','Image','StickerCloud','Spacer','Divider','CardGrid']}},
    root:{
      fields:{
        background:{type:'text',label:'خلفية الصفحة HEX'}, surface:{type:'text',label:'سطح الكروت'}, accent:{type:'text',label:'البنفسجي الأساسي'}, accentStrong:{type:'text',label:'البنفسجي الساطع'}, text:{type:'text',label:'لون النص'}, muted:{type:'text',label:'النص الهادئ'}, maxWidth:{type:'number',label:'أقصى عرض',min:720,max:1600}, sectionGap:{type:'number',label:'المسافة بين الأقسام',min:8,max:120}, radius:{type:'number',label:'استدارة الحواف',min:0,max:48}, stickerOpacity:{type:'number',label:'شفافية الخلفية',min:0,max:1,step:.01}, showStickers:{type:'radio',label:'خلفية الستيكرز',options:[{label:'تشغيل',value:true},{label:'إيقاف',value:false}]}
      },
      defaultProps: defaultEahPageData.root?.props,
      render:({children})=><div className="eah-puck-root-preview">{children}</div>
    },
    components:{
      Branding:{fields:{tagline:{type:'text',label:'التاج لاين',contentEditable:true},title:{type:'text',label:'اسم البراند'},showBang:{type:'radio',label:'علامة التعجب',options:[{label:'نعم',value:true},{label:'لا',value:false}]},glow:{type:'number',label:'قوة اللمعة',min:0,max:2,step:.1}},defaultProps:(defaultEahPageData.content[0] as any).props,render:(props)=><BrandingBlock props={props as any}/>},
      Hero:{fields:{eyebrow:{type:'text',label:'السطر الصغير',contentEditable:true},title:{type:'text',label:'العنوان',contentEditable:true},description:{type:'textarea',label:'الوصف'},searchPlaceholder:{type:'text',label:'نص البحث'},align:{type:'select',label:'المحاذاة',options:[{label:'منتصف',value:'center'},{label:'بداية',value:'start'}]},density:{type:'select',label:'المساحة',options:[{label:'واسعة',value:'airy'},{label:'مضغوطة',value:'compact'}]}},defaultProps:(defaultEahPageData.content[1] as any).props,render:(props)=><HeroBlock props={props as any} editor/>},
      BusinessSection:{fields:{title:{type:'text',label:'عنوان القسم',contentEditable:true},subtitle:{type:'text',label:'الوصف'},variant:{type:'select',label:'نوع القسم',options:[{label:'ترند مطاعم',value:'trend'},{label:'على ذوقك',value:'personalized'},{label:'عروض',value:'offers'},{label:'جرب الجديد',value:'new'},{label:'صيدلية',value:'pharmacy'},{label:'مقاضي',value:'groceries'},{label:'توصيل',value:'delivery'}]},limit:{type:'number',label:'عدد الكروت',min:1,max:8},showLink:{type:'radio',label:'شوف الكل',options:[{label:'نعم',value:true},{label:'لا',value:false}]},tone:{type:'select',label:'شكل القسم',options:[{label:'عادي',value:'default'},{label:'بنفسجي',value:'accent'},{label:'مميز',value:'spotlight'},{label:'هادئ',value:'soft'}]}},defaultProps:(defaultEahPageData.content[2] as any).props,render:(props)=><BusinessSectionBlock props={props as any} businesses={businesses}/>},
      CTA:{fields:{eyebrow:{type:'text',label:'السطر الصغير',contentEditable:true},title:{type:'text',label:'العنوان',contentEditable:true},description:{type:'textarea',label:'الوصف'},href:{type:'text',label:'الرابط'},tone:{type:'select',label:'الستايل',options:[{label:'بنفسجي',value:'purple'},{label:'هادئ',value:'soft'}]}},defaultProps:(defaultEahPageData.content[3] as any).props,render:(props)=><CtaBlock props={props as any}/>},
      Text:{fields:{text:{type:'text',label:'النص',contentEditable:true},size:{type:'number',label:'الحجم',min:10,max:160},weight:{type:'select',label:'السُمك',options:[{label:'عادي',value:'400'},{label:'عريض',value:'700'},{label:'ثقيل',value:'900'}]},align:{type:'select',label:'المحاذاة',options:[{label:'يمين',value:'right'},{label:'منتصف',value:'center'},{label:'شمال',value:'left'}]},tone:{type:'select',label:'اللون',options:[{label:'أساسي',value:'text'},{label:'هادئ',value:'muted'},{label:'بنفسجي',value:'accent'}]}},defaultProps:{text:'اكتب هنا',size:24,weight:'700',align:'right',tone:'text'},render:(props)=><TextBlock props={props as any}/>},
      Button:{fields:{label:{type:'text',label:'نص الزر',contentEditable:true},href:{type:'text',label:'الرابط'},variant:{type:'select',label:'الشكل',options:[{label:'أساسي',value:'primary'},{label:'هادئ',value:'ghost'}]},size:{type:'select',label:'الحجم',options:[{label:'صغير',value:'sm'},{label:'متوسط',value:'md'},{label:'كبير',value:'lg'}]}},defaultProps:{label:'ابدأ',href:'#',variant:'primary',size:'md'},render:(props)=><ButtonBlock props={props as any}/>},
      Image:{fields:{src:{type:'text',label:'رابط الصورة'},alt:{type:'text',label:'وصف الصورة'},height:{type:'number',label:'الارتفاع',min:80,max:900},radius:{type:'number',label:'الاستدارة',min:0,max:48},fit:{type:'select',label:'العرض',options:[{label:'تغطية',value:'cover'},{label:'داخل',value:'contain'}]}},defaultProps:{src:'',alt:'EAH',height:320,radius:20,fit:'cover'},render:(props)=><ImageBlock props={props as any}/>},
      StickerCloud:{fields:{density:{type:'select',label:'الكثافة',options:[{label:'هادية',value:'calm'},{label:'مرحة',value:'playful'}]},opacity:{type:'number',label:'الشفافية',min:0,max:1,step:.01},speed:{type:'select',label:'الحركة',options:[{label:'بطيئة',value:'slow'},{label:'ثابتة',value:'off'}]},icons:{type:'array',label:'الستيكرز',arrayFields:{icon:{type:'text',label:'ستيكر'}}}},defaultProps:(defaultEahPageData.content[9] as any).props,render:(props)=><StickerCloudBlock props={props as any}/>},
      Spacer:{fields:{height:{type:'number',label:'الارتفاع',min:0,max:600}},defaultProps:{height:48},render:(props)=><SpacerBlock props={props as any}/>},
      Divider:{fields:{tone:{type:'select',label:'النوع',options:[{label:'هادئ',value:'soft'},{label:'بنفسجي',value:'accent'}]},width:{type:'number',label:'العرض',min:10,max:100}},defaultProps:{tone:'soft',width:100},render:(props)=><DividerBlock props={props as any}/>},
      CardGrid:{fields:{title:{type:'text',label:'عنوان الشبكة'},subtitle:{type:'text',label:'الوصف'},columns:{type:'select',label:'الأعمدة',options:[1,2,3,4].map(v=>({label:String(v),value:v}))},gap:{type:'number',label:'المسافة',min:4,max:40},tone:{type:'select',label:'الستايل',options:[{label:'عادي',value:'default'},{label:'بنفسجي',value:'purple'}]}},defaultProps:{title:'شبكة جديدة',subtitle:'منطقة تصميم قابلة للتخصيص',columns:4,gap:12,tone:'purple'},render:(props)=><CardGridBlock props={props as any}/>} 
    }
  }
}
