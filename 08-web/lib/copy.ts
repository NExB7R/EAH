/**
 * EAH — Copy & Voice
 * كل نصوص المنصة في مكان واحد.
 * القاعدة: مصري شعبي، أخوي، دافئ — مش رسمي.
 * السلوغان المقدّس: "اللي نفسك فيه ؟"
 */

export type Gender = 'male' | 'female' | 'unknown'

type GenderMap = { male: string; female: string; unknown: string }

function pick(map: GenderMap, g: Gender = 'unknown'): string {
  return map[g] || map.unknown
}

// ═══ Core Phrases ═══

export const SLOGAN = 'اللي نفسك فيه ؟'

export const BROTHER = {
  male: 'يا أخويا',
  female: 'يا أختي',
  unknown: 'يا أخواتي',
} as const

export const BROTHER_BIZ = {
  male: 'أخويا البزنس',
  female: 'أختي البزنس',
  unknown: 'شريكنا',
} as const

export const WELCOME = {
  male: 'نورت يا أخويا',
  female: 'نورتي يا أختي',
  unknown: 'نورت',
} as const

// ═══ Main Copy ═══

export const COPY = {
  hero: {
    kicker: 'أهلاً بيك في EAH',
    title: 'اللي نفسك فيه ؟',
    titleAccent: 'يلا بينا نلاقيه',
    subtitle: 'قول لنا مزاجك، واحنا نظبطلك المكان على الآخر',
    cta: {
      discover: 'دوّر معانا',
      recommend: 'قول مزاجك',
      signup: 'انضم لينا',
    },
  },
  search: {
    placeholder: 'دوّر على إيه النهاردة؟',
    placeholderFood: 'مطعم؟ صيدلية؟ ماركت؟ دوّر...',
    noResults: {
      title: 'معلش، مفيش حاجة هنا',
      body: 'لفينا وما لقيناش — جرّب كلمة تانية',
      cta: 'شوف كل الأماكن',
    },
    hint: {
      title: 'اكتب أي حاجة',
      body: 'اسم مطعم، نوعه، أو منطقتك',
    },
  },
  categories: {
    title: 'نفسك في إيه؟',
    restaurant: '🍽️ مطاعم',
    pharmacy: '💊 صيدليات',
    supermarket: '🛒 ماركت',
    delivery: '🛵 توصيل',
  },
  sections: {
    featured: {
      title: '⭐ المميزين',
      subtitle: 'أماكن تستاهل',
      empty: 'لسه مفيش حد مميز',
    },
    trending: {
      title: '🔥 مولعة النهاردة',
      subtitle: 'الناس بتدور عليها دلوقتي',
      empty: 'لسه مفيش ترند',
    },
    offers: {
      title: '🎁 عروض النهاردة',
      subtitle: 'على الآخر',
      empty: 'لسه مفيش عروض',
    },
    new: {
      title: '🌱 دعم للجديد',
      subtitle: 'دعم للجديد — فرصته معاك',
      empty: 'لسه مفيش جديد',
    },
  },
  auth: {
    signup: 'انضم لينا',
    login: 'ادخل بيتك',
    logout: 'خروج',
    welcomeBack: {
      male: 'نورت تاني يا أخويا',
      female: 'نورتي تاني يا أختي',
      unknown: 'نورت تاني',
    },
    signupSuccess: 'تمام! أهلاً بيك في البيت',
    loginSuccess: 'نورت يا غالي',
    logoutSuccess: 'في رعاية الله 🤝',
    passwordChanged: 'تمام — كلمة السر اتغيرت',
    passwordError: 'معلش، كلمة السر مش مظبوطة',
    alreadyHave: 'عندك حساب؟',
    noAccount: 'مفيش حساب؟',
  },
  account: {
    title: {
      male: 'رُكن أخويا',
      female: 'رُكن أختي',
      unknown: 'رُكني',
    },
    greeting: {
      male: 'إزيك يا أخويا',
      female: 'إزيك يا أختي',
      unknown: 'إزيك',
    },
    kicker: 'بيتك عندنا',
    edit: 'عدّل بياناتك',
    favorites: 'الأماكن اللي حفظتها',
    reviews: 'رأيك في الأماكن',
    orders: 'أوردراتك',
    points: 'نقطك',
    referral: 'ادعي صحابك',
    notifications: 'إشعاراتك',
    verify: 'وثّق حسابك',
    changePassword: 'غيّر كلمة السر',
    merchantPanel: 'شغل أخويا',
    adminPanel: 'لوحة التحكم',
  },
  merchant: {
    title: {
      male: 'بزنس أخويا',
      female: 'شغل أختي',
      unknown: 'بزنسك',
    },
    kicker: 'شغلنا معاك',
    welcome: {
      male: 'نورت يا أخويا البزنس',
      female: 'نورتي يا أختي البزنس',
      unknown: 'نورت يا شريكنا',
    },
    orders: 'الأوردرات اللي جاتلك',
    menu: 'منيوك',
    analytics: 'شوف شغلك',
    subscription: 'اشتراكك',
    settings: 'إعداداتك',
    qr: 'كود QR',
  },
  order: {
    newOrder: '🎉 جايبلك أوردر!',
    sent: 'استلمنا طلبك — في السكة',
    confirmed: 'المطعم قبله ✅',
    rejected: 'معلش، المكان ما قدرش يلبي',
    delivered: 'اتسلّم — بالهنا والشفا',
    contact: 'اتواصل معاهم',
    feedback: 'رأيك في الطلب؟',
  },
  empty: {
    generic: {
      title: 'لسه مفيش حاجة',
      body: 'احنا بنستعد — استنانا شوية',
    },
    favorites: {
      title: 'لسه محافظتش على حاجة',
      body: 'يلا ندوّر سوا ونلاقيلك حاجة تعجبك',
      cta: 'دوّر معانا',
    },
    orders: {
      title: 'لسه مطلبتش حاجة',
      body: 'لما تطلب، الأوردرات هتظهرلك هنا',
      cta: 'شوف الأماكن',
    },
    notifications: {
      title: 'مفيش إشعارات',
      body: 'هنقولك أول ما يحصل جديد',
    },
    reviews: {
      title: 'لسه مقيّمتش حاجة',
      body: 'رأيك بيهم أخواتك',
      cta: 'قيّم مكان',
    },
  },
  error: {
    generic: {
      title: 'في حاجة غلط',
      body: 'هنصلحها على طول',
      cta: 'حاول تاني',
    },
    network: {
      title: 'النت بيتقطع',
      body: 'شوف الاتصال وحاول تاني',
    },
    notFound: {
      title: 'الصفحة مش موجودة',
      body: 'يبدو إن الرابط غلط',
      cta: 'روح الرئيسية',
    },
    unauthorized: {
      title: 'لازم تدخل الأول',
      body: 'ادخل وارجعلنا',
      cta: 'ادخل',
    },
  },
  success: {
    generic: 'تمام ✓',
    saved: 'تم الحفظ يا غالي',
    deleted: 'اتحذف',
    updated: 'اتحدّث',
    copied: 'اتنسخ',
    sent: 'اتبعت',
  },
  footer: {
    tagline: 'اللي نفسك فيه ؟',
    followUs: 'خليك معانا',
    madeWith: 'اتعمل بحب',
    rights: 'كل الحقوق محفوظة',
  },
  palestine: {
    label: 'فلسطين في القلب',
    support: 'كلنا أخوات',
    cta: 'اعرف أكتر',
  },
  buttons: {
    save: 'احفظ',
    cancel: 'سيبها',
    delete: 'امسح',
    confirm: 'تمام',
    back: 'رجوع',
    next: 'كمّل',
    skip: 'عدّي',
    done: 'خلصت',
    tryAgain: 'حاول تاني',
    goHome: 'الرئيسية',
  },
} as const

// ═══ Helpers ═══

export function greeting(
  name: string | null | undefined,
  gender: Gender = 'unknown',
): string {
  const first = name?.split(' ')[0]
  if (!first) return pick(WELCOME, gender)
  return pick(WELCOME, gender) + ' يا ' + first
}

export function address(gender: Gender = 'unknown'): string {
  return pick(BROTHER, gender)
}

export function addressBiz(gender: Gender = 'unknown'): string {
  return pick(BROTHER_BIZ, gender)
}

export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    sent: COPY.order.sent,
    seen: 'شافه المطعم 👁',
    accepted: COPY.order.confirmed,
    rejected: COPY.order.rejected,
    delivered: COPY.order.delivered,
    cancelled: 'اتلغى',
  }
  return map[status] ?? status
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'دلوقتي'
  const min = Math.floor(sec / 60)
  if (min < 60) return 'من ' + min + ' دقيقة'
  const hr = Math.floor(min / 60)
  if (hr < 24) return 'من ' + hr + ' ساعة'
  const day = Math.floor(hr / 24)
  if (day < 7) return 'من ' + day + ' يوم'
  return d.toLocaleDateString('ar-EG')
}
