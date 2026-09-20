/**
 * EAH — قنوات التواصل الرسمية
 * مرجع واحد لكل روابط EAH.
 * آخر تحديث: 2026-09-21
 */

export const CONTACT_CHANNELS = {
  whatsapp: {
    personal: 'https://wa.me/201012892806',
    channel: 'https://whatsapp.com/channel/eah',
    number: '+20 10 12892806',
    numberClean: '201012892806',
  },
  facebook: {
    page: 'https://facebook.com/eah.eg',
    username: '@eah.eg',
  },
  email: {
    official: 'owner@eah.app',
    support: 'owner@eah.app',
  },
  site: {
    url: 'https://eah-sq.vercel.app',
    domain: 'eah-sq.vercel.app',
  },
} as const

export function waLink(message?: string): string {
  const base = 'https://wa.me/201012892806'
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export const WA_MESSAGES = {
  general: 'السلام عليكم، عايز أستفسر عن EAH',
  support: 'السلام عليكم، محتاج مساعدة في EAH',
  merchant: 'السلام عليكم، عايز أسجّل نشاطي على EAH',
  report: 'السلام عليكم، عايز أبلّغ عن حاجة على EAH',
  feedback: 'السلام عليكم، عندي رأي/اقتراح لـ EAH',
} as const
