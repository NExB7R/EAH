export type Role = 'customer' | 'merchant' | 'admin' | 'super_admin'
export type Category = 'customer' | 'merchant' | 'admin'
export type Gender = 'male' | 'female'

export type PresetAvatar = { key: string; from: string; to: string }
export type BusinessKind = 'restaurant' | 'pharmacy' | 'delivery_office' | 'any'
export type PresetTitle = { key: string; label: string; emoji: string; hint: string; gender: Gender | 'both'; category: Category; businessKind?: BusinessKind }
export type PresetFrame = { key: string; label: string; border: string; glow: string; category: Category; decoration?: 'crown' | 'store' | 'shield' }

export const AVATARS: PresetAvatar[] = [
  { key: 'av1',  from: '#8B5CF6', to: '#EC4899' }, { key: 'av2',  from: '#F59E0B', to: '#DC2626' },
  { key: 'av3',  from: '#06B6D4', to: '#8B5CF6' }, { key: 'av4',  from: '#10B981', to: '#06B6D4' },
  { key: 'av5',  from: '#EC4899', to: '#F59E0B' }, { key: 'av6',  from: '#6366F1', to: '#A855F7' },
  { key: 'av7',  from: '#F97316', to: '#EF4444' }, { key: 'av8',  from: '#14B8A6', to: '#84CC16' },
  { key: 'av9',  from: '#A855F7', to: '#3B82F6' }, { key: 'av10', from: '#EAB308', to: '#F97316' },
  { key: 'av11', from: '#EF4444', to: '#EC4899' }, { key: 'av12', from: '#0EA5E9', to: '#6366F1' },
]

