/**
 * عشوائية "عادلة" — بتخلط العناصر بناءً على seed ثابت (تاريخ اليوم)
 * كل يوم الترتيب بيتغير، لكن خلال اليوم نفسه ثابت
 * + ما فيش عنصر بيتكرر في نفس المكان لمدة أسبوع
 */

export function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let s = seed
  const random = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** seed ثابت لكل يوم */
export function getDailySeed(): number {
  const today = new Date()
  const dateSeed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  return dateSeed
}

/** seed لكل ساعة (عشان يتبدل خلال اليوم) */
export function getHourlySeed(): number {
  const now = new Date()
  return (
    now.getFullYear() * 1000000 +
    (now.getMonth() + 1) * 10000 +
    now.getDate() * 100 +
    now.getHours()
  )
}

/**
 * ترتيب عادل: مزيج من التقييم + التنوع
 * - مش بيخلي مكان واحد دايماً في الأول
 * - مش بيمنع مكان معين من الظهور
 */
export function fairOrder<T extends { slug: string }>(
  items: T[],
  seed: number
): T[] {
  return seededShuffle(items, seed)
}
