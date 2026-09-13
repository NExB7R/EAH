import { z } from 'zod'

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office'] as const

export const businessSchema = z.object({
  name: z.string().trim().min(2, 'الاسم لازم يكون حرفين على الأقل').max(80, 'الاسم طويل جدًا'),
  slug: z
    .string()
    .trim()
    .min(2, 'الـ slug مطلوب')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'الـ slug يقبل حروف إنجليزية صغيرة وأرقام وشرطات فقط'),
  business_type: z.enum(VALID_TYPES, { message: 'اختار نوع صحيح' }),
  area: z.string().trim().min(2, 'المنطقة مطلوبة').max(60),
  city: z.string().trim().min(2).max(60).default('شبين القناطر'),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v && v.length > 0 ? v : null)),
  hook: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => (v && v.length > 0 ? v : null)),
  address_text: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v && v.length > 0 ? v : null)),
  phone: z.string().trim().max(20).optional().or(z.literal('')).transform((v) => (v && v.length > 0 ? v : null)),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')).transform((v) => (v && v.length > 0 ? v : null)),
  is_open: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
})

export type BusinessInput = z.input<typeof businessSchema>
export type BusinessData = z.output<typeof businessSchema>
export const BUSINESS_TYPES = VALID_TYPES
