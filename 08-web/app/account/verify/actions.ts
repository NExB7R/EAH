'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { auditLog } from '@/lib/admin/audit'

export async function submitVerification(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/verify')

  const real_name = String(formData.get('real_name') ?? '').trim()
  const national_id = String(formData.get('national_id') ?? '').trim() || null
  const reason = String(formData.get('reason') ?? '').trim() || null

  if (real_name.length < 4) throw new Error('اكتب اسمك الكامل (كلمتين على الأقل)')
  if (reason && reason.length > 300) throw new Error('السبب طويل جدًا')

  // فحص إن مفيش طلب قيد المراجعة
  const { data: existing } = await supabase
    .from('verification_requests')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) throw new Error('عندك طلب قيد المراجعة بالفعل')

  const { error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: userData.user.id,
      real_name,
      national_id,
      reason,
    })

  if (error) throw new Error(error.message)

  await auditLog({
    action: 'review.approve',
    entityType: 'verification_request',
    entityId: userData.user.id,
    after: { real_name, has_national_id: !!national_id },
    metadata: { submitted: true },
  })

  // إشعار للسوبر أدمين
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'super_admin'])

  if (admins && admins.length > 0) {
    await supabase.from('notifications').insert(
      admins.map(a => ({
        user_id: a.user_id,
        type: 'verification',
        title: 'طلب توثيق جديد',
        body: `في طلب توثيق جديد محتاج مراجعة`,
        link: '/admin/verifications',
      }))
    )
  }

  revalidatePath('/account')
  revalidatePath('/admin/verifications')
  revalidatePath('/admin')
  redirect('/account/verify?sent=1')
}
