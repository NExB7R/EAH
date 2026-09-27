// ═══════════════════════════════════════════════════════════
// EAH — Featured Fair Rotation (Round-Robin)
// ═══════════════════════════════════════════════════════════
//
// الهدف:
//   كل نشاط مميز ياخد البطاقة الكبيرة (Hero) بنفس عدد المرات.
//   بدون تلاعب — الترتيب بالدور، مش بالفلوس.
//
// الطريقة:
//   القائمة بتدور كل 8 ثواني (دورة كاملة).
//   [A,B,C,D,E] → [B,C,D,E,A] → [C,D,E,A,B] → ...
//
// كل Reload:
//   نقطة بداية جديدة (حسب الوقت الحالي).
//   بعد دورة كاملة (N × 8 ثواني)، كل نشاط رجع لمكانه.
//
// ثبات server/client:
//   الـ server بيحسب نقطة البداية من Date.now().
//   الـ client بيستلم نفس النقطة → نفس الـ render.
//   بعدين الـ client بس هو اللي بيدور.
// ═══════════════════════════════════════════════════════════

export const FEATURED_ROTATION_MS = 8000

// نقطة البداية حسب الوقت (نفس الحساب في server و client)
export function getRotationStart(length: number): number {
  if (length <= 0) return 0
  const slots = Math.floor(Date.now() / FEATURED_ROTATION_MS)
  return slots % length
}

// دوران بسيط: [A,B,C] + offset 1 → [B,C,A]
export function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return []
  const len = items.length
  const start = ((offset % len) + len) % len
  return [...items.slice(start), ...items.slice(0, start)]
}
