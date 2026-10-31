import 'server-only'
import { chatCompletion } from './providers'
import type { BusinessMetrics } from '@/lib/data/insights'
import type { AnalysisResult } from './business-advisor'

// ═══════════════════════════════════════════════════════════
// EAH — AI Narrative Generator
// يكتب ملخص ذكي بالعامية المصرية من المؤشرات
// ═══════════════════════════════════════════════════════════

const DAY_LABEL: Record<string, string> = {
  sun: 'الأحد',
  mon: 'الاتنين',
  tue: 'التلات',
  wed: 'الأربع',
  thu: 'الخميس',
  fri: 'الجمعة',
  sat: 'السبت',
}

function hourLabel(h: number): string {
  if (h === 0) return '12 بالليل'
  if (h < 12) return `${h} الصبح`
  if (h === 12) return '12 الضهر'
  if (h < 17) return `${h - 12} بعد الضهر`
  if (h < 20) return `${h - 12} المغرب`
  return `${h - 12} بالليل`
}

function pct(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? 'بدأ جديد' : 'مفيش'
  const delta = ((curr - prev) / prev) * 100
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${Math.round(delta)}%`
}

function buildPrompt(metrics: BusinessMetrics, analysis: AnalysisResult): string {
  const peakInfo =
    metrics.peakHour !== null && metrics.peakDay
      ? `ذروة الزيارات: يوم ${DAY_LABEL[metrics.peakDay]} حوالي ${hourLabel(metrics.peakHour)}`
      : 'مفيش بيانات ذروة كافية'

  return `أنت مستشار أعمال مصري خبير. اكتب تقرير موجز بالعامية المصرية عن نشاط تجاري.

📊 الأرقام (آخر ${metrics.days} يوم):
- زيارات: ${metrics.pageViews} (${pct(metrics.pageViews, metrics.prevPeriod.pageViews)} vs الفترة السابقة)
- زوار فريدين: ${metrics.uniqueVisitors}
- طلبات: ${metrics.ordersTotal} (مكتمل: ${metrics.ordersConfirmed}، ملغي: ${metrics.ordersCancelled})
- طلبات (مقارنة): ${pct(metrics.ordersTotal, metrics.prevPeriod.ordersTotal)}
- متوسط التقييم: ${metrics.avgRating} (من ${metrics.reviewsTotal} تقييم)
- متوسط الرد: ${metrics.avgResponseTimeMin !== null ? `${metrics.avgResponseTimeMin} دقيقة` : 'مفيش بيانات'}
- متابعين: ${metrics.followsCount} | مفضلين: ${metrics.favoritesCount}
- صور: ${metrics.mediaCount}
- ${peakInfo}

🎯 التحليل:
- نقاط القوة: ${analysis.strengths.slice(0, 3).join(' | ') || 'مفيش'}
- نقاط الضعف: ${analysis.weaknesses.slice(0, 3).join(' | ') || 'مفيش'}
- الفرص: ${analysis.opportunities.slice(0, 2).join(' | ') || 'مفيش'}
- الدرجة: ${analysis.score}/100 (${analysis.scoreLabel})

📝 المطلوب:
اكتب بالعربية المصرية فقط. ممنوع استخدام أي كلمة أو عبارة أو اختصار إنجليزي في النص النهائي.
اكتب 3-4 جمل قصيرة بالعامية المصرية:
1. جملة عن الوضع الحالي (رقم الزيارات أو الطلبات)
2. جملة عن الذروة (امتى الناس بتزور)
3. جملة عن أهم فرصة تحسين
4. جملة تحفيزية قصيرة

⚠️ قواعد:
- عامية مصرية حقيقية (مش فصحى)
- أرقام محددة (مش كلام عام)
- بدون إيموجي
- جمل قصيرة (max 15 كلمة)
- متقلش "نشاطك" كتير — استخدم صيغة مباشرة
- اكتب 4 جمل بس في باراجراف واحد`
}

export async function generateNarrative(
  metrics: BusinessMetrics,
  analysis: AnalysisResult,
): Promise<string | null> {
  try {
    const prompt = buildPrompt(metrics, analysis)

    const res = await chatCompletion(
      [
        { role: 'system', content: 'أنت مستشار أعمال مصري. بتكتب بالعامية المصرية الشعبية.' },
        { role: 'user', content: prompt },
      ],
      undefined,
    )

    const text = res.choices?.[0]?.message?.content?.trim()
    if (!text) return null

    // نظف أي رموز غريبة
    return text.replace(/^["'`]+|["'`]+$/g, '').slice(0, 600)
  } catch {
    return null
  }
}
