import type React from 'react'
import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './legal.css'

export const metadata = {
  title: 'سياسة الخصوصية',
  description: 'كيف بنحمي بياناتك في EAH — شفافية كاملة، بدون تعقيد.',
}

const SECTIONS = [
  {
    id: 'collect',
    title: '1. البيانات اللي بنجمعها',
    items: [
      '**بيانات الحساب:** الاسم، رقم الهاتف، وكلمة المرور (مشفّرة بالكامل).',
      '**بيانات الاستخدام:** الصفحات اللي بتزورها، البحث، والتفاعل مع الأماكن — عشان نحسّن الترشيحات.',
      '**بيانات الموقع التقريبية:** بتساعدنا نرشحلك الأقرب ليك. مش بنسجّل موقعك الدقيق ولا بنشاركه.',
      '**بيانات النشاط (لو عندك متجر):** معلومات المكان، صور، منيو، وساعات العمل.',
    ],
  },
  {
    id: 'why',
    title: '2. ليه بنجمعها',
    items: [
      'نقدّم تجربة مخصصة حسب اهتماماتك.',
      'نرشحلك الأماكن الأقرب لمزاجك وموقعك.',
      'نحمي المنصة من التلاعب والإساءة.',
      'نحسّن الخدمة بناءً على أنماط الاستخدام.',
    ],
  },
  {
    id: 'share',
    title: '3. مشاركة البيانات',
    items: [
      '**إحنا ما بنبيعش بياناتك لأي طرف.**',
      'بنشاركها فقط مع مقدمي البنية التحتية (مثل Supabase وVercel) بحدود تشغيل الخدمة.',
      'الجهات القانونية عند الطلب الرسمي فقط.',
    ],
  },
  {
    id: 'rights',
    title: '4. حقوقك',
    items: [
      '**حق الوصول:** تعرف كل البيانات اللي عندنا عليك.',
      '**حق التصحيح:** تعدّل أي معلومة غلط.',
      '**حق الحذف:** تطلب مسح حسابك وكل بياناتك نهائيًا.',
      '**حق الاعتراض:** توقف أي استخدام معيّن لبياناتك.',
    ],
  },
  {
    id: 'security',
    title: '5. الأمان',
    items: [
      'بياناتك محفوظة باستخدام تشفير على مستوى المؤسسات.',
      'كلمات المرور ما بنشوفهاش — بتخزّن مشفرة بالكامل.',
      'بنراقب كل عملية حساسة ونسجّلها.',
      'بنستخدم RLS (Row-Level Security) على قاعدة البيانات.',
    ],
  },
  {
    id: 'cookies',
    title: '6. الكوكيز',
    items: [
      'بنستخدم كوكيز أساسية للحفاظ على جلستك.',
      'مفيش تتبّع إعلاني من طرف ثالث.',
      'التفاصيل الكاملة في [سياسة الكوكيز](/cookies).',
    ],
  },
  {
    id: 'children',
    title: '7. الأطفال',
    items: [
      'المنصة غير مخصصة لمن هم أقل من 13 سنة.',
      'لو اكتشفنا حساب قاصر، بنوقفه فورًا.',
    ],
  },
  {
    id: 'changes',
    title: '8. التعديلات',
    items: [
      'بنحدّث السياسة عند الحاجة، وبنسجّل تاريخ كل تعديل.',
      'هنبلّغك لو فيه تغيير جوهري.',
    ],
  },
  {
    id: 'contact',
    title: '9. تواصل معنا',
    items: [
      'في أي استفسار عن خصوصيتك — كلّمنا على [واتساب](https://wa.me/201012892806).',
      'بنجاوب في أقرب وقت ممكن.',
    ],
  },
]

function renderText(text: string) {
  // بسيط: يحول **bold** و [link](url)
  const parts: (string | React.ReactNode)[] = []
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  let lastIdx = 0
  let match
  let key = 0
  while ((match = regex.exec(text))) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    } else {
      const m = token.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (m) parts.push(<Link key={key++} href={m[2]}>{m[1]}</Link>)
    }
    lastIdx = regex.lastIndex
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

export default function PrivacyPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="legal">
        <header className="legal__head">
          <span className="legal__kicker">PRIVACY</span>
          <h1 className="legal__title">سياسة الخصوصية</h1>
          <p className="legal__lead">
            شفافية كاملة. بياناتك أمانة، وبنحترمها.
          </p>
          <div className="legal__meta">
            <span>آخر تحديث: 14 سبتمبر 2026</span>
            <span>•</span>
            <span>وقت القراءة: 4 دقائق</span>
          </div>
        </header>

        <nav className="legal__toc">
          <span className="legal__toc-title">المحتوى</span>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal__body">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="legal__section">
              <h2 className="legal__section-title">{s.title}</h2>
              <ul className="legal__list">
                {s.items.map((it, i) => (
                  <li key={i}>{renderText(it)}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="legal__foot">
          <p>
            لأي استفسار، تواصل معنا على{' '}
            <a href="https://wa.me/201012892806" target="_blank" rel="noreferrer">
              واتساب
            </a>
            .
          </p>
        </footer>
      </main>
      <SiteFooter />
    </>
  )
}
