/**
 * EAH — Misc Categories (الأنشطة الأخرى)
 * سوق شبين القناطر الشعبي
 */

export type MiscCategory = {
  key: string
  label: string
  icon?: string
}

export const MISC_CATEGORIES: MiscCategory[] = [
  { key: 'vegetables', label: 'خضار وفاكهة', icon: 'Leaf' },
  { key: 'meat', label: 'لحوم ودواجن', icon: 'Beef' },
  { key: 'fish', label: 'أسماك', icon: 'Fish' },
  { key: 'grocery', label: 'بقالة', icon: 'Shopping' },
  { key: 'dairy', label: 'ألبان وأجبان', icon: 'Milk' },
  { key: 'bakery', label: 'مخبوزات', icon: 'Bread' },
  { key: 'sweets', label: 'حلويات', icon: 'Dessert' },
  { key: 'spices', label: 'عطارة', icon: 'Sparkle' },
  { key: 'baking', label: 'مستلزمات حلواني', icon: 'Cake' },
  { key: 'cleaning', label: 'مستلزمات تنظيف', icon: 'Droplet' },
  { key: 'kitchen', label: 'أدوات مطبخ', icon: 'Utensils' },
  { key: 'home', label: 'مستلزمات منزلية', icon: 'Home' },
  { key: 'clothes', label: 'ملابس', icon: 'Shirt' },
  { key: 'shoes', label: 'أحذية', icon: 'Footprints' },
  { key: 'other', label: 'أخرى', icon: 'MoreHorizontal' },
]

export function getMiscLabel(key: string): string {
  const c = MISC_CATEGORIES.find((x) => x.key === key)
  return c ? c.label : key
}
