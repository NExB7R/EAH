export type StreakData = {
  ok: boolean
  already_visited: boolean
  streak: number
  longest: number
  points_earned: number
  referral_code?: string
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '💎'
  if (streak >= 14) return '🔥🔥'
  if (streak >= 7) return '🔥'
  if (streak >= 3) return '⚡'
  return '✨'
}

export function getStreakLabel(streak: number): string {
  if (streak >= 30) return 'أسطورة!'
  if (streak >= 14) return 'مشتعل'
  if (streak >= 7) return 'متابع'
  if (streak >= 3) return 'منتظم'
  return 'بدأت'
}
