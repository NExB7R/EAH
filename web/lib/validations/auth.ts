import { z } from 'zod'
import { AREAS } from '@/lib/data/areas'
import { isEgyptianMobileNumber } from '@/lib/phone-validation'

// ═══════════════════════════════════════════════════════════
// EAH — Auth Validation Schemas
// ═══════════════════════════════════════════════════════════

// ─── تحويل الرقم لصيغة E.164 ───
// مثال: 01012892806 → +201012892806
export function toE164(phone: string): string {
  return `+20${phone.slice(1)}`
}

// ─── اسم العرض ───
const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'الاسم قصير — لازم حرفين على الأقل')
  .max(50, 'الاسم طويل — 50 حرف كحد أقصى')

// ─── الرقم ───
const phoneSchema = z
  .string()
  .trim()
  .refine(isEgyptianMobileNumber, 'الرقم مش صح — لازم 11 رقم يبدأ بـ 010/011/012/015')

// ─── كلمة السر ───
const passwordSchema = z
  .string()
  .min(8, 'كلمة السر قصيرة — 8 حروف على الأقل')
  .max(72, 'كلمة السر طويلة — 72 حرف كحد أقصى')

// ─── الجنس (اختياري) ───
const genderSchema = z.enum(['male', 'female']).optional().nullable()

// ─── المنطقة (اختياري) ───
const areaSchema = z.enum(AREAS).optional().nullable()

// ─── العنوان الافتراضي (اختياري) ───
const addressSchema = z
  .string()
  .trim()
  .max(200, 'العنوان طويل — 200 حرف كحد أقصى')
  .optional()
  .nullable()

// ─── الإحداثيات (اختياري) ───
// preprocess: '' → null (مش 0)
const latSchema = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().min(-90).max(90).nullable(),
)

const lngSchema = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().min(-180).max(180).nullable(),
)

// ─── Schema التسجيل ───
export const signupSchema = z
  .object({
    display_name: displayNameSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirm_password: z.string(),
    gender: genderSchema,
    default_area: areaSchema,
    default_address: addressSchema,
    default_latitude: latSchema,
    default_longitude: lngSchema,
    referral_code: z.string().trim().max(20).optional().nullable(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'كلمتين السر مش متطابقتين',
    path: ['confirm_password'],
  })

// ─── Schema الدخول ───
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'اكتب كلمة السر'),
})

// ─── Schema الاسترجاع (إيميل بديل) ───
export const recoverSchema = z.object({
  phone: phoneSchema,
})

// ─── الأنواع ───
