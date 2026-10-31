import { z } from 'zod'
import { AREAS } from '@/lib/data/areas'

const AREAS_LIST = AREAS as unknown as [string, ...string[]]

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Validation (Full Control)
// 8 أقسام — كل قسم Zod schema منفصل
// ═══════════════════════════════════════════════════════════

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => !v || EGYPT_PHONE_REGEX.test(v), 'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015')

const requiredPhone = z
  .string()
  .trim()
  .regex(EGYPT_PHONE_REGEX, 'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015')

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(v), 'اللينك مش صح')

const optionalSlug = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => !v || /^[a-z0-9-]+$/.test(v), 'الـ slug بالإنجليزي والحروف الصغيرة فقط')

export const BUSINESS_TYPES = [
  'restaurant',
  'pharmacy',
  'supermarket',
  'delivery_office',
  'misc',
] as const

// ─── 1. الأساسيات ───
export const basicsSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير').max(80, 'الاسم طويل'),
  slug: optionalSlug,
  business_type: z.enum(BUSINESS_TYPES),
  subcategory: z
    .string()
    .trim()
    .max(60)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  area: z.enum(AREAS_LIST),
  city: z.string().trim().min(2).max(60).default('شبين القناطر'),
  address_text: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  hook: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
})

// ─── 2. الصور ───
export const imagesSchema = z.object({
  logo_url: optionalUrl,
  cover_image_url: optionalUrl,
})

// ─── 3. التواصل ───
export const contactsSchema = z.object({
  phone: requiredPhone,
  whatsapp: optionalPhone,
  facebook: optionalUrl,
  instagram: optionalUrl,
  website: optionalUrl,
})

// ─── 4. الموقع ───
export const locationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  address_text: z.string().trim().max(200).optional().nullable(),
  map_url: optionalUrl,
})

// ─── 4b. تحقق الإحداثيات ───
export function checkCoords(d: { latitude?: number | null; longitude?: number | null }): boolean {
  const hasLat = d.latitude !== null && d.latitude !== undefined
  const hasLng = d.longitude !== null && d.longitude !== undefined
  return hasLat === hasLng
}

// ─── 5. ساعات العمل ───
const dayHoursSchema = z
  .object({
    open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت غلط (HH:MM)'),
    close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت غلط (HH:MM)'),
  })
  .nullable()

export const hoursSchema = z.object({
  sun: dayHoursSchema,
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
})

// ─── 6. الفروع ───
export const branchSchema = z.object({
  name: z.string().trim().min(2, 'اسم الفرع قصير').max(80, 'اسم الفرع طويل'),
  area: z.string().trim().max(60).optional().nullable(),
  address_text: z.string().trim().max(200).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  is_primary: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
})

// ─── 7. المميز + الإعدادات ───
export const settingsSchema = z.object({
  is_published: z.coerce.boolean().default(false),
  is_open: z.coerce.boolean().default(true),
  accepts_whatsapp_orders: z.coerce.boolean().default(false),
  is_featured: z.coerce.boolean().default(false),
  is_verified: z.coerce.boolean().default(false),
  featured_order: z.coerce.number().int().min(0).max(999).default(0),
  featured_pin: z.coerce.boolean().default(false),
  featured_until: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  is_new_project: z.coerce.boolean().default(false),
  new_until: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
})

// ─── 8. المالك ───
export const ownerSchema = z.object({
  owner_profile_id: z.string().uuid('اختر حساب التاجر المرتبط'),
})

// ─── الأنواع المستخرجة ───
export type BasicsInput = z.infer<typeof basicsSchema>
export type ImagesInput = z.infer<typeof imagesSchema>
export type ContactsInput = z.infer<typeof contactsSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type HoursInput = z.infer<typeof hoursSchema>
export type BranchInput = z.infer<typeof branchSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type OwnerInput = z.infer<typeof ownerSchema>

// ─── كامل (للإنشاء النهائي) ───
export const fullBusinessSchema = basicsSchema
  .merge(contactsSchema)
  .merge(locationSchema)
  .merge(settingsSchema)
  .merge(ownerSchema)
  .refine((d) => checkCoords(d), {
    message: 'لازم الإحداثيين مع بعض (أو الاتنين فاضيين)',
  })

export type FullBusinessInput = z.infer<typeof fullBusinessSchema>
