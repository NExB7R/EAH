export type PresetAvatar = { key: string; from: string; to: string }
export type PresetTitle = { key: string; label: string; emoji: string; hint: string }
export type PresetFrame = { key: string; label: string; border: string; glow: string }

export const AVATARS: PresetAvatar[] = [
  { key: 'av1',  from: '#8B5CF6', to: '#EC4899' },
  { key: 'av2',  from: '#F59E0B', to: '#DC2626' },
  { key: 'av3',  from: '#06B6D4', to: '#8B5CF6' },
  { key: 'av4',  from: '#10B981', to: '#06B6D4' },
  { key: 'av5',  from: '#EC4899', to: '#F59E0B' },
  { key: 'av6',  from: '#6366F1', to: '#A855F7' },
  { key: 'av7',  from: '#F97316', to: '#EF4444' },
  { key: 'av8',  from: '#14B8A6', to: '#84CC16' },
  { key: 'av9',  from: '#A855F7', to: '#3B82F6' },
  { key: 'av10', from: '#EAB308', to: '#F97316' },
  { key: 'av11', from: '#EF4444', to: '#EC4899' },
  { key: 'av12', from: '#0EA5E9', to: '#6366F1' },
]

export const TITLES: PresetTitle[] = [
  { key: 'ibn_elbalad',   label: 'ابن البلد',       emoji: '🌾', hint: 'الافتراضي' },
  { key: 'elgada',        label: 'الجدع',           emoji: '🔥', hint: 'للنشيطين' },
  { key: 'elassta',       label: 'الأسطى',          emoji: '🛠️', hint: 'للمحترفين' },
  { key: 'omdat_elheta',  label: 'عمدة الحتة',      emoji: '👑', hint: 'للزعماء' },
  { key: 'elraye2',       label: 'الرايق',          emoji: '😎', hint: 'للهادي' },
  { key: 'elharraf',      label: 'الحراف',          emoji: '🏃', hint: 'للسريعين' },
  { key: 'elfaylasoof',   label: 'الفيلسوف',        emoji: '🤔', hint: 'للمفكرين' },
  { key: 'elgoker',       label: 'الجوكر',          emoji: '🎭', hint: 'للمزح' },
  { key: 'beloved_food',  label: 'اللي بيحب ياكل',  emoji: '🍽️', hint: 'لعشاق الأكل' },
  { key: 'elshbah',       label: 'الشبح الطاير',    emoji: '👻', hint: 'للغامضين' },
  { key: 'elmo3allem',    label: 'المعلم',          emoji: '👨‍🏫', hint: 'للخبراء' },
  { key: 'elsaheb',       label: 'الصاحب',          emoji: '✅', hint: 'للأصدقاء' },
  { key: 'ged3an',        label: 'جدع جدعان',       emoji: '💪', hint: 'للأقوياء' },
  { key: 'nagm_elheta',   label: 'نجم الحتة',       emoji: '⭐', hint: 'للمشاهير' },
  { key: 'elzareef',      label: 'الظريف',          emoji: '😄', hint: 'للودودين' },
]

export const FRAMES: PresetFrame[] = [
  { key: 'none',    label: 'بدون',      border: 'rgba(139,92,246,0.4)', glow: 'transparent' },
  { key: 'purple',  label: 'نيون',      border: '#A855F7', glow: 'rgba(168,85,247,0.6)' },
  { key: 'gold',    label: 'ذهبي',      border: '#FBBF24', glow: 'rgba(251,191,36,0.6)' },
  { key: 'orange',  label: 'طعام',      border: '#F97316', glow: 'rgba(249,115,22,0.6)' },
  { key: 'green',   label: 'زيتوني',    border: '#22C55E', glow: 'rgba(34,197,94,0.6)' },
  { key: 'red',     label: 'ناري',      border: '#EF4444', glow: 'rgba(239,68,68,0.6)' },
  { key: 'pink',    label: 'وردي',      border: '#EC4899', glow: 'rgba(236,72,153,0.6)' },
  { key: 'cyan',    label: 'سماوي',     border: '#06B6D4', glow: 'rgba(6,182,212,0.6)' },
  { key: 'royal',   label: 'ملكي',      border: '#6366F1', glow: 'rgba(99,102,241,0.6)' },
  { key: 'sunset',  label: 'غروب',      border: '#F59E0B', glow: 'rgba(245,158,11,0.6)' },
  { key: 'mint',    label: 'نعناع',     border: '#14B8A6', glow: 'rgba(20,184,166,0.6)' },
  { key: 'rainbow', label: 'قوس قزح',   border: 'conic-gradient(from 0deg, #EF4444, #F59E0B, #22C55E, #06B6D4, #8B5CF6, #EC4899, #EF4444)', glow: 'rgba(168,85,247,0.5)' },
]

export function getAvatar(key: string | null | undefined) {
  return AVATARS.find(a => a.key === key) ?? AVATARS[0]
}
export function getTitle(key: string | null | undefined) {
  return TITLES.find(t => t.key === key) ?? TITLES[0]
}
export function getFrame(key: string | null | undefined) {
  return FRAMES.find(f => f.key === key) ?? FRAMES[0]
}
