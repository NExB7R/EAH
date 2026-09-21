'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

type ActionState = { ok: boolean; message?: string; reason?: string }

const inviteSchema = z.object({
  business_id: z.string().uuid(),
  phone: z.string().trim().min(8, 'رقم الموبايل قصير'),
  role: z.enum(['manager', 'editor', 'viewer'], { message: 'اختار دور صالح' }),
  notes: z.string().trim().max(200).optional(),
})

export async function invitePartnerAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = inviteSchema.safeParse({
      business_id: formData.get('business_id'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      notes: formData.get('notes') || undefined,
    })
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'بيانات مش صحيحة' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('invite_partner', {
      p_business_id: parsed.data.business_id,
      p_phone: parsed.data.phone,
      p_role: parsed.data.role,
      p_notes: parsed.data.notes ?? null,
    })

    if (error) return { ok: false, message: error.message }
    const r = data as any
    if (!r?.ok) {
      const msgs: Record<string, string> = {
        user_not_found: 'مفيش مستخدم مسجل بالرقم ده',
        already_owner: 'ده صاحب النشاط بالفعل',
        self_invite: 'مش ممكن تدعي نفسك',
        forbidden: 'مش مسموح',
        invalid_role: 'دور غير صالح',
        manager_cannot_invite_manager: 'المدير ميقدرش يدعي مدير تاني — صاحب النشاط بس',
        not_authenticated: 'سجّل دخول الأول',
      }
      return { ok: false, message: msgs[r?.reason] ?? 'حصل خطأ' }
    }

    revalidatePath(`/merchant/businesses/*/partners`)
    return { ok: true, message: 'تم إرسال الدعوة ✅' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ غير متوقع' }
  }
}

export async function acceptInvitationAction(partnerId: string): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('accept_partner_invitation', { p_partner_id: partnerId })
    if (error) return { ok: false, message: error.message }
    const r = data as any
    if (!r?.ok) return { ok: false, message: 'مش ممكن تقبل الدعوة دي' }

    revalidatePath('/account/partners/invitations')
    revalidatePath('/merchant')
    return { ok: true, message: 'تم القبول' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function rejectInvitationAction(partnerId: string): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('reject_partner_invitation', { p_partner_id: partnerId })
    if (error) return { ok: false, message: error.message }
    const r = data as any
    if (!r?.ok) return { ok: false, message: 'مش ممكن ترفض الدعوة دي' }

    revalidatePath('/account/partners/invitations')
    return { ok: true, message: 'تم الرفض' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function removePartnerAction(partnerId: string): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('remove_partner', { p_partner_id: partnerId })
    if (error) return { ok: false, message: error.message }
    const r = data as any
    if (!r?.ok) return { ok: false, message: 'مش ممكن تشيل الشريك ده' }

    revalidatePath(`/merchant/businesses/*/partners`)
    return { ok: true, message: 'تم الإلغاء' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function updatePartnerRoleAction(partnerId: string, newRole: string): Promise<ActionState> {
  try {
    if (!['manager', 'editor', 'viewer'].includes(newRole)) {
      return { ok: false, message: 'دور غير صالح' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('update_partner_role', {
      p_partner_id: partnerId,
      p_new_role: newRole,
    })
    if (error) return { ok: false, message: error.message }
    const r = data as any
    if (!r?.ok) return { ok: false, message: 'مش ممكن تعدل الدور' }

    revalidatePath(`/merchant/businesses/*/partners`)
    return { ok: true, message: 'تم التحديث' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}
