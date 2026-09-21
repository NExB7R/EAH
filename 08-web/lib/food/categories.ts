export const FOOD_CATEGORIES: { key: string; label: string }[] = [
  { key: 'pizza',      label: 'بيتزا' },
  { key: 'crepe',      label: 'كريب' },
  { key: 'grill',      label: 'مشويات' },
  { key: 'liver',      label: 'كبدة' },
  { key: 'koshary',    label: 'كشري' },
  { key: 'syrian',     label: 'سوري' },
  { key: 'shawarma',   label: 'شاورما' },
  { key: 'sandwiches', label: 'سندوتشات' },
  { key: 'taameya',    label: 'طعمية' },
  { key: 'foul',       label: 'فول' },
  { key: 'fish',       label: 'أسماك' },
  { key: 'seafood',    label: 'مأكولات بحرية' },
  { key: 'burger',     label: 'برجر' },
  { key: 'hawawshi',   label: 'حواوشي' },
  { key: 'feteer',     label: 'فطير' },
  { key: 'pasta',      label: 'مكرونة' },
  { key: 'chicken',    label: 'دجاج' },
  { key: 'rice',       label: 'رز' },
  { key: 'molokhia',   label: 'ملوخية' },
  { key: 'juices',     label: 'عصائر' },
  { key: 'desserts',   label: 'حلويات' },
  { key: 'coffee',     label: 'قهوة' },
  { key: 'breakfast',  label: 'فطار' },
  { key: 'eastern',    label: 'شرقي' },
]

export function getCategoryLabel(key: string): string {
  const c = FOOD_CATEGORIES.find((x) => x.key === key)
  return c ? c.label : key
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
