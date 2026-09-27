import { z } from 'zod'
import { AREAS } from '@/lib/data/areas'

const AREAS_LIST = AREAS as unknown as [string, ...string[]]

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Application Validation
// ═══════════════════════════════════════════════════════════

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

const phoneSchema = z
  .string()
  .trim()
  .regex(EGYPT_PHONE_REGEX, 'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015')

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (v) => !v || EGYPT_PHONE_REGEX.test(v),
    'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015',
  )

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(v),
    'اللينك مش صح',
  )

export const BUSINESS_TYPES = [
  'restaurant',
  'pharmacy',
  'supermarket',
  'delivery_office',
  'misc',
] as const

export const applySchema = z.object({
  // Step 1 — الأساسيات
  name: z
    .string()
    .trim()
    .min(2, 'الاسم قصير')
    .max(80, 'الاسم طويل'),
  business_type: z.enum(BUSINESS_TYPES),
  area: z.enum(AREAS_LIST),
  city: z.string().trim().default('شبين القناطر'),
  description: z
    .string()
    .trim()
    .min(10, 'الوصف قصير — 10 حروف على الأقل')
    .max(500, 'الوصف طويل'),
  hook: z
    .string()
    .trim()
    .max(100, 'الجملة طويلة')
    .optional()
    .nullable(),

  // Step 2 — التواصل
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,

  // Step 3 — الموقع
  address_text: z
    .string()
    .trim()
    .min(5, 'العنوان قصير')
    .max(200, 'العنوان طويل'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  // Step 4 — الموافقة
  agree_terms: z.literal(true, {
    message: 'لازم توافق على الشروط',
  }),
})

export type ApplyInput = z.infer<typeof applySchema>
