import { SLOGAN } from './copy'

type OrderForTemplate = {
  orderCodeV2?: string          // EAH-2609-0042
  orderCodeOld?: string          // للتوافق
  orderCode?: string              // alias للتوافق (زي orderCodeV2)
  businessName: string
  businessTrustScore?: number
  businessTrustTier?: string
  customerName: string
  customerPhone: string
  customerTrustScore?: number
  customerTrustTier?: string
  customerSuccessfulOrders?: number
  customerTotalReviews?: number
  customerReviews?: number        // alias
  customerTrustScoreLegacy?: number  // alias
  customerVerified?: boolean
  area?: string | null
  address?: string | null
  locationLabel?: string | null
  location?: { lat: number; lng: number } | null
  items?: string | null
  notes?: string | null
  voiceUrl?: string | null
  images?: string[]
  orderId?: string
}

function tierLabel(tier?: string): string {
  switch (tier) {
    case 'vip': return 'VIP'
    case 'pro': return 'محترف'
    case 'trusted': return 'موثوق'
    case 'newbie': return 'مبتدئ'
    default: return 'عادي'
  }
}

function trustStars(score?: number): string {
  if (!score) return ''
  if (score >= 90) return '⭐⭐⭐'
  if (score >= 75) return '⭐⭐'
  if (score >= 50) return '⭐'
  return ''
}

export function buildOrderMessage(o: OrderForTemplate): string {
  const lines: string[] = []
  const code = o.orderCodeV2 || o.orderCodeOld || o.orderCode || ''

  lines.push(`📦 *أوردر جديد${code ? ' ' + code : ''}*`)
  lines.push('━━━━━━━━━━━━━━━━━━')
  lines.push('')

  // ─── بيانات العميل ───
  lines.push('👤 *بيانات العميل*')
  lines.push(`• الاسم: ${o.customerName}`)
  lines.push(`• الموبايل: ${o.customerPhone}`)
  if (o.area) lines.push(`• المنطقة: ${o.area}`)
  if (o.locationLabel) lines.push(`• 📍 ${o.locationLabel}`)
  if (o.address && o.address !== o.locationLabel) lines.push(`• العنوان: ${o.address}`)
  if (o.location) {
    lines.push(`• 🗺️ الموقع: https://maps.google.com/?q=${o.location.lat},${o.location.lng}`)
  }

  // ─── Trust العميل ───
  const custTrust = o.customerTrustScore ?? o.customerTrustScoreLegacy
  if (custTrust) {
    const stars = trustStars(custTrust)
    const tier = tierLabel(o.customerTrustTier)
    lines.push('')
    lines.push(`🛡️ *مصداقية العميل* ${custTrust}/100 ${stars} (${tier})`)
    const badges: string[] = []
    if (o.customerVerified) badges.push('✅ موثّق')
    if (o.customerSuccessfulOrders) badges.push(`${o.customerSuccessfulOrders} أوردر ناجح`)
    const reviewCount = o.customerTotalReviews ?? o.customerReviews
    if (reviewCount) badges.push(`${reviewCount} تقييم`)
    if (badges.length) lines.push('• ' + badges.join(' · '))
  }

  // ─── الأوردر ───
  lines.push('')
  lines.push('🛒 *الأوردر*')
  if (o.items) {
    for (const it of o.items.split('\n')) {
      if (it.trim()) lines.push(`• ${it.trim()}`)
    }
  } else {
    lines.push('• (مفيش تفاصيل — تواصل مع العميل)')
  }

  // ─── المرفقات ───
  if (o.voiceUrl) {
    lines.push('')
    lines.push(`🎙️ *فويس نوت:* ${o.voiceUrl}`)
  }
  if (o.images && o.images.length > 0) {
    lines.push('')
    lines.push(`📸 *${o.images.length} صورة:*`)
    for (const url of o.images.slice(0, 5)) {
      lines.push(`• ${url}`)
    }
    if (o.images.length > 5) {
      lines.push(`• +${o.images.length - 5} صورة إضافية`)
    }
  }

  if (o.notes) {
    lines.push('')
    lines.push(`📝 *ملاحظات:* ${o.notes}`)
  }

  // ─── Footer ───
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━')
  lines.push(`⏱️ *عندك 10 دقايق ترد على الأوردر*`)
  lines.push('لو مردّتش، هيتم إلغاء الأوردر تلقائياً')
  lines.push('')
  lines.push('✋ رد على العميل مباشرة عشان يبدأ التجهيز')
  lines.push('')
  lines.push(`_EAH — ${SLOGAN}_`)

  return lines.join('\n')
}

export function generateOrderCode(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `${yy}${mm}${dd}-${rand}`
}

export function tierLabelPublic(tier?: string): string {
  return tierLabel(tier)
}

export function trustStarsPublic(score?: number): string {
  return trustStars(score)
}
