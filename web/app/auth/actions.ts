'use server'

import { createClient } from '@/lib/supabase/server'
import {
  signupSchema,
  loginSchema,
  recoverSchema,
  toE164,
} from '@/lib/validations/auth'

// ═══════════════════════════════════════════════════════════
// EAH — Auth Server Actions
// ═══════════════════════════════════════════════════════════

// ─── نوع موحد للرد ───
export type AuthResult =
  | { ok: true; redirect?: string }
  | { ok: false; error: string; field?: string }

// ═══════════════════════════════════════════════════════════
// Helper: توليد الإيميل الوهمي من الرقم
// ═══════════════════════════════════════════════════════════
function phoneToEmail(phoneE164: string): string {
  return `${phoneE164}@auth.eah.app`
}

// ═══════════════════════════════════════════════════════════
// Helper: استخراج قيم FormData
// ═══════════════════════════════════════════════════════════
function str(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === 'string' ? v : ''
}

// ═══════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════
export async function signupAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    display_name: str(formData, 'display_name'),
    phone: str(formData, 'phone'),
    password: str(formData, 'password'),
    confirm_password: str(formData, 'confirm_password'),
    gender: str(formData, 'gender') || null,
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: first?.message ?? 'البيانات مش صح',
      field: first?.path[0]?.toString(),
    }
  }

  const { display_name, phone, password, gender } = parsed.data
  const phoneE164 = toE164(phone)
  const fakeEmail = phoneToEmail(phoneE164)

  const supabase = await createClient()

  // ─── تحقق يدوي: الرقم مسجل قبل كده؟ ───
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_e164', phoneE164)
    .maybeSingle()

  if (existing) {
    return {
      ok: false,
      error: 'الرقم ده مسجل قبل كده — جرب تدخل',
      field: 'phone',
    }
  }

  // ─── signUp ───
  const { error } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: {
        display_name,
        phone_e164: phoneE164,
        gender: gender || null,
      },
    },
  })

  if (error) {
    // Supabase error messages → عربي
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return {
        ok: false,
        error: 'الرقم ده مسجل قبل كده — جرب تدخل',
        field: 'phone',
      }
    }
    if (msg.includes('password')) {
      return {
        ok: false,
        error: 'كلمة السر ضعيفة — جرب حاجة أقوى',
        field: 'password',
      }
    }
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  return { ok: true, redirect: '/' }
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
export async function loginAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    phone: str(formData, 'phone'),
    password: str(formData, 'password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: first?.message ?? 'البيانات مش صح',
      field: first?.path[0]?.toString(),
    }
  }

  const phoneE164 = toE164(parsed.data.phone)
  const supabase = await createClient()

  // 1. جرّب الصيغة الحديثة
  const primaryEmail = phoneToEmail(phoneE164)
  let result = await supabase.auth.signInWithPassword({
    email: primaryEmail,
    password: parsed.data.password,
  })

  // 2. لو فشل → جرّب الصيغة القديمة v1 (للأدمن)
  if (result.error) {
    const digits = phoneE164.replace('+', '')
    const legacyV1Email = `phone_${digits}@accounts.eah.invalid`
    result = await supabase.auth.signInWithPassword({
      email: legacyV1Email,
      password: parsed.data.password,
    })
  }

  // 3. لو فشل → جرّب الصيغة القديمة v2 (eah.local)
  if (result.error) {
    const digits = phoneE164.replace('+', '')
    const legacyV2Email = `${digits}@eah.local`
    result = await supabase.auth.signInWithPassword({
      email: legacyV2Email,
      password: parsed.data.password,
    })
  }

  if (result.error) {
    return {
      ok: false,
      error: 'الرقم أو كلمة السر مش صح',
    }
  }

  return { ok: true, redirect: '/' }
}

// ═══════════════════════════════════════════════════════════
// RECOVER (MVP: Admin manual reset)
// ═══════════════════════════════════════════════════════════
export async function recoverAction(formData: FormData): Promise<AuthResult> {
  const raw = { phone: str(formData, 'phone') }

  const parsed = recoverSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: first?.message ?? 'البيانات مش صح',
      field: first?.path[0]?.toString(),
    }
  }

  // MVP: مفيش إرسال فعلي — Admin يعمل reset يدوي.
  // privacy: مانقولش لو الرقم موجود ولا لأ.
  return { ok: true }
}
