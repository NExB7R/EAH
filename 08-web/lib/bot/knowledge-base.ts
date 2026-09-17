/**
 * EAH Smart Bot — Knowledge Base
 * كل معلومات المنصة في مكان واحد (data-driven)
 */

export type Intent = {
  id: string
  keywords: string[]
  response: string
  quickReplies?: { label: string; action: 'reply' | 'link'; value: string }[]
  priority?: number
}

export type Context = {
  isGuest: boolean
  currentPath: string
  hasBusiness?: boolean
  subscriptionTier?: 'free' | 'premium'
}

export const BOT_GREETING =
  'أهلاً! أنا مساعد EAH الذكي 👋\nممكن أساعدك في إيه؟'

export const BOT_QUICK_START = [
  { label: '️ عايز ألاقي مكان', action: 'reply' as const, value: 'دور لي على مكان' },
  { label: '🏪 عندي نشاط', action: 'reply' as const, value: 'عندي مطعم أو محل' },
  { label: 'الباقات والأسعار', action: 'reply' as const, value: 'الباقات بكام؟' },
  { label: 'كلّم حد', action: 'link' as const, value: 'https://wa.me/201012892806' },
]

// ═══ Main Knowledge Base ═══
export const KB: Intent[] = [
  // ═══ About the platform ═══
  {
    id: 'about',
    keywords: ['المنصة', 'eah', 'إيه', 'ايه', 'ايه ده', 'بتعملوا', 'بتعمل إيه', 'شركة', 'موقع'],
    response:
      'EAH منصة اكتشاف محلية لشبين القناطر والقرى حواليها.\n\n' +
      '🎯 بتساعدك تلاقي:\n' +
      '• مطاعم\n• صيدليات\n• ماركت\n• توصيل\n\n' +
      'كل ده مجاناً للعميل — بدون أي رسوم.',
    quickReplies: [
      { label: 'اكتشف الأماكن', action: 'link', value: '/explore' },
      { label: 'عروض حلوة', action: 'link', value: '/offers' },
    ],
  },

  // ═══ Find a place (customer) ═══
  {
    id: 'find-place',
    keywords: ['دور لي', 'عايز آكل', 'مطعم', 'صيدلية', 'ماركت', 'توصيل', 'ألاقي', 'بفتش', 'دوّر'],
    response:
      'تمام! عايز تدور على إيه؟\n\n' +
      '️ مطاعم — أكل ومشروبات\n' +
      'صيدليات — أدوية ومستلزمات\n' +
      'ماركت — بقالة ومستلزمات البيت\n' +
      'توصيل — مكاتب التوصيل',
    quickReplies: [
      { label: '️ مطاعم', action: 'link', value: '/explore?type=restaurant' },
      { label: 'صيدليات', action: 'link', value: '/explore?type=pharmacy' },
      { label: 'ماركت', action: 'link', value: '/explore?type=supermarket' },
      { label: 'توصيل', action: 'link', value: '/explore?type=delivery_office' },
    ],
  },

  // ═══ Sign up ═══
  {
    id: 'signup',
    keywords: ['أسجل', 'تسجيل', 'حساب', 'أعمل حساب', 'أشترك'],
    response:
      'التسجيل عندنا سهل — دقيقة واحدة بس.\n\n' +
      'بتسجل بموبايلك + كلمة سر.\n' +
      'مجاناً تماماً.\n' +
      'بياناتك محمية.',
    quickReplies: [
      { label: 'سجّل الآن', action: 'link', value: '/auth' },
    ],
  },

  // ═══ Merchant registration ═══
  {
    id: 'merchant-register',
    keywords: ['عندي مطعم', 'صاحب نشاط', 'عايز أسجل نشاطي', 'صيدلية', 'سوبر ماركت', 'أضيف محلي', 'أضيف مطعمي'],
    response:
      'عظيم! 🎉 سجّل نشاطك على EAH وهيظهر لآلاف العملاء.\n\n' +
      'مجاناً تماماً في البداية\n' +
      '📊 تحليلات نشاطك\n' +
      'تقدر ترد على التقييمات\n' +
      'باقة مميزة للظهور الأول',
    quickReplies: [
      { label: '🏪 سجّل نشاطك', action: 'link', value: '/merchant/apply' },
      { label: 'الباقات', action: 'link', value: '/pricing' },
    ],
  },

  // ═══ Merchant benefits ═══
  {
    id: 'merchant-benefits',
    keywords: ['مميزات', 'أستفيد', 'ليه أسجل', 'مكسب', 'فايدة'],
    response:
      'لو عندك نشاط، EAH بيوفرلك:\n\n' +
      'مجاناً:\n' +
      '• عرض نشاطك\n' +
      '• تحليلات أساسية\n' +
      '• رد على التقييمات\n' +
      '• QR code للمحل\n\n' +
      'مميز (اختياري):\n' +
      '• ظهور أول\n' +
      '• شارة ذهبية\n' +
      '• معرض عروض\n' +
      '• إشعارات فورية',
    quickReplies: [
      { label: '✨ كل المميزات', action: 'link', value: '/merchant-info' },
      { label: 'سجّل نشاطك', action: 'link', value: '/merchant/apply' },
    ],
  },

  // ═══ Pricing ═══
  {
    id: 'pricing',
    keywords: ['بكام', 'سعر', 'أسعار', 'باقات', 'تكلفة', 'فلوس'],
    response:
      'الخطة الأساسية مجانية تماماً! 🎁\n\n' +
      '📌 الخطة المجانية:\n' +
      '• ظهور أساسي\n• تحليلات بسيطة\n• تقييمات\n\n' +
      'الخطة المميزة:\n' +
      '• ظهور أول في البحث\n• معرض عروض\n• شارة ذهبية\n• تحليلات متقدمة\n• إشعارات فورية\n' +
      'تجربة مجانية لمدة شهر كامل',
    quickReplies: [
      { label: 'الباقات كاملة', action: 'link', value: '/pricing' },
      { label: 'كلّمنا واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  },

  // ═══ Contact ═══
  {
    id: 'contact',
    keywords: ['تواصل', 'رقم', 'واتس', 'كلم', 'اتصل', 'مشكلة', 'شكوى'],
    response:
      'تحب تتواصل معانا؟ 📞\n\n' +
      'واتساب: أسرع طريقة — رد فوري\n' +
      '📘 فيسبوك: EAH Official\n\n' +
      'فريق EAH جاهز يساعدك في أي وقت.',
    quickReplies: [
      { label: 'واتساب', action: 'link', value: 'https://wa.me/201012892806' },
      { label: '📘 فيسبوك', action: 'link', value: 'https://facebook.com/eah.eg' },
      { label: '📝 صفحة التواصل', action: 'link', value: '/contact' },
    ],
  },

  // ═══ Points & rewards ═══
  {
    id: 'points',
    keywords: ['نقاط', 'مكافآت', 'جوائز', 'referral', 'صاحب', 'ادعي'],
    response:
      'بتجمع نقاط على كل تفاعل على EAH!\n\n' +
      'زيارة يومية: نقاط\n' +
      '✍️ تكتب تقييم: نقاط\n' +
      'تدعي صاحب: 50 نقطة\n' +
      'streak 7 أيام: +10\n\n' +
      'واستبدل النقاط بعروض حقيقية!',
    quickReplies: [
      { label: 'نقاطي', action: 'link', value: '/account/points' },
      { label: 'ادعي صحابك', action: 'link', value: '/account/referral' },
    ],
  },

  // ═══ Coming soon / order bot ═══
  {
    id: 'coming-soon',
    keywords: ['قادم', 'جديد', 'أوردر', 'طلب', 'تتبع', 'مستقبلي', 'planning'],
    response:
      'ميزات قادمة قريب على EAH!\n\n' +
      '🚚 تتبّع طلبك لحظة بلحظة\n' +
      '🤖 بوت ذكي يطلب بدالك\n' +
      'شات مباشر مع المكان\n' +
      '📍 خرائط تفاعلية\n\n' +
      'تابعنا على واتساب لتعرف كل جديد أول بأول.',
    quickReplies: [
      { label: 'تابع واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  },

  // ═══ Offers ═══
  {
    id: 'offers',
    keywords: ['عروض', 'خصم', 'تخفيض', 'عرض', 'discount'],
    response:
      'شوف أحلى العروض الحالية!\n\n' +
      'كل العروض من أماكن موثوقة على EAH.\n' +
      'بتتجدد يومياً — خليك دايماً في الجو.',
    quickReplies: [
      { label: 'كل العروض', action: 'link', value: '/offers' },
    ],
  },

  // ═══ Trending ═══
  {
    id: 'trending',
    keywords: ['ترند', 'رائج', 'الأكثر', 'شعبية', 'popular'],
    response:
      'شوف الترند على EAH! 📈\n\n' +
      'الترندات بتتحدث باستمرار حسب تفاعل الناس.\n' +
      'خليك على اطلاع بأحدث الأماكن.',
    quickReplies: [
      { label: '📈 الترندات', action: 'link', value: '/trends' },
    ],
  },

  // ═══ Recommendation ═══
  {
    id: 'recommend',
    keywords: ['ترشيح', 'نفسي في', 'مش عارف', 'محتار', 'recommend'],
    response:
      'خليني أساعدك تختار! ✨\n\n' +
      'عندنا أداة ذكية بترشحلك الأماكن حسب:\n' +
      '• مزاجك\n• ميزانيتك\n• موقعك',
    quickReplies: [
      { label: '✨ نفسك في إيه؟', action: 'link', value: '/recommend' },
    ],
  },

  // ═══ Favorites ═══
  {
    id: 'favorites',
    keywords: ['مفضلة', 'حفظ', 'favorite', 'بحفظ'],
    response:
      'تقدر تحفظ الأماكن في المفضلة!\n\n' +
      'كده ترجع لأي مكان بسهولة في أي وقت.',
    quickReplies: [
      { label: 'مفضلتي', action: 'link', value: '/account' },
    ],
  },

  // ═══ Promotions / advertise ═══
  {
    id: 'advertise',
    keywords: ['إعلان', 'أعلن', 'إعلانات', 'ads', 'reklam'],
    response:
      'تحب تعلن على EAH؟ 📢\n\n' +
      'عندنا مساحات إعلانية متنوعة:\n' +
      '• بانر رئيسي\n' +
      '• ظهور أول في البحث\n' +
      '• معرض عروض مميز\n\n' +
      'كلّمنا واتساب للتفاصيل.',
    quickReplies: [
      { label: 'كلّمنا', action: 'link', value: 'https://wa.me/201012892806' },
      { label: '📄 صفحة الإعلانات', action: 'link', value: '/advertise' },
    ],
  },

  // ═══ Palestine support ═══
  {
    id: 'palestine',
    keywords: ['فلسطين', 'غزة', 'دعم', 'تبرع'],
    response:
      'فلسطين في القلب\n\n' +
      'على EAH بنؤمن إن كل حد يقدر يدعم القضية بطريقته.\n' +
      'عندنا صفحة كاملة بطرق دعم واقعية وآمنة.',
    quickReplies: [
      { label: '🇵🇸 اعرف أكتر', action: 'link', value: '/support-palestine' },
    ],
  },

  // ═══ Verification ═══
  {
    id: 'verify',
    keywords: ['توثيق', 'موثق', 'verified', 'شهادة'],
    response:
      'التوثيق بيدي حسابك مصداقية أكبر\n\n' +
      'حسابك الموثق:\n' +
      '• يبان أعلى في التفاعل\n' +
      '• ثقة أكبر من الناس\n' +
      '• شارة خضراء بجانب اسمك',
    quickReplies: [
      { label: 'وثّق حسابك', action: 'link', value: '/account/verify' },
    ],
  },

  // ═══ App / install ═══
  {
    id: 'app',
    keywords: ['تطبيق', 'app', 'نزّل', 'ثبت', 'تحميل', 'instal'],
    response:
      'ثبّت EAH على موبايلك\n\n' +
      'يشتغل أوفلاين\n' +
      'أسرع 3x\n' +
      'إشعارات فورية\n\n' +
      'دوس على زر التثبيت في الهيدر.',
  },

  // ═══ Troubleshooting ═══
  {
    id: 'slow',
    keywords: ['بطيء', 'بطئ', 'مش شغال', 'مشغول', 'تهنيج', 'slow', 'lag'],
    response:
      'معلش على الإزعاج! 🙏\n\n' +
      'لو المنصة بطيئة، جرّب:\n' +
      '• اعمل refresh (F5)\n' +
      '• امسح الكاش من الإعدادات\n' +
      '• تأكد إن النت شغال\n\n' +
      'لو المشكلة مستمرة، كلّمنا واتساب.',
    quickReplies: [
      { label: 'واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  },

  {
    id: 'cant-login',
    keywords: ['مش عارف أدخل', 'الدخول', 'كلمة السر', 'نسيت', 'login', 'باسوورد'],
    response:
      'لو مش قادر تدخل:\n\n' +
      '• تأكد من رقم الموبايل\n' +
      '• لو نسيت كلمة السر، استرجعها\n' +
      '• لو حسابك محظور، كلّمنا',
    quickReplies: [
      { label: '🔐 استرجاع كلمة السر', action: 'link', value: '/auth/recover' },
      { label: 'واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  },

  {
    id: 'cant-find',
    keywords: ['مش لاقي', 'مش موجود', 'ضايع', 'مش الاقي', 'المنطقة', 'قريتي'],
    response:
      'معلش إن المكان مش موجود! 🗺️\n\n' +
      'المنصة بتتوسع منطقة منطقة. لو منطقتك مش موجودة:\n' +
      '• كلّمنا واتساب واحنا نحاول نضيفها\n' +
      '• أو سجّل النشاط بنفسك',
    quickReplies: [
      { label: '🏪 سجّل نشاطك', action: 'link', value: '/merchant/apply' },
      { label: 'واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  },

  {
    id: 'privacy',
    keywords: ['خصوصية', 'بياناتي', 'privacy', 'معلومات شخصية'],
    response:
      'بناخد خصوصيتك بجدية 🔒\n\n' +
      '• بياناتك مشفرة\n' +
      '• مش بنبيعها لأي جهة\n' +
      '• تقدر تحذف حسابك في أي وقت',
    quickReplies: [
      { label: '📄 سياسة الخصوصية', action: 'link', value: '/privacy' },
    ],
  },

  {
    id: 'terms',
    keywords: ['شروط', 'أحكام', 'terms', 'قانون'],
    response:
      'الشروط والأحكام متاحة بالكامل على صفحة مخصصة. كل حاجة واضحة ومباشرة 📋',
    quickReplies: [
      { label: '📄 الشروط', action: 'link', value: '/terms' },
    ],
  },

  // ═══ Greeting ═══
  {
    id: 'hi',
    keywords: ['أهلا', 'السلام', 'هاي', 'مرحبا', 'hi', 'hello', 'صباح', 'مساء'],
    response:
      'أهلاً بيك! 👋\n\n' +
      'أنا مساعد EAH الذكي.\n' +
      'ممكن أساعدك في إيه؟',
    quickReplies: BOT_QUICK_START.slice(0, 3),
  },
]

// ═══ Fallback ═══
export const FALLBACK_RESPONSE =
  'معلش، مش فاهم بالظبط 🤔\n\n' +
  'تحب أعرفك على EAH بشكل عام؟ أو كلّمنا واتساب وهنساعدك شخصياً.'

export const FALLBACK_REPLIES = [
  { label: '✨ إيه هو EAH؟', action: 'reply' as const, value: 'المنصة إيه؟' },
  { label: 'واتساب', action: 'link' as const, value: 'https://wa.me/201012892806' },
]

// ═══ Matcher ═══
export function matchIntent(input: string, ctx: Context): Intent | null {
  const text = input.trim().toLowerCase()
  if (!text) return null

  // Context-aware: prioritize offers on /explore, favorites on /account
  const contextBoosts: Record<string, number> = {}
  if (ctx.currentPath.startsWith('/explore')) contextBoosts['find-place'] = 2
  if (ctx.currentPath.startsWith('/offers')) contextBoosts['offers'] = 2
  if (ctx.currentPath.startsWith('/account')) contextBoosts['points'] = 2

  let best: Intent | null = null
  let bestScore = 0

  for (const intent of KB) {
    let score = 0
    for (const kw of intent.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.length >= 5 ? 3 : 1
      }
    }
    score += contextBoosts[intent.id] ?? 0
    if (score > bestScore) {
      bestScore = score
      best = intent
    }
  }

  return bestScore >= 2 ? best : null
}
