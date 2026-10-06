'use server'

import { createClient } from '@/lib/supabase/server'
import { getHashedIp } from '@/lib/auth/ip'
import { signupSchema, loginSchema, recoverSchema, toE164 } from '@/lib/validations/auth'
import { authLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — Auth Server Actions
// ═══════════════════════════════════════════════════════════

// ─── نوع موحد للرد ───
export type AuthResult =
  { ok: true; redirect?: string } | { ok: false; error: string; field?: string }

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
// Helper: التحقق من Cloudflare Turnstile
// ═══════════════════════════════════════════════════════════
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // في dev محلي — لو مفيش secret، نقبل (عشان التطوير)
    // في production — Secret مفعّل دايماً
    return process.env.NODE_ENV !== 'production'
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════
export async function signupAction(formData: FormData): Promise<AuthResult> {
  // ─── Rate Limit ───
  const ip = await getClientIp()
  const rl = await checkRateLimit(authLimiter, `signup:${ip}`)
  if (!rl.ok) return { ok: false, error: rl.error }

  const raw = {
    display_name: str(formData, 'display_name'),
    phone: str(formData, 'phone'),
    password: str(formData, 'password'),
    confirm_password: str(formData, 'confirm_password'),
    gender: str(formData, 'gender') || null,
    referral_code: str(formData, 'referral_code') || null,
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

  // ─── التحقق من Turnstile ───
  const turnstileToken = str(formData, 'cf-turnstile-response')
  if (!turnstileToken) {
    return { ok: false, error: 'أكمل التحقق الأمني من فضلك' }
  }
  const isValidCaptcha = await verifyTurnstile(turnstileToken)
  if (!isValidCaptcha) {
    return { ok: false, error: 'التحقق الأمني فشل — جرب تاني' }
  }

  const {
    display_name,
    phone,
    password,
    gender,
    default_area,
    default_address,
    default_latitude,
    default_longitude,
  } = parsed.data
  const phoneE164 = toE164(phone)
  const fakeEmail = phoneToEmail(phoneE164)

  const supabase = await createClient()

  // ─── تحقق يدوي: الرقم مسجل قبل كده؟ (عبر RPC) ───
  const { data: isRegistered } = await supabase.rpc('is_phone_registered', {
    p_phone_e164: phoneE164,
  })

  if (isRegistered) {
    return {
      ok: false,
      error: 'الرقم ده مسجل قبل كده — جرب تدخل',
      field: 'phone',
    }
  }

  // ─── IP hash (multi-account detection) ───
  const signupIpHash = await getHashedIp()

  // ─── signUp ───
  const { error } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: {
        display_name,
        phone_e164: phoneE164,
        gender: gender || null,
        default_area: default_area || null,
        default_address: default_address || null,
        default_latitude: default_latitude ?? null,
        default_longitude: default_longitude ?? null,
        signup_ip_hash: signupIpHash,
        referral_code: parsed.data.referral_code ?? null,
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
  // ─── Rate Limit ───
  const ip = await getClientIp()
  const rl = await checkRateLimit(authLimiter, `login:${ip}`)
  if (!rl.ok) return { ok: false, error: rl.error }

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
  // ─── Rate Limit ───
  const ip = await getClientIp()
  const rl = await checkRateLimit(authLimiter, `recover:${ip}`)
  if (!rl.ok) return { ok: false, error: rl.error }

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
