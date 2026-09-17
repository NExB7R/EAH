import { SLOGAN } from './copy'

type OrderForTemplate = {
  orderCode?: string
  businessName: string
  customerName: string
  customerPhone: string
  customerProfilePhone?: string | null
  area?: string | null
  address?: string | null
  items?: string | null
  notes?: string | null
  orderId?: string
  customerTrustScore?: number
  customerVerified?: boolean
  customerReviews?: number
}

export function buildOrderMessage(o: OrderForTemplate): string {
  const lines: string[] = []
  lines.push(`👑 *EAH* — ${SLOGAN}`)
  lines.push('━━━━━━━━━━━━━━━━━━')
  lines.push(`📢 *أوردر جديد${o.orderCode ? ' #' + o.orderCode : ''}*`)
  lines.push('')
  lines.push(` النشاط: ${o.businessName}`)
  lines.push('')
  lines.push('👤 *بيانات العميل*')
  lines.push(`• الاسم: ${o.customerName}`)
  lines.push(`• الموبايل: ${o.customerPhone}`)
  if (o.area) lines.push(`• المنطقة: ${o.area}`)
  if (o.address) lines.push(`• العنوان: ${o.address}`)
  if (o.customerVerified || o.customerTrustScore || o.customerReviews) {
    lines.push('')
    lines.push('*بروفايل العميل على EAH*')
    if (o.customerVerified) lines.push('• موثّق')
    if (o.customerTrustScore) lines.push(`• Trust Score: ${o.customerTrustScore}`)
    if (o.customerReviews) lines.push(`• ${o.customerReviews} تقييم`)
  }
  lines.push('')
  lines.push('📦 *الأوردر*')
  if (o.items) {
    for (const it of o.items.split('\n')) {
      if (it.trim()) lines.push(`• ${it.trim()}`)
    }
  } else {
    lines.push('• (مفيش تفاصيل — تواصل مع العميل)')
  }
  if (o.notes) {
    lines.push('')
    lines.push(` *ملاحظات:* ${o.notes}`)
  }
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━')
  lines.push('✋ *لما تستلم الأوردر، رد على العميل مباشرة.*')
  lines.push('EAH — اللي نفسك فيه ؟')
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
