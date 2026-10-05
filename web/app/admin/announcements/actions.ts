'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Announcements Actions
// ═══════════════════════════════════════════════════════════

const schema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().max(400).optional().or(z.literal('')),
  theme: z.enum(['gold', 'purple', 'orange', 'teal']),
  dismissible: z.boolean().default(true),
  linkUrl: z.string().max(300).optional().or(z.literal('')),
  linkLabel: z.string().max(40).optional().or(z.literal('')),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
})

export type ActionResult = { ok: true; id: string } | { ok: false; error: string }

export async function createAnnouncement(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = schema.safeParse({
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? '').trim(),
    theme: String(formData.get('theme') ?? 'gold'),
    dismissible: formData.get('dismissible') === 'on',
    linkUrl: String(formData.get('linkUrl') ?? '').trim(),
    linkLabel: String(formData.get('linkLabel') ?? '').trim(),
    startsAt: String(formData.get('startsAt') ?? '').trim(),
    endsAt: String(formData.get('endsAt') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  const { data, error } = await auth.supabase
    .from('announcements')
    .insert({
      title: d.title,
      body: d.body || null,
      theme: d.theme,
      dismissible: d.dismissible,
      link_url: d.linkUrl || null,
      link_label: d.linkLabel || null,
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      is_active: true,
      created_by: auth.userId,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/announcements')
  revalidateTag('announcements', 'default')
  return { ok: true, id: data.id }
}

export async function toggleAnnouncement(id: string, active: boolean): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const { error } = await auth.supabase
    .from('announcements')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/announcements')
  revalidateTag('announcements', 'default')
  return { ok: true, id }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const { error } = await auth.supabase.from('announcements').delete().eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/announcements')
  revalidateTag('announcements', 'default')
  return { ok: true, id }
}
