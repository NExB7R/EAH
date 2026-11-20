import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Live Feed (poll every 15s)
// آخر 20 حدث من audit_logs
// ═══════════════════════════════════════════════════════════

const ACTION_LABEL: Record<string, string> = {
  'business.approve': 'اعتماد نشاط',
  'business.create': 'إنشاء نشاط',
  'business.update': 'تعديل نشاط',
  'business.owner.assign': 'ربط بايع بالنشاط',
  'business.owner.remove': 'فك ربط البايع بالنشاط',
  'business.archive': 'أرشفة نشاط',
  'business.republish': 'إعادة نشر نشاط',
  'business.delete': 'حذف نشاط',
  'business.reject': 'رفض نشاط',
  'business.bulk_approve': 'اعتماد جماعي',
  'business.bulk_reject': 'رفض جماعي',
  'business.bulk_archive': 'أرشفة جماعية',
  'featured.reorder_bulk': 'إعادة ترتيب المميزين',
  'user.bulk_ban': 'حظر جماعي',
  'user.bulk_unban': 'إلغاء حظر',
  'user.bulk_role': 'تغيير دور',
  'user.role.change': 'تغيير دور حساب',
  'user.ban': 'حظر حساب',
  'user.unban': 'إلغاء حظر حساب',
  'user.bulk_premium_on': 'تفعيل التميز',
  'user.bulk_premium_off': 'إلغاء التميز',
  'notifications.broadcast': 'إشعار جماعي',
  'subscription.approve': 'اعتماد اشتراك',
  'subscription.reject': 'رفض اشتراك',
  'subscription.extend': 'تمديد اشتراك',
  'subscription.cancel': 'إلغاء اشتراك',
  'ad.approve': 'اعتماد إعلان',
  'ad.reject': 'رفض إعلان',
  'ad.pause': 'إيقاف إعلان',
  'ad.resume': 'استئناف إعلان',
  'ad.delete': 'حذف إعلان',
  'health.resolve_error': 'حل خطأ',
  'health.unresolve_error': 'إعادة فتح خطأ',
  'health.resolve_all_by_severity': 'حل أخطاء بالجملة',
  'moderation.approve': 'اعتماد تقييم',
  'moderation.reject': 'رفض تقييم',
  'moderation.delete': 'حذف تقييم',
}

function privateJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  })
}

type FeedItem = {
  id: string
  label: string
  actor: string
  created_at: string
}

export async function GET() {
  const ctx = await requireAdmin()
  if (!ctx.ok) {
    return privateJson({ error: 'غير مصرح' }, 403)
  }

  const { data, error } = await ctx.supabase
    .from('audit_logs')
    .select('id, action, actor_user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) {
    console.error('[admin-live-feed] audit query failed:', error?.message ?? 'No data')
    return privateJson({ items: [] as FeedItem[] })
  }

  const actorIds = Array.from(
    new Set(data.map((l) => l.actor_user_id).filter((x): x is string => !!x)),
  )
  // Authenticated profile SELECT is intentionally restricted. Resolve names only after
  // requireAdmin() succeeds, through the server-only service client.
  const service = createServiceClient()
  const { data: profiles, error: profileError } = actorIds.length
    ? await service.from('profiles').select('id, display_name').in('id', actorIds)
    : { data: [] as { id: string; display_name: string }[], error: null }

  if (profileError) {
    console.error('[admin-live-feed] profile lookup failed:', profileError.message)
  }
  const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  const items: FeedItem[] = data.map((l) => ({
    id: l.id,
    label: ACTION_LABEL[l.action] ?? 'إجراء إداري',
    actor: l.actor_user_id ? (names.get(l.actor_user_id) ?? '—') : 'نظام',
    created_at: l.created_at,
  }))

  return privateJson({ items })
}
