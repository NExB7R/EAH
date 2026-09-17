export const FOOD_CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'pizza',      label: 'بيتزا',        emoji: '' },
  { key: 'crepe',      label: 'كريب',         emoji: '' },
  { key: 'grill',      label: 'مشويات',       emoji: '🍖' },
  { key: 'liver',      label: 'كبدة',         emoji: '' },
  { key: 'koshary',    label: 'كشري',         emoji: '🍲' },
  { key: 'syrian',     label: 'سوري',         emoji: '' },
  { key: 'shawarma',   label: 'شاورما',       emoji: '🌯' },
  { key: 'sandwiches', label: 'سندوتشات',     emoji: '🥪' },
  { key: 'taameya',    label: 'طعمية',        emoji: '🧆' },
  { key: 'foul',       label: 'فول',          emoji: '🫘' },
  { key: 'fish',       label: 'أسماك',        emoji: '🐟' },
  { key: 'seafood',    label: 'مأكولات بحرية', emoji: '' },
  { key: 'burger',     label: 'برجر',         emoji: '' },
  { key: 'hawawshi',   label: 'حواوشي',       emoji: '🥩' },
  { key: 'feteer',     label: 'فطير',         emoji: '🥧' },
  { key: 'pasta',      label: 'مكرونة',       emoji: '🍝' },
  { key: 'chicken',    label: 'دجاج',         emoji: '' },
  { key: 'rice',       label: 'رز',           emoji: '🍚' },
  { key: 'molokhia',   label: 'ملوخية',       emoji: '🌿' },
  { key: 'juices',     label: 'عصائر',        emoji: '🧃' },
  { key: 'desserts',   label: 'حلويات',       emoji: '🍰' },
  { key: 'coffee',     label: 'قهوة',         emoji: '☕' },
  { key: 'breakfast',  label: 'فطار',         emoji: '🍳' },
  { key: 'eastern',    label: 'شرقي',         emoji: '🫓' },
]

export function getCategoryLabel(key: string): string {
  const c = FOOD_CATEGORIES.find((x) => x.key === key)
  return c ? `${c.emoji} ${c.label}` : key
}


// icon key mapping → يُترجم في UI إلى eah-icons
const ICON_MAP: Record<string, string> = {
  pizza: 'Pizza', crepe: 'Crepe', grill: 'Grill', liver: 'Kebab',
  koshary: 'Koshary', syrian: 'Shawarma', shawarma: 'Shawarma',
  sandwiches: 'Sandwich', taameya: 'Taameya', foul: 'Koshary',
  fish: 'Fish', seafood: 'Fish', burger: 'Burger', hawawshi: 'Bread',
  feteer: 'Bread', pasta: 'Crepe', chicken: 'Grill', rice: 'Rice',
  molokhia: 'Koshary', juices: 'Juice', desserts: 'Dessert',
  coffee: 'Coffee', breakfast: 'Breakfast', eastern: 'Shawarma',
}

export function getCategoryIconKey(key: string): string {
  return ICON_MAP[key] ?? 'Sparkle'
}
