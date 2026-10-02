'use server'

import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export type QrResult = { ok: true; dataUrl: string } | { ok: false; error: string }

export async function generateBusinessQr(slug: string): Promise<QrResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  // تأكد من ملكية النشاط
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, owner_profile_id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!biz || biz.owner_profile_id !== user.id) {
    return { ok: false, error: 'غير مصرح' }
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'
  const url = `${SITE_URL}/businesses/${slug}`

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1024,
      color: {
        dark: '#07020D',
        light: '#F5D9A7',
      },
    })
    return { ok: true, dataUrl }
  } catch {
    return { ok: false, error: 'فشل توليد الكود' }
  }
}
