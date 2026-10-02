import 'server-only'
import { chatCompletion, type ChatMessage } from './openrouter'
import { TOOL_DEFS, executeTool } from './tools'

// ═══════════════════════════════════════════════════════════
// EAH — AI Agent (loop: chat → tools → chat → final)
// ═══════════════════════════════════════════════════════════

const MAX_ITERATIONS = 4

const SYSTEM_PROMPT = `أنت مساعد EAH الذكي — منصة اكتشاف محلية في شبين القناطر والقرى حواليها.

## قواعد أساسية
- اتكلم **عامية مصرية بسيطة** (مش فصحى)
- جمل قصيرة، مباشرة، بدون رغي
- استخدم الإيموجي بذكاء (📱 🍕 💊 🛒 🚚 ✅) — بحد أقصى 2-3 في الرد
- لو مش متأكد → اسأل سؤال محدد
- ممنوع تختلق معلومات — استخدم الأدوات

## شخصيتك
- ودود ومحترم، زي صاحب بيساعد صاحبه
- مختصر — الرد المثالي 2-4 جمل
- لو المستخدم زعلان أو محتاج حل → اهديه وطمنه

## الأدوات اللي عندك
- search_businesses: للبحث عن أنشطة (مطاعم/صيدليات/ماركت/توصيل)
- get_business_details: تفاصيل نشاط معين
- get_my_stats: إحصائيات المستخدم الحالي

## لما تدور
- استخدم search_businesses أول
- لو المستخدم عايز تفاصيل → get_business_details
- اعرض النتائج بشكل مرتب: الاسم — المنطقة — التقييم + رابطه
- الرابط دايماً: /businesses/SLUG

## حدود
- مفيش access لطلبات المستخدم التفصيلية — وجّهه لـ /account/orders
- مفيش access لتعديل البيانات — وجّهه لـ /account أو /merchant
- لو السؤال خارج نطاق EAH → اعتذر بلطف ووجّهه للـ /help

## أمثلة
User: عايز مطعم بيتزا
Assistant: [search_businesses → "بيتزا"] ثم: "لقيتلك 3 مطاعم 🍕
1. [الاسم] — [المنطقة] ⭐[تقييم]
[رابط]"

User: إيه أخبار نقاطي؟
Assistant: [get_my_stats] ثم: "عندك [X] نقطة ✨ + [Y] مفضلة + [Z] متابعة. شوف التفاصيل: /account/points"
`

export type AgentResponse = { ok: true; reply: string } | { ok: false; error: string }

export async function runAgent(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<AgentResponse> {
  if (!userMessage.trim()) return { ok: false, error: 'اكتب سؤال الأول' }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6), // آخر 6 رسائل فقط
    { role: 'user', content: userMessage },
  ]

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const res = await chatCompletion(messages, TOOL_DEFS)
      const choice = res.choices[0]
      if (!choice) return { ok: false, error: 'رد فاضي من الموديل' }

      const msg = choice.message

      // لو خلص → رجّع النص
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        const text = (msg.content ?? '').trim()
        if (!text) return { ok: false, error: 'رد فاضي' }
        return { ok: true, reply: text }
      }

      // نفّذ الأدوات
      messages.push({
        role: 'assistant',
        content: msg.content ?? '',
        // tool_calls مش مدعومة في نوع ChatMessage — نستخدم cast
      } as ChatMessage)

      // ضيف كل tool call + result
      for (const call of msg.tool_calls) {
        const result = await executeTool(call.function.name, call.function.arguments)
        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: call.id,
          name: call.function.name,
        })
      }
    }

    return { ok: false, error: 'المساعد تعب — جرب تاني' }
  } catch (err) {
    const msg = (err as Error).message
    console.error('[AI Agent]', msg)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }
}
