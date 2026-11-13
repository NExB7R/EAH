'use server'

import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

type SetupResult = { ok: true; qr: string; secret: string } | { ok: false; error: string }
type VerifyResult = { ok: true; backup_codes: string[] } | { ok: false; error: string }
type SimpleResult = { ok: true } | { ok: false; error: string }

const ISSUER = 'EAH'

// 1. Setup — توليد secret + QR (لم يُفعّل بعد)
export async function setupTwoFactor(): Promise<SetupResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(user.email ?? user.id, ISSUER, secret)
  const qr = await QRCode.toDataURL(otpauth, { width: 240, margin: 1 })

  // خزّن secret (غير مفعّل — enabled_at = null)
  const service = createServiceClient()
  const { error } = await service
    .from('user_2fa')
    .upsert({ user_id: user.id, secret, enabled_at: null }, { onConflict: 'user_id' })
  if (error) return { ok: false, error: 'فشل التحضير' }

  return { ok: true, qr, secret }
}

// 2. Verify — تأكيد الكود + توليد backup codes
export async function verifyTwoFactor(code: string): Promise<VerifyResult> {
  if (!/^\d{6}$/.test(code)) return { ok: false, error: 'الكود لازم 6 أرقام' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  const service = createServiceClient()
  const { data: row } = await service
    .from('user_2fa')
    .select('secret, enabled_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row?.secret) return { ok: false, error: 'لم يتم التحضير' }
  if (row.enabled_at) return { ok: false, error: 'مفعّل بالفعل' }

  const valid = authenticator.check(code, row.secret)
  if (!valid) return { ok: false, error: 'كود غير صحيح' }

  // توليد 10 backup codes
  const plainCodes: string[] = []
  const hashedCodes: string[] = []
  for (let i = 0; i < 10; i++) {
    const plain = crypto.randomBytes(5).toString('hex').toUpperCase()
    plainCodes.push(plain)
    hashedCodes.push(crypto.createHash('sha256').update(plain).digest('hex'))
  }

  const { error } = await service
    .from('user_2fa')
    .update({ enabled_at: new Date().toISOString(), backup_codes: hashedCodes })
    .eq('user_id', user.id)
  if (error) return { ok: false, error: 'فشل التفعيل' }

  revalidatePath('/admin/profile')
  revalidatePath('/account/security')
  return { ok: true, backup_codes: plainCodes }
}

// 3. Disable — يتطلب كود حالي
export async function disableTwoFactor(code: string): Promise<SimpleResult> {
  if (!/^\d{6}$/.test(code)) return { ok: false, error: 'الكود لازم 6 أرقام' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  const service = createServiceClient()
  const { data: row } = await service
    .from('user_2fa')
    .select('secret')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row?.secret) return { ok: false, error: 'غير مفعّل' }

  const valid = authenticator.check(code, row.secret)
  if (!valid) return { ok: false, error: 'كود غير صحيح' }

  const { error } = await service.from('user_2fa').delete().eq('user_id', user.id)
  if (error) return { ok: false, error: 'فشل الإلغاء' }

  revalidatePath('/admin/profile')
  revalidatePath('/account/security')
  return { ok: true }
}
