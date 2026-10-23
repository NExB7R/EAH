import { createServiceClient } from '@/lib/supabase/service'
import { getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import { saveInsight } from '@/lib/ai/storage'
import { generateNarrative } from '@/lib/ai/narrative'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════════════
// EAH — Monthly insights cron
// Runs on the 1st of every month at 2am UTC.
// - Iterates published businesses (limit 20 per run — Vercel 60s cap)
// - Skips businesses with a report in the last 30 days (idempotent)
// - Generates fresh report + notifies owner
// - Failure-tolerant: one business failure doesn't abort the batch
// ═══════════════════════════════════════════════════════════════════

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, owner_profile_id')
    .eq('is_published', true)
    .limit(20)

  if (bizError) {
    return Response.json({ ok: false, error: 'db_read_failed' }, { status: 500 })
  }
  if (!businesses || businesses.length === 0) {
    return Response.json({ ok: true, processed: 0, skipped: 0, failed: 0 })
  }

  let processed = 0
  let skipped = 0
  let failed = 0

  for (const biz of businesses) {
    try {
      const { data: existing } = await supabase
        .from('business_insights')
        .select('id')
        .eq('business_id', biz.id)
        .gte('period_end', thirtyDaysAgo.toISOString())
        .limit(1)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const [metrics, comparison] = await Promise.all([
        getBusinessMetrics(biz.id, 30),
        getCategoryComparison(biz.id),
      ])
      const analysis = analyzeBusiness(metrics, comparison)
      const aiNarrative = await generateNarrative(metrics, analysis)

      const result = await saveInsight({
        businessId: biz.id,
        metrics,
        analysis,
        comparison,
        generatedBy: null,
        aiNarrative,
      })

      if (!result.ok) {
        failed++
        continue
      }

      processed++

      if (biz.owner_profile_id) {
        await createNotification({
          userId: biz.owner_profile_id,
          type: 'system',
          title: `تقريرك الشهري جاهز — ${biz.name}`,
          body: 'تم إنشاء تقرير الأداء الشهري. افتح صفحة التقارير للمراجعة.',
          deepLink: `/merchant/insights/${result.insightId}`,
        })
      }
    } catch {
      failed++
    }
  }

  return Response.json({ ok: true, processed, skipped, failed })
}
