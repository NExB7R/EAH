// EAH Contact Channels — يقرأ من env مع fallback
export const CONTACT_CHANNELS = {
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201012892806',
    label: 'واتساب',
    channel: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || 'https://whatsapp.com/channel/eah',
  },
  facebook: {
    page: process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'https://facebook.com/eah.eg',
    label: 'فيسبوك',
  },
} as const

export function waLink(message?: string) {
  const base = `https://wa.me/${CONTACT_CHANNELS.whatsapp.number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
