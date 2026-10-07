'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { commentSchema } from '@/lib/validations/comment'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { createNotification } from '@/lib/notifications/server'

type ActionResult = { ok: true } | { ok: false; error: string }

// ─── إنشاء تعليق ───
export async function createComment(
  businessId: string,
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const rl = await checkRateLimit(strictLimiter, `comment:${user.id}`)
  if (!rl.ok) return { ok: false, error: rl.error }

  const parentId = formData.get('parent_id')?.toString() || null
  const parsed = commentSchema.safeParse({
    content: formData.get('content')?.toString() ?? '',
    parent_id: parentId,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غلط' }
  }

  const { data: created, error } = await supabase
    .from('business_comments')
    .insert({
      business_id: businessId,
      user_id: user.id,
      parent_id: parsed.data.parent_id ?? null,
      content: parsed.data.content,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  // إشعار لصاحب التعليق الأصلي (لو رد)
  if (parsed.data.parent_id) {
    const { data: parent } = await supabase
      .from('business_comments')
      .select('user_id')
      .eq('id', parsed.data.parent_id)
      .maybeSingle()

    if (parent?.user_id && parent.user_id !== user.id) {
      void createNotification({
        userId: parent.user_id,
        type: 'comment_reply',
        title: 'حد رد على تعليقك',
        body: 'افتح النشاط عشان تشوف الرد',
        deepLink: `/businesses/${slug}#comments-section`,
        pushTag: 'comment-reply',
      }).catch(() => {})
    }
  }

  // إشعار لصاحب النشاط (لو مش هو الكاتب)
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id, name')
    .eq('id', businessId)
    .maybeSingle()

  if (biz?.owner_profile_id && biz.owner_profile_id !== user.id && !parsed.data.parent_id) {
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'comment',
      title: 'تعليق جديد على نشاطك',
      body: `${biz.name}: حد كتب تعليق`,
      deepLink: `/businesses/${slug}#comments-section`,
      pushTag: 'comment',
    }).catch(() => {})
  }

  // activity
  await supabase.from('business_activities').insert({
    business_id: businessId,
    user_id: user.id,
    activity_type: 'comment',
    metadata: { comment_id: created?.id ?? null },
  })

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── إعجاب ───
export async function likeComment(commentId: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const { error } = await supabase
    .from('comment_likes')
    .insert({ comment_id: commentId, user_id: user.id })

  if (error && !error.message.includes('duplicate')) {
    return { ok: false, error: error.message }
  }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── إلغاء إعجاب ───
export async function unlikeComment(commentId: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── حذف تعليق ───
export async function deleteComment(commentId: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  const { error } = await supabase
    .from('business_comments')
    .update({ status: 'deleted' })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}
