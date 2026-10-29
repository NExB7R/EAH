'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { commentSchema } from '@/lib/validations/comment'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { createNotification } from '@/lib/notifications/server'
import { getRootCommentId, getThreadFollowers } from '@/lib/data/comments'

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  const rl = await checkRateLimit(strictLimiter, `comment:${user.id}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  const parentId = formData.get('parent_id')?.toString() || null
  const imageUrlsRaw = formData.get('image_urls')?.toString() ?? '[]'
  let imageUrls: string[] = []
  try {
    const parsedJson = JSON.parse(imageUrlsRaw)
    if (Array.isArray(parsedJson)) {
      imageUrls = parsedJson.filter((u): u is string => typeof u === 'string').slice(0, 3)
    }
  } catch {
    imageUrls = []
  }

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
      image_urls: imageUrls,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  // ─── Auto-subscribe: كاتب التعليق يتابع الـ thread تلقائياً ───
  const rootId = parsed.data.parent_id
    ? await getRootCommentId(parsed.data.parent_id)
    : (created?.id ?? null)

  if (rootId) {
    await supabase.from('comment_thread_follows').upsert(
      {
        user_id: user.id,
        root_comment_id: rootId,
        business_id: businessId,
      },
      { onConflict: 'user_id,root_comment_id', ignoreDuplicates: true },
    )
  }

  // ─── Notify كل متابعين الـ thread (ماعدا الكاتب) ───
  if (rootId) {
    const followers = await getThreadFollowers(rootId)
    const toNotify = followers.filter((fid) => fid !== user.id)

    // معلومات النشاط للـ deep link
    const { data: bizInfo } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .maybeSingle()

    for (const fid of toNotify) {
      void createNotification({
        userId: fid,
        type: 'comment_reply',
        title: 'رد جديد في نقاش متابعه',
        body: `${bizInfo?.name ?? 'نشاط'}: حد رد في نقاش انت مشارك فيه`,
        deepLink: `/businesses/${slug}#comments-section`,
        push: true,
        pushTag: `comment-thread-${rootId}`,
      }).catch(() => {})
    }
  }

  // ─── إشعار لصاحب التعليق الأصلي (لو مش في followers — للحالة القصوى) ───
  if (parsed.data.parent_id) {
    const { data: parent } = await supabase
      .from('business_comments')
      .select('user_id')
      .eq('id', parsed.data.parent_id)
      .maybeSingle()

    if (parent?.user_id && parent.user_id !== user.id && !rootId) {
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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  const { error } = await supabase
    .from('business_comments')
    .update({ status: 'deleted' })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── تعديل تعليق (خلال 15 دقيقة) ───
export async function editComment(
  commentId: string,
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  const { data: existing } = await supabase
    .from('business_comments')
    .select('user_id, created_at')
    .eq('id', commentId)
    .maybeSingle()

  if (!existing) return { ok: false, error: 'التعليق مش موجود' }
  if (existing.user_id !== user.id) return { ok: false, error: 'مش تعليقك' }

  const ageMs = Date.now() - new Date(existing.created_at).getTime()
  if (ageMs > 15 * 60 * 1000) {
    return { ok: false, error: 'التعديل مسموح خلال 15 دقيقة فقط' }
  }

  const parsed = commentSchema.safeParse({
    content: formData.get('content')?.toString() ?? '',
    parent_id: null,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غلط' }
  }

  const { error } = await supabase
    .from('business_comments')
    .update({
      content: parsed.data.content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── متابعة/إلغاء متابعة الـ thread ───
export async function toggleFollowThread(
  commentId: string,
  slug: string,
): Promise<{ ok: true; following: boolean } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  const rootId = await getRootCommentId(commentId)
  if (!rootId) return { ok: false, error: 'التعليق مش موجود' }

  // فحص إنه متابع حالياً
  const { data: existing } = await supabase
    .from('comment_thread_follows')
    .select('id')
    .eq('user_id', user.id)
    .eq('root_comment_id', rootId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('comment_thread_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('root_comment_id', rootId)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true, following: false }
  }

  const { data: comment } = await supabase
    .from('business_comments')
    .select('business_id')
    .eq('id', rootId)
    .maybeSingle()

  if (!comment) return { ok: false, error: 'التعليق مش موجود' }

  const { error } = await supabase.from('comment_thread_follows').insert({
    user_id: user.id,
    root_comment_id: rootId,
    business_id: (comment as { business_id: string }).business_id,
  })

  if (error && !error.message.includes('duplicate')) {
    return { ok: false, error: error.message }
  }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true, following: true }
}