export const TITLES: PresetTitle[] = [
  // ═══ CUSTOMER — both ═══
  { key: 'elgoker',      label: 'الجوكر',         emoji: '🎭', hint: 'للمزح',        gender: 'both',   category: 'customer' },
  { key: 'elshbah',      label: 'الشبح الطاير',   emoji: '👻', hint: 'للغامضين',     gender: 'both',   category: 'customer' },
  { key: 'beloved_food', label: 'اللي بيحب ياكل', emoji: '🍽️', hint: 'لعشاق الأكل', gender: 'both',   category: 'customer' },
  { key: 'elsaheb',      label: 'الصاحب',         emoji: '✅', hint: 'للأصدقاء',     gender: 'both',   category: 'customer' },
  { key: 'elharif',      label: 'الحريف',         emoji: '💎', hint: 'للمميزين',     gender: 'both',   category: 'customer' },
  { key: 'elfarfoush',   label: 'الفرفوش',        emoji: '🎈', hint: 'للمرحين',      gender: 'both',   category: 'customer' },
  { key: 'sayed_elq3da', label: 'سيد القعدة',     emoji: '🛋️', hint: 'للقعدات',     gender: 'both',   category: 'customer' },
  { key: 'elghali',      label: 'الغالي',         emoji: '💰', hint: 'للغاليين',     gender: 'both',   category: 'customer' },
  { key: 'elshef',       label: 'الشيف',          emoji: '🍳', hint: 'للطباخين',     gender: 'both',   category: 'customer' },
  { key: 'elfoodie',     label: 'الفودي',         emoji: '🥢', hint: 'لمحبي التجربة', gender: 'both',  category: 'customer' },
  { key: 'caffeine',     label: 'الكافيين',       emoji: '☕', hint: 'لعشاق القهوة', gender: 'both',   category: 'customer' },
  { key: 'john_ja3an',   label: 'على طول جعان',   emoji: '🍔', hint: 'لجعانين',      gender: 'both',   category: 'customer' },
  { key: 'shbh_elfagr',  label: 'شبح الفجر',      emoji: '🌙', hint: 'للسهارة',      gender: 'both',   category: 'customer' },
  { key: 'bt3_elsehra',  label: 'بتاع السهرة',    emoji: '🌃', hint: 'للسهريين',     gender: 'both',   category: 'customer' },

  // ═══ CUSTOMER — male ═══
  { key: 'ibn_elbalad',  label: 'ابن البلد',      emoji: '🌾', hint: 'الافتراضي',    gender: 'male',   category: 'customer' },
  { key: 'elgada',       label: 'الجدع',          emoji: '🔥', hint: 'للنشيطين',     gender: 'male',   category: 'customer' },
  { key: 'elassta',      label: 'الأسطى',         emoji: '🛠️', hint: 'للمحترفين',    gender: 'male',   category: 'customer' },
  { key: 'omdat_elheta', label: 'عمدة الحتة',     emoji: '👑', hint: 'للزعماء',      gender: 'male',   category: 'customer' },
  { key: 'elraye2',      label: 'الرايق',         emoji: '😎', hint: 'للهادي',       gender: 'male',   category: 'customer' },
  { key: 'elharraf',     label: 'الحراف',         emoji: '🏃', hint: 'للسريعين',     gender: 'male',   category: 'customer' },
  { key: 'elfaylasoof',  label: 'الفيلسوف',       emoji: '🤔', hint: 'للمفكرين',     gender: 'male',   category: 'customer' },
  { key: 'elmo3allem',   label: 'المعلم',         emoji: '👨‍🏫', hint: 'للخبراء',    gender: 'male',   category: 'customer' },
  { key: 'ged3an',       label: 'جدع جدعان',      emoji: '💪', hint: 'للأقوياء',     gender: 'male',   category: 'customer' },
  { key: 'nagm_elheta',  label: 'نجم الحتة',      emoji: '⭐', hint: 'للمشاهير',     gender: 'male',   category: 'customer' },
  { key: 'elzareef',     label: 'الظريف',         emoji: '😄', hint: 'للودودين',     gender: 'male',   category: 'customer' },
  { key: 'elbatal',      label: 'البطل',          emoji: '🏆', hint: 'للأبطال',      gender: 'male',   category: 'customer' },
  { key: 'elasad',       label: 'الأسد',          emoji: '🦁', hint: 'للقادة',       gender: 'male',   category: 'customer' },
  { key: 'elze2b',       label: 'الذئب',          emoji: '🐺', hint: 'للانفراديين',  gender: 'male',   category: 'customer' },

  // ═══ CUSTOMER — female ═══
  { key: 'bent_elbalad', label: 'بنت البلد',      emoji: '🌾', hint: 'الافتراضي',    gender: 'female', category: 'customer' },
  { key: 'elgad3a',      label: 'الجدعة',         emoji: '🔥', hint: 'للنشيطات',     gender: 'female', category: 'customer' },
  { key: 'elastaa',      label: 'الأسطى',         emoji: '🛠️', hint: 'للمحترفات',    gender: 'female', category: 'customer' },
  { key: 'set_elheta',   label: 'ست الحتة',       emoji: '👑', hint: 'للملكات',      gender: 'female', category: 'customer' },
  { key: 'elray2a',      label: 'الرايقة',        emoji: '😎', hint: 'للهاديات',     gender: 'female', category: 'customer' },
  { key: 'elharrafa',    label: 'الحرافة',        emoji: '🏃', hint: 'للسريعات',     gender: 'female', category: 'customer' },
  { key: 'elfaylasoofa', label: 'الفيلسوفة',      emoji: '🤔', hint: 'للمفكرات',     gender: 'female', category: 'customer' },
  { key: 'elmo3allema',  label: 'المعلمة',        emoji: '👩‍🏫', hint: 'للخبيرات',   gender: 'female', category: 'customer' },
  { key: 'gad3a_gad3an', label: 'جدعة جدعان',     emoji: '💪', hint: 'للقويات',      gender: 'female', category: 'customer' },
  { key: 'nagmet_elheta',label: 'نجمة الحتة',     emoji: '⭐', hint: 'للمشاهيرات',   gender: 'female', category: 'customer' },
  { key: 'elzareefa',    label: 'الظريفة',        emoji: '😄', hint: 'للودودات',     gender: 'female', category: 'customer' },
  { key: 'elbatala',     label: 'البطلة',         emoji: '🏆', hint: 'للبطلات',      gender: 'female', category: 'customer' },
  { key: 'ellabwa',      label: 'اللبؤة',         emoji: '🦁', hint: 'للقائدات',     gender: 'female', category: 'customer' },
  { key: 'elmalika',     label: 'الملكة',         emoji: '👸', hint: 'للملكات',      gender: 'female', category: 'customer' },

  // ═══ MERCHANT — مطاعم ═══
  { key: 'chef_kbir',       label: 'الشيف الكبير',    emoji: '👨‍🍳', hint: 'للمطاعم',     gender: 'both',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'saheb_matbakh',   label: 'صاحب المطبخ',      emoji: '🍳',  hint: 'للمطاعم',     gender: 'both',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'sultan_elakl',    label: 'سلطان الأكل',      emoji: '👑',  hint: 'للمطاعم',     gender: 'both',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'ostaz_elfteer',   label: 'أستاذ الفتير',     emoji: '🥙',  hint: 'للفتير',       gender: 'both',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'malik_elmashawy', label: 'ملك المشاوي',      emoji: '🍖',  hint: 'للمشاوي',     gender: 'both',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'shanawi',         label: 'الشناوي',          emoji: '🥩',  hint: 'للمطاعم',     gender: 'male',   category: 'merchant', businessKind: 'restaurant' },
  { key: 'shanawiya',       label: 'الشناوية',         emoji: '🥩',  hint: 'للمطاعم',     gender: 'female', category: 'merchant', businessKind: 'restaurant' },

  // ═══ MERCHANT — صيدليات ═══
  { key: 'doctor_saheb',    label: 'الدكتور',          emoji: '🩺',  hint: 'للصيدليات',   gender: 'male',   category: 'merchant', businessKind: 'pharmacy' },
  { key: 'doctora',         label: 'الدكتورة',         emoji: '🩺',  hint: 'للصيدليات',   gender: 'female', category: 'merchant', businessKind: 'pharmacy' },
  { key: 'saheb_saidaliya', label: 'صاحب الصيدلية',    emoji: '💊',  hint: 'للصيدليات',   gender: 'both',   category: 'merchant', businessKind: 'pharmacy' },
  { key: 'elattar',         label: 'العطار',           emoji: '🌿',  hint: 'للصيدليات',   gender: 'male',   category: 'merchant', businessKind: 'pharmacy' },
  { key: 'elattara',        label: 'العطارة',          emoji: '🌿',  hint: 'للصيدليات',   gender: 'female', category: 'merchant', businessKind: 'pharmacy' },
  { key: 'hakim_elbalad',   label: 'حكيم البلد',       emoji: '⚕️',  hint: 'للصيدليات',   gender: 'both',   category: 'merchant', businessKind: 'pharmacy' },
  { key: 'dawa_w_shifa',    label: 'دوا وشفا',         emoji: '💚',  hint: 'للصيدليات',   gender: 'both',   category: 'merchant', businessKind: 'pharmacy' },

  // ═══ MERCHANT — توصيل ═══
  { key: 'captain_eltawsil', label: 'كابتن التوصيل',   emoji: '🛵',  hint: 'للتوصيل',     gender: 'male',   category: 'merchant', businessKind: 'delivery_office' },
  { key: 'captainA',         label: 'الكابتن',          emoji: '🛵',  hint: 'للتوصيل',     gender: 'both',   category: 'merchant', businessKind: 'delivery_office' },
  { key: 'saheb_elmaktab',   label: 'صاحب المكتب',     emoji: '📦',  hint: 'للتوصيل',     gender: 'both',   category: 'merchant', businessKind: 'delivery_office' },
  { key: 'saree3',           label: 'السريع',          emoji: '⚡',  hint: 'للتوصيل',     gender: 'both',   category: 'merchant', businessKind: 'delivery_office' },
  { key: 'tayer_eltayer',    label: 'الطاير',          emoji: '🦅',  hint: 'للتوصيل',     gender: 'both',   category: 'merchant', businessKind: 'delivery_office' },

  // ═══ MERCHANT — عام ═══
  { key: 'sheikh_toggar', label: 'شيخ التجار',    emoji: '🎩', hint: 'للتجار',        gender: 'both', category: 'merchant' },
  { key: 'saheb_makan',   label: 'صاحب المكان',   emoji: '🏪', hint: 'للمالكين',      gender: 'both', category: 'merchant' },
  { key: 'elassta_kbir',  label: 'الأسطى الكبير', emoji: '🛠️', hint: 'للمحترفين',    gender: 'both', category: 'merchant' },
  { key: 'ragel_a3mal',   label: 'رجل الأعمال',   emoji: '💼', hint: 'للتجار',        gender: 'both', category: 'merchant' },
  { key: 'tager_elheta',  label: 'تاجر الحتة',    emoji: '🏪', hint: 'للتجار',        gender: 'both', category: 'merchant' },
  { key: 'elbash_tager',  label: 'الباش تاجر',    emoji: '👑', hint: 'للتجار الكبار', gender: 'both', category: 'merchant' },

  // ═══ ADMIN exclusive (royal) ═══
  { key: 'elmalik',       label: 'الملك',         emoji: '👑', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'malik_elmolk',  label: 'ملك الملوك',    emoji: '👑', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'saheb_eltag',   label: 'صاحب التاج',    emoji: '👑', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'hakem_elheta',  label: 'حاكم الحتة',    emoji: '🏰', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'elsultan',      label: 'السُلطان',      emoji: '⚜️', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'elimperator',   label: 'الإمبراطور',    emoji: '🌟', hint: 'للمالك',        gender: 'both', category: 'admin' },
  { key: 'saheb_elmnasa', label: 'صاحب المنصة',   emoji: '🎯', hint: 'للمالك',        gender: 'both', category: 'admin' },
]

