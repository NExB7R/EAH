'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Health Check Auto-Fixes (2026-11-09)
// إصلاحات آمنة للمشاكل الشائعة
// ═══════════════════════════════════════════════════════════

type FixResult = { ok: true; message: string; affected: number } | { ok: false; error: string }

export async function fixHealthIssue(checkId: string): Promise<FixResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: 'غير مصرح' }

  const svc = createServiceClient()

  try {
    switch (checkId) {
      case 'published-without-branch': {
        // إنشاء فرع أساسي لكل نشاط منشور (bidirectional)
        const { data: businesses } = await svc
          .from('businesses')
          .select('id, name, area, city, address_text, working_hours')
          .eq('is_published', true)

        if (!businesses || businesses.length === 0) {
          return { ok: true, message: 'مفيش أنشطة محتاجة إصلاح', affected: 0 }
        }

        const ids = businesses.map((b) => b.id)
        const { data: existing } = await svc
          .from('business_branches')
          .select('business_id')
          .in('business_id', ids)
          .eq('is_primary', true)

        const hasPrimary = new Set((existing ?? []).map((e) => e.business_id))
        const needBranch = businesses.filter((b) => !hasPrimary.has(b.id))

        if (needBranch.length === 0) {
          return { ok: true, message: 'كل الأنشطة عندها فرع أساسي', affected: 0 }
        }

        const rows = needBranch.map((b) => ({
          business_id: b.id,
          name: b.name,
          area: b.area || b.city || 'شبين القناطر',
          address_text: b.address_text || null,
          is_primary: true,
          is_active: true,
          working_hours: (b.working_hours as Record<string, unknown>) || {},
        }))

        const { error } = await svc.from('business_branches').insert(rows)
        if (error) return { ok: false, error: `فشل الإصلاح: ${error.message}` }

        await logAudit(ctx.supabase, {
          actorUserId: ctx.userId,
          action: 'health.fix.published_without_branch',
          entityType: 'business_branches',
          metadata: { affected: rows.length },
        })

        return {
          ok: true,
          message: `تم إضافة ${rows.length} فرع أساسي`,
          affected: rows.length,
        }
      }

      case 'orphan-branches': {
        const { error, count } = await svc
          .from('business_branches')
          .delete({ count: 'exact' })
          .is('business_id', null)

        if (error) return { ok: false, error: `فشل الحذف: ${error.message}` }

        await logAudit(ctx.supabase, {
          actorUserId: ctx.userId,
          action: 'health.fix.orphan_branches',
          entityType: 'business_branches',
          metadata: { deleted: count ?? 0 },
        })

        return { ok: true, message: `تم حذف ${count ?? 0} فرع يتيم`, affected: count ?? 0 }
      }

      case 'stale-orders': {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { error, count } = await svc
          .from('order_requests')
          .update({ status: 'expired', expired_at: new Date().toISOString() }, { count: 'exact' })
          .in('status', ['sent', 'seen'])
          .lt('created_at', yesterday)

        if (error) return { ok: false, error: `فشل التحديث: ${error.message}` }

        await logAudit(ctx.supabase, {
          actorUserId: ctx.userId,
          action: 'health.fix.stale_orders',
          entityType: 'order_requests',
          metadata: { expired: count ?? 0 },
        })

        return { ok: true, message: `تم إنهاء ${count ?? 0} طلب معلق`, affected: count ?? 0 }
      }

      default:
        return { ok: false, error: 'هذا الفحص مش بيقبل الإصلاح التلقائي' }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'فشل غير متوقع' }
  }
}
