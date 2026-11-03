import { z } from 'zod'
import { AREAS } from '@/lib/data/areas'
import { isEgyptianMobileNumber } from '@/lib/phone-validation'

const AREAS_LIST = AREAS as unknown as [string, ...string[]]

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Application Validation
// ═══════════════════════════════════════════════════════════

const phoneSchema = z
  .string()
  .trim()
  .refine(isEgyptianMobileNumber, 'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015')

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || isEgyptianMobileNumber(v), 'الرقم مش صح — 11 رقم يبدأ بـ 010/011/012/015')

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(v), 'اللينك مش صح')

export const BUSINESS_TYPES = [
  'restaurant',
  'pharmacy',
  'delivery_office',
  'misc',
] as const

export const applySchema = z.object({
  // Step 1 — الأساسيات
  name: z.string().trim().min(2, 'الاسم قصير').max(80, 'الاسم طويل'),
  business_type: z.enum(BUSINESS_TYPES),
  area: z.enum(AREAS_LIST),
  city: z.string().trim().default('شبين القناطر'),
  description: z.string().trim().min(10, 'الوصف قصير — 10 حروف على الأقل').max(500, 'الوصف طويل'),
  hook: z.string().trim().max(100, 'الجملة طويلة').optional().nullable(),

  // Step 2 — التواصل
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  phoneNumbers: z.array(phoneSchema).min(1).max(8).optional(),
  whatsappNumbers: z.array(phoneSchema).max(8).optional(),
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,

  // Step 3 — الموقع
  address_text: z.string().trim().min(5, 'العنوان قصير').max(200, 'العنوان طويل'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  // Step 4 — الموافقة
  agree_terms: z.literal(true, {
    message: 'لازم توافق على الشروط',
  }),
}).superRefine((data, ctx) => {
  for (const [field, numbers] of [
    ['phoneNumbers', data.phoneNumbers ?? []],
    ['whatsappNumbers', data.whatsappNumbers ?? []],
  ] as const) {
    const normalized = numbers.map((value) => value.replace(/\D/g, ''))
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: 'فيه رقم مكرر داخل نفس نوع التواصل',
      })
    }
  }
})