export const FRAMES: PresetFrame[] = [
  // ═══ CUSTOMER (نيون بسيط) ═══
  { key: 'none',    label: 'بدون',    border: 'rgba(139,92,246,0.4)', glow: 'transparent', category: 'customer' },
  { key: 'purple',  label: 'نيون',    border: '#A855F7', glow: 'rgba(168,85,247,0.6)', category: 'customer' },
  { key: 'gold',    label: 'ذهبي',    border: '#FBBF24', glow: 'rgba(251,191,36,0.6)', category: 'customer' },
  { key: 'orange',  label: 'طعام',    border: '#F97316', glow: 'rgba(249,115,22,0.6)', category: 'customer' },
  { key: 'green',   label: 'زيتوني',  border: '#22C55E', glow: 'rgba(34,197,94,0.6)', category: 'customer' },
  { key: 'red',     label: 'ناري',    border: '#EF4444', glow: 'rgba(239,68,68,0.6)', category: 'customer' },
  { key: 'pink',    label: 'وردي',    border: '#EC4899', glow: 'rgba(236,72,153,0.6)', category: 'customer' },
  { key: 'cyan',    label: 'سماوي',   border: '#06B6D4', glow: 'rgba(6,182,212,0.6)', category: 'customer' },
  { key: 'royal',   label: 'ملكي',    border: '#6366F1', glow: 'rgba(99,102,241,0.6)', category: 'customer' },
  { key: 'sunset',  label: 'غروب',    border: '#F59E0B', glow: 'rgba(245,158,11,0.6)', category: 'customer' },
  { key: 'mint',    label: 'نعناع',   border: '#14B8A6', glow: 'rgba(20,184,166,0.6)', category: 'customer' },
  { key: 'blue',    label: 'أزرق',    border: '#3B82F6', glow: 'rgba(59,130,246,0.6)', category: 'customer' },
  { key: 'lime',    label: 'ليموني',  border: '#84CC16', glow: 'rgba(132,204,22,0.6)', category: 'customer' },
  { key: 'violet',  label: 'بنفسجي',  border: '#8B5CF6', glow: 'rgba(139,92,246,0.6)', category: 'customer' },
  { key: 'rainbow', label: 'قوس قزح', border: 'conic-gradient(from 0deg, #EF4444, #F59E0B, #22C55E, #06B6D4, #8B5CF6, #EC4899, #EF4444)', glow: 'rgba(168,85,247,0.5)', category: 'customer' },

  // ═══ MERCHANT exclusive (🏪 خلفية متجر) ═══
  { key: 'merchant_bronze', label: 'برونزي تاجر', border: '#B45309', glow: 'rgba(180,83,9,0.7)',   category: 'merchant', decoration: 'store' },
  { key: 'merchant_silver', label: 'فضي تاجر',    border: '#94A3B8', glow: 'rgba(148,163,184,0.7)', category: 'merchant', decoration: 'store' },
  { key: 'merchant_gold',   label: 'ذهبي تاجر',   border: '#F59E0B', glow: 'rgba(245,158,11,0.8)', category: 'merchant', decoration: 'store' },
  { key: 'merchant_green',  label: 'أخضر تاجر',   border: '#10B981', glow: 'rgba(16,185,129,0.7)', category: 'merchant', decoration: 'store' },
  { key: 'merchant_royal',  label: 'ملكي تاجر',   border: '#FACC15', glow: 'rgba(250,204,21,0.9)', category: 'merchant', decoration: 'store' },

  // ═══ ADMIN exclusive (👑 ملكي - حصري) ═══
  { key: 'admin_royal',      label: '👑 ملكي',      border: '#FBBF24', glow: 'rgba(251,191,36,0.9)', category: 'admin', decoration: 'crown' },
  { key: 'admin_crimson',    label: '👑 قرمزي',     border: '#DC2626', glow: 'rgba(220,38,38,0.85)', category: 'admin', decoration: 'crown' },
  { key: 'admin_obsidian',   label: '👑 أسود',      border: '#F5F3FF', glow: 'rgba(245,243,255,0.7)', category: 'admin', decoration: 'crown' },
  { key: 'admin_imperial',   label: '👑 إمبراطوري', border: 'conic-gradient(from 0deg, #FBBF24, #DC2626, #FBBF24, #DC2626, #FBBF24)', glow: 'rgba(251,191,36,0.9)', category: 'admin', decoration: 'crown' },
  { key: 'admin_royal_plus', label: '👑 ملكي+',     border: 'conic-gradient(from 0deg, #FBBF24, #A855F7, #FBBF24, #A855F7, #FBBF24)', glow: 'rgba(251,191,36,1)', category: 'admin', decoration: 'crown' },
]

