import { z } from 'zod'

const VALID_TYPES = ['restaurant', 'pharmacy', 'delivery_office'] as const

export const businessSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير').max(80),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, 'حروف إنجليزية صغيرة وأرقام وشرطات فقط'),
  business_type: z.enum(VALID_TYPES, { message: 'اختار نوع' }),
  area: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60).default('شبين القناطر'),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v || null),
  hook: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => v || null),
  address_text: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => v || null),
  map_url: z.string().trim().url('رابط غير صحيح').optional().or(z.literal('')).transform((v) => v || null),
  cover_image_url: z.string().trim().optional().or(z.literal('')).transform((v) => v || null),
  gallery_json: z.string().optional().default('[]'),
  menu_json: z.string().optional().default('[]'),
  working_hours_json: z.string().optional().default('{}'),
  contacts_json: z.string().optional().default('[]'),
  is_open: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
})

export type BusinessInput = z.input<typeof businessSchema>
export type BusinessData = z.output<typeof businessSchema>
export const BUSINESS_TYPES = VALID_TYPES

export type Contact = {
  method_type: 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'email'
  value: string
  is_primary: boolean
}

export type WorkingHours = Record<string, { open: string; close: string; closed: boolean }>

export function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T } catch { return fallback }
}
