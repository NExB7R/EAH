'use client'
import './mobile-trending.css'

type SideItem = {
  id: string
  title: string
  subtitle?: string
  emoji?: string
  href: string
}

const FEATURED: SideItem[] = [
  { id: 'f1', title: 'مطبخ البلد', subtitle: 'شبين القناطر', emoji: '🍽️', href: '#' },
  { id: 'f2', title: 'صيدلية الأمان', subtitle: 'طوارئ 24س', emoji: '💊', href: '#' },
  { id: 'f3', title: 'برجر هاوس', subtitle: 'المنايل', emoji: '🍔', href: '#' },
]

const TRENDING: SideItem[] = [
  { id: 't1', title: 'برجر هاوس', subtitle: 'الأكثر زيارة', emoji: '🍔', href: '#' },
  { id: 't2', title: 'كشري التحرير', subtitle: 'ترند النهاردة', emoji: '🍲', href: '#' },
  { id: 't3', title: ' النور', subtitle: 'الأكثر طلباً', emoji: '🛒', href: '#' },
]

const NEW_BIZ: SideItem[] = [
  { id: 'n1', title: 'شاورما أحمد', subtitle: 'جديد', emoji: '🌯', href: '#' },
  { id: 'n2', title: 'قهوة الشروق', subtitle: 'جديد', emoji: '☕', href: '#' },
  { id: 'n3', title: 'حلويات نور', subtitle: 'جديد', emoji: '🍰', href: '#' },
]

export default function MobileTrending() {
  return (
    <div className="mt">
      <MTStrip title="⭐ المميز" items={FEATURED} accent="gold" />
      <MTStrip title="🔥 ترند" items={TRENDING} accent="purple" />
      <MTStrip title="🌱 جديد" items={NEW_BIZ} accent="lilac" />
    </div>
  )
}

function MTStrip({
  title,
  items,
  accent,
}: {
  title: string
  items: SideItem[]
  accent: 'gold' | 'purple' | 'lilac'
}) {
  return (
    <div className={`mt-strip mt-strip--${accent}`}>
      <h3 className="mt-strip__title">{title}</h3>
      <div className="mt-strip__track">
        {items.map((item) => (
          <a key={item.id} href={item.href} className="mt-strip__card">
            <span className="mt-strip__emoji">{item.emoji}</span>
            <span className="mt-strip__text">
              <span className="mt-strip__name">{item.title}</span>
              {item.subtitle && <span className="mt-strip__sub">{item.subtitle}</span>}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