const isOwner = (r: Role) => r === 'admin' || r === 'super_admin'
const canMerchant = (r: Role) => r === 'merchant' || isOwner(r)

export function getAvatar(k: string | null | undefined) { return AVATARS.find(a => a.key === k) ?? AVATARS[0] }
export function getTitle(k: string | null | undefined)  { return TITLES.find(t => t.key === k) ?? TITLES[0] }
export function getFrame(k: string | null | undefined)  { return FRAMES.find(f => f.key === k) ?? FRAMES[0] }

export function titlesForRole(
  role: Role | null | undefined,
  gender: Gender | null | undefined,
  businessTypes: string[] = []
): PresetTitle[] {
  const r = (role ?? 'customer') as Role
  const g = (gender ?? 'male') as Gender
  return TITLES.filter(t => {
    if (t.gender !== 'both' && t.gender !== g) return false
    if (t.category === 'customer') return true
    if (t.category === 'admin') return isOwner(r)
    if (t.category === 'merchant') {
      if (!canMerchant(r)) return false
      // لو الصيدلي/التاجر عنده نشاط معين، نظهر الألقاب المناسبة + العامة
      if (!t.businessKind || t.businessKind === 'any') return true
      return businessTypes.includes(t.businessKind)
    }
    return false
  })
}

