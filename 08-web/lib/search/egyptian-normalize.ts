/**
 * EAH Egyptian Arabic Normalizer
 * يحوّل العامية المصرية لنص موحّد يفهمه البحث
 */

// ─── كلمات مصرية شائعة → مرادف فصيح ───
const WORD_MAP: Record<string, string> = {
  // ─── أفعال بحث ───
  'عايز': 'أريد',
  'عاوز': 'أريد',
  'عاوزة': 'أريد',
  'محتاج': 'أريد',
  'نفسي': 'أريد',
  'نفسى': 'أريد',
  'بتدور': 'ابحث',
  'بدور': 'ابحث',
  'دور': 'ابحث',
  'دورلي': 'ابحث',
  'وريني': 'اعرض',
  'فين': 'أين',
  'منين': 'من أين',
  'ليه': 'لماذا',
  'ازاي': 'كيف',
  'إيه': 'ماذا',
  'ايه': 'ماذا',
  'ايه ده': 'ماذا',
  'كده': 'هكذا',
  'كدا': 'هكذا',
  'أوي': 'جداً',
  'اوى': 'جداً',
  'قوي': 'جداً',
  'حاجة': 'شيء',
  'حاجات': 'أشياء',
  'واحد': 'أحد',
  'في': 'يوجد',
  'مفيش': 'لا يوجد',
  'مش': 'ليس',
  'لسه': 'لا يزال',

  // ─── أنواع الأنشطة ───
  'مطعم': 'restaurant',
  'مطاعم': 'restaurant',
  'أكل': 'restaurant',
  'اكل': 'restaurant',
  'أكله': 'restaurant',
  'صيدلية': 'pharmacy',
  'صيدليات': 'pharmacy',
  'أجيب': 'pharmacy',
  'اجيب': 'pharmacy',
  'دوا': 'pharmacy',
  'دواء': 'pharmacy',
  'ماركت': 'supermarket',
  'سوبرماركت': 'supermarket',
  'بقالة': 'supermarket',
  'بقاله': 'supermarket',
  'سوبر': 'supermarket',
  'توصيل': 'delivery_office',
  'دليفري': 'delivery_office',
  'أوردر': 'delivery_office',
  'اوردر': 'delivery_office',
  'مكتب': 'delivery_office',

  // ─── أنشطة أخرى (سوق شعبي) ───
  'خضار': 'misc',
  'فاكهة': 'misc',
  'فاكهه': 'misc',
  'لحمة': 'misc',
  'لحوم': 'misc',
  'فراخ': 'misc',
  'طيور': 'misc',
  'سمك': 'misc',
  'ألبان': 'misc',
  'البان': 'misc',
  'جبنة': 'misc',
  'جبنه': 'misc',
  'عيش': 'misc',
  'خبز': 'misc',
  'حلويات': 'misc',
  'عطارة': 'misc',
  'عطاره': 'misc',
  'بهارات': 'misc',
  'توابل': 'misc',
  'منظفات': 'misc',
  'صابون': 'misc',
  'ملابس': 'misc',
  'هدوم': 'misc',
  'أحذية': 'misc',
  'احذيه': 'misc',
  'جزم': 'misc',
  'أدوات مطبخ': 'misc',
  'سمنة': 'misc',
  'سمنه': 'misc',
  'خميرة': 'misc',
  'خميره': 'misc',

  // ─── أنواع الأكل ───
  'أسماك': 'fish',
  'اسماك': 'fish',
  'بحري': 'seafood',
  'جمبري': 'seafood',
  'روبيان': 'seafood',
  'دجاج': 'chicken',
  'لحم': 'meat',
  'كفتة': 'grill',
  'كفته': 'grill',
  'مشويات': 'grill',
  'شوي': 'grill',
  'كباب': 'grill',
  'شاورما': 'shawarma',
  'بيتزا': 'pizza',
  'برجر': 'burger',
  'برغر': 'burger',
  'كشري': 'koshary',
  'كشرى': 'koshary',
  'فول': 'foul',
  'طعمية': 'taameya',
  'طعميه': 'taameya',
  'فلافل': 'taameya',
  'كريب': 'crepe',
  'حواوشي': 'hawawshi',
  'حواوشى': 'hawawshi',
  'فطير': 'feteer',
  'فطيرة': 'feteer',
  'معجنات': 'feteer',
  'مكرونة': 'pasta',
  'مكرونه': 'pasta',
  'باستا': 'pasta',
  'سندوتش': 'sandwiches',
  'سندوتشات': 'sandwiches',
  'ساندويتش': 'sandwiches',
  'رز': 'rice',
  'أرز': 'rice',
  'ارز': 'rice',
  'ملوخية': 'molokhia',
  'ملوخيه': 'molokhia',
  'صينية': 'grill',
  'شوربة': 'soup',
  'سلطة': 'salad',
  'مقبلات': 'appetizers',
  'حلو': 'desserts',
  'جاتو': 'desserts',
  'كيك': 'desserts',
  'آيس كريم': 'desserts',
  'ايس كريم': 'desserts',
  'بوظة': 'desserts',
  'عصير': 'juices',
  'عصائر': 'juices',
  'قهوة': 'coffee',
  'قهوه': 'coffee',
  'نسكافيه': 'coffee',
  'شاي': 'tea',
  'مشروب': 'drinks',
  'حاجة ساقعة': 'drinks',
  'فطار': 'breakfast',
  'فطور': 'breakfast',
  'غداء': 'lunch',
  'عشاء': 'dinner',
  'سحور': 'suhoor',
  'شرقي': 'eastern',
  'شرقية': 'eastern',
  'لبناني': 'lebanese',
  'سوري': 'syrian',
  'تركي': 'turkish',
  'صيني': 'chinese',
  'هندي': 'indian',
  'إيطالي': 'italian',
  'ايطالي': 'italian',

  // ─── وصف الحالة ───
  'قريب': 'near_me',
  'قريبة': 'near_me',
  'حولي': 'near_me',
  'حواليا': 'near_me',
  'جنبي': 'near_me',
  'جديد': 'new',
  'جديدة': 'new',
  'ترند': 'trending',
  'مشهور': 'trending',
  'أحسن': 'best',
  'احسن': 'best',
  'أفضل': 'best',
  'افضل': 'best',
  'رخيص': 'cheap',
  'غالي': 'expensive',
  'وسط': 'mid_range',
  'نضيف': 'clean',
  'شيك': 'fancy',
  'مفتوح': 'open',
  'مقفول': 'closed',
  'دلوقتي': 'now',
  'الآن': 'now',
  'ليلا': 'night',
  'بليل': 'night',

  // ─── أفعال ───
  'اطلب': 'order',
  'أطلب': 'order',
  'احجز': 'book',
  'كلم': 'call',
  'اتصل': 'call',
  'خد': 'take',
  'هات': 'bring',
  'جيب': 'bring',
  'روح': 'go',
  'تعال': 'come',
  // ─── إضافات جديدة ───
  'عايزة': 'أريد',
  'محتاجة': 'أريد',
  'نفسة': 'أريد',
  'يبقى': 'يكن',
  'يبقاش': 'لا',
  'خلاص': 'انتهى',
  'لسة': 'لم',
  'بكرة': 'غداً',
  'امبارح': 'أمس',
  'النهاردة': 'اليوم',
  'بعدين': 'لاحقاً',
  'قبلين': 'مبكراً',
  'بالليل': 'مساءً',
  'الصبح': 'صباحاً',
  'من شوية': 'قبل قليل',
  'بعد شوية': 'بعد قليل',
  'مرة واحدة': 'فوراً',

  // ─── أنواع الأماكن الإضافية ───
  'كافيه': 'cafe',
  'كافية': 'cafe',
  'كافي شوب': 'cafe',
  'كافي': 'cafe',
  'حلواني': 'sweets',
  'حلوانى': 'sweets',
  'عطار': 'spices',
  'جزار': 'butcher',
  'فرن': 'bakery',
  'مخبز': 'bakery',
  'بوفيه': 'cafe',
  'سوبر ماركت': 'supermarket',
  'هايبر': 'supermarket',

  // ─── وصف الجودة ───
  'نجيف': 'clean',
  'وسخ': 'dirty',
  'ريحة': 'smell',
  'لذيذ': 'delicious',
  'تحفة': 'excellent',
  'وحش': 'bad',
  'مقبول': 'ok',
  'بالضبط': 'exactly',
  'ظبط': 'match',

  // ─── أفعال إضافية ───
  'اشوف': 'see',
  'أشوف': 'see',
  'اجرب': 'try',
  'أجرب': 'try',
  'اعرف': 'know',
  'أعرف': 'know',
  'قوللي': 'tell me',
  'قولى': 'tell me',
  'ورينى': 'show me',
  'اعرضلي': 'show me',
}