export function framesForRole(role: Role | null | undefined): PresetFrame[] {
  const r = (role ?? 'customer') as Role
  return FRAMES.filter(f => {
    if (f.category === 'customer') return true
    if (f.category === 'merchant') return canMerchant(r)
    if (f.category === 'admin') return isOwner(r)
    return false
  })
}

export function isFrameAllowed(k: string, role: Role): boolean {
  const f = FRAMES.find(x => x.key === k)
  if (!f) return false
  if (f.category === 'customer') return true
  if (f.category === 'merchant') return canMerchant(role)
  if (f.category === 'admin') return isOwner(role)
  return false
}

export function isTitleAllowed(k: string, role: Role, gender: Gender | null): boolean {
  const t = TITLES.find(x => x.key === k)
  if (!t) return false
  const g = (gender ?? 'male') as Gender
  if (t.gender !== 'both' && t.gender !== g) return false
  if (t.category === 'customer') return true
  if (t.category === 'merchant') return canMerchant(role)
  if (t.category === 'admin') return isOwner(role)
  return false
}

// Helper: الأول لقب افتراضي حسب الدور والجنس
export function defaultTitleKey(role: Role | null | undefined, gender: Gender | null | undefined): string {
  const list = titlesForRole(role, gender)
  return list[0]?.key ?? 'elgoker'
}