// ─── اختصارات ───
const SHORT_WORDS: Record<string, string> = {
  'بس': '',
  'يعني': '',
  'بقى': '',
  'بقة': '',
  'بئى': '',
  'كمان': 'أيضاً',
  'تاني': 'آخر',
  'مانا': '',
  'ماني': '',
}

// ─── إزالة التشكيل ───
function stripDiacritics(s: string): string {
  return s.replace(/[\u064B-\u065F\u0670]/g, '')
}

// ─── توحيد الحروف ───
function unifyLetters(s: string): string {
  return s
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30))
}

// ─── إزالة الترقيم ───
function stripPunctuation(s: string): string {
  return s.replace(/[،؛!؟.,"'«»\-—–…]/g, ' ')
}

/**
 * الدالة الرئيسية — تحوّل نص مصري عامي → بحث
 */
export function normalizeEgyptian(input: string): string {
  if (!input) return ''
  let s = input.trim()
  s = stripDiacritics(s)
  s = unifyLetters(s)
  s = stripPunctuation(s)

  // split words
  const words = s.split(/\s+/).filter(Boolean)
  const out: string[] = []

  for (const w of words) {
    // شوف الكلمة في القاموس
    const direct = WORD_MAP[w]
    if (direct) {
      out.push(direct)
      continue
    }
    // كلمة قصيرة
    const short = SHORT_WORDS[w]
    if (short !== undefined) {
      if (short) out.push(short)
      continue
    }
    // مركّبة — مثلاً "عايزمطعم"
    let replaced = w
    for (const [key, val] of Object.entries(WORD_MAP)) {
      if (key.length >= 3 && w.includes(key)) {
        replaced = replaced.replace(key, val)
      }
    }
    out.push(replaced)
  }

  return out.join(' ').trim()
}

/**
 * كشف النية — يحوّل الـ normalized لنوايا بحث
 */
export type SearchIntent = {
  type?: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  food?: string
  near_me?: boolean
  open_now?: boolean
  sort?: 'rating' | 'views' | 'offers' | 'new'
  query: string
}

export function detectIntent(normalized: string): SearchIntent {
  const words = normalized.toLowerCase().split(/\s+/)
  const intent: SearchIntent = { query: normalized }

  if (words.includes('restaurant')) intent.type = 'restaurant'
  if (words.includes('pharmacy')) intent.type = 'pharmacy'
  if (words.includes('supermarket')) intent.type = 'supermarket'
  if (words.includes('delivery_office')) intent.type = 'delivery_office'

  const FOODS = ['fish', 'seafood', 'chicken', 'meat', 'grill', 'shawarma', 'pizza', 'burger', 'koshary', 'foul', 'taameya', 'crepe', 'hawawshi', 'feteer', 'pasta', 'sandwiches', 'rice', 'molokhia', 'desserts', 'juices', 'coffee', 'tea', 'breakfast', 'lunch', 'dinner', 'eastern', 'lebanese', 'syrian', 'turkish', 'chinese', 'indian', 'italian']
  for (const f of FOODS) {
    if (words.includes(f)) { intent.food = f; break }
  }

  if (words.includes('near_me')) intent.near_me = true
  if (words.includes('open') || words.includes('now')) intent.open_now = true

  if (words.includes('best') || words.includes('rating')) intent.sort = 'rating'
  if (words.includes('trending')) intent.sort = 'views'
  if (words.includes('new')) intent.sort = 'new'

  return intent
}
