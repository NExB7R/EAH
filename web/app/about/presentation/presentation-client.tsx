'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@/lib/hooks/use-mounted'
import { useRouter } from 'next/navigation'
import Logo from '@/components/logo'
import {
  SearchIcon,
  WhatsAppIcon,
  ShieldCheckIcon,
  StoreIcon,
  TrendingUpIcon,
  BellIcon,
  GiftIcon,
  TagIcon,
  SparkleStarIcon,
  MicIcon,
  NavigationIcon,
  InstallIcon,
  LayoutDashboardIcon,
  StarIcon,
  CrownGoldIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CloseIcon,
  CheckCircleIcon,
  InfoIcon,
  LampIcon,
  TargetIcon,
  SparklesIcon,
} from '@/components/icons'
import styles from './presentation.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Presentation Mode (12 slides)
// ═══════════════════════════════════════════════════════════

const TOTAL_SLIDES = 12
const SWIPE_THRESHOLD = 60
const AUTOPLAY_MS = 8000

export default function PresentationClient() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [autoplay, setAutoplay] = useState(false)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, TOTAL_SLIDES - 1))
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const exit = useCallback(() => {
    router.push('/about')
  }, [router])

  // keyboard + esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') next()
      else if (e.key === 'ArrowRight') prev()
      else if (e.key === 'Escape') exit()
      else if (e.key === ' ') {
        e.preventDefault()
        setAutoplay((a) => !a)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, exit])

  // autoplay
  useEffect(() => {
    if (!autoplay || paused || reduced) return
    const t = setInterval(() => {
      setIndex((i) => (i < TOTAL_SLIDES - 1 ? i + 1 : 0))
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [autoplay, paused, reduced])

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const end = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = end - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  // click zones (نص يمين → السابق / نص شمال → التالي)
  const onZoneClick = (side: 'prev' | 'next') => {
    if (side === 'prev') prev()
    else next()
  }

  const progress = ((index + 1) / TOTAL_SLIDES) * 100

  return (
    <div
      ref={containerRef}
      className={styles.presentation}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress Bar */}
      <div className={styles.progressBar} aria-hidden>
        <span className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Top Bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.topBtn} onClick={exit} aria-label="خروج">
          <CloseIcon size={18} />
        </button>

        <div className={styles.topCenter}>
          <span className={styles.slideCounter}>
            <span className={styles.counterNow}>{index + 1}</span>
            <span className={styles.counterSep}>/</span>
            <span className={styles.counterTotal}>{TOTAL_SLIDES}</span>
          </span>
        </div>

        <button
          type="button"
          className={`${styles.topBtn} ${autoplay ? styles.topBtnActive : ''}`}
          onClick={() => setAutoplay((a) => !a)}
          aria-label={autoplay ? 'إيقاف التشغيل' : 'تشغيل تلقائي'}
        >
          {autoplay ? (
            <span className={styles.pause}>❚❚</span>
          ) : (
            <span className={styles.play}>▶</span>
          )}
        </button>
      </div>

      {/* Slides */}
      <div className={styles.stage}>{renderSlide(index)}</div>

      {/* Click zones */}
      <button
        type="button"
        className={`${styles.zone} ${styles.zonePrev}`}
        onClick={() => onZoneClick('prev')}
        aria-label="السابق"
        tabIndex={-1}
      />
      <button
        type="button"
        className={`${styles.zone} ${styles.zoneNext}`}
        onClick={() => onZoneClick('next')}
        aria-label="التالي"
        tabIndex={-1}
      />

      {/* Bottom: Dots */}
      <nav className={styles.dots} aria-label="الشرائح">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`الشريحة ${i + 1}`}
            aria-current={i === index ? 'step' : undefined}
          />
        ))}
      </nav>

      {/* Side arrows (subtle) */}
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={prev}
        disabled={index === 0}
        aria-label="السابق"
      >
        <ArrowLeftIcon size={20} />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={next}
        disabled={index === TOTAL_SLIDES - 1}
        aria-label="التالي"
      >
        <ArrowLeftIcon size={20} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Slides
// ═══════════════════════════════════════════════════════════

function renderSlide(i: number) {
  switch (i) {
    case 0:
      return <SlideCover />
    case 1:
      return <SlideProblem />
    case 2:
      return <SlideIdea />
    case 3:
      return <SlideSolution />
    case 4:
      return <SlideCustomer />
    case 5:
      return <SlideMerchant />
    case 6:
      return <SlideHow />
    case 7:
      return <SlideTrust />
    case 8:
      return <SlideVision />
    case 9:
      return <SlidePalestine />
    case 10:
      return <SlideTeam />
    case 11:
      return <SlideCTA />
    default:
      return null
  }
}

// ─── 1. Cover ───
function SlideCover() {
  return (
    <div className={styles.slide}>
      <div className={styles.coverLogo}>
        <Logo size="lg" />
      </div>
      <span className={styles.coverBadge}>
        <MapPinIcon size={12} />
        من قلب شبين القناطر
      </span>
      <h1 className={styles.coverTitle}>
        شبيك لبيك ..
        <br />
        <span className={styles.accent}>كل حاجة حواليك</span>
      </h1>
      <p className={styles.coverText}>
        منصة اكتشاف محلية مصرية
        <br />
        مجانية للعميل · بدون عمولة على التاجر
      </p>
    </div>
  )
}

// ─── 2. Problem ───
function SlideProblem() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>01 · المشكلة</span>
      <h2 className={styles.slideTitle}>ليه EAH موجودة؟</h2>
      <p className={styles.slideLead}>في شبين القناطر، أنشطة كتير. بس مفيش طريقة سهلة تلاقيها.</p>
      <div className={styles.trioGrid}>
        <TrioCard num="01" title="مفيش دليل موحد" text="كل نشاط في حتة — مفيش مكان يجمعهم." />
        <TrioCard num="02" title="تقييمات مبعترة" text="مفيش طريقة موثوقة تعرف منها الكويس." />
        <TrioCard num="03" title="التجار محتاجين ظهور" text="محتاجين يوصلوا للعملاء — بدون عمولات." />
      </div>
    </div>
  )
}

// ─── 3. Idea ───
function SlideIdea() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>02 · الفكرة</span>
      <h2 className={styles.slideTitle}>
        نجمع كل الأنشطة في <span className={styles.accent}>منصة واحدة</span>
      </h2>
      <div className={styles.ideaBox}>
        <div className={styles.ideaRow}>
          <span className={styles.ideaIcon}>
            <CheckCircleIcon size={22} />
          </span>
          <div>
            <strong className={styles.ideaStrong}>مجانية للعميل</strong>
            <p className={styles.ideaText}>صفر رسوم · صفر اشتراكات</p>
          </div>
        </div>
        <div className={styles.ideaRow}>
          <span className={styles.ideaIcon}>
            <CheckCircleIcon size={22} />
          </span>
          <div>
            <strong className={styles.ideaStrong}>بدون عمولة على التاجر</strong>
            <p className={styles.ideaText}>كل الأرباح للتاجر</p>
          </div>
        </div>
        <div className={styles.ideaRow}>
          <span className={styles.ideaIcon}>
            <CheckCircleIcon size={22} />
          </span>
          <div>
            <strong className={styles.ideaStrong}>طلب مباشر</strong>
            <p className={styles.ideaText}>واتساب — بدون وسيط</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Solution ───
function SlideSolution() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>03 · الحل</span>
      <h2 className={styles.slideTitle}>EAH بتعمل إيه؟</h2>
      <div className={styles.trioGrid}>
        <TrioCard
          num="🔎"
          title="اكتشاف سهل"
          text="بحث ذكي باللهجة المصرية + فلاتر + ترشيحات."
          icon={<SearchIcon size={22} />}
        />
        <TrioCard
          num="💬"
          title="طلب مباشر"
          text="رسالة واتساب جاهزة — والتاجر يرد في دقايق."
          icon={<WhatsAppIcon size={22} />}
        />
        <TrioCard
          num="🛡️"
          title="تقييم موثوق"
          text="تقييم بعد التجربة + معلومات واضحة عن النشاط."
          icon={<ShieldCheckIcon size={22} />}
        />
      </div>
    </div>
  )
}

// ─── 5. Customer ───
function SlideCustomer() {
  return (
    <div className={styles.slide}>
      <span className={`${styles.slideBadge} ${styles.badgePurple}`}>للعميل</span>
      <h2 className={styles.slideTitle}>مجاناً 100%</h2>
      <div className={styles.iconGrid}>
        <IconTile Icon={SearchIcon} label="بحث ذكي" />
        <IconTile Icon={MicIcon} label="بحث صوتي" />
        <IconTile Icon={SparkleStarIcon} label="ترشيحات" />
        <IconTile Icon={TagIcon} label="عروض" />
        <IconTile Icon={GiftIcon} label="نقاط" />
        <IconTile Icon={BellIcon} label="إشعارات" />
        <IconTile Icon={NavigationIcon} label="قريب منك" />
        <IconTile Icon={InstallIcon} label="تطبيق قابل للتثبيت" />
      </div>
    </div>
  )
}

// ─── 6. Merchant ───
function SlideMerchant() {
  return (
    <div className={styles.slide}>
      <span className={`${styles.slideBadge} ${styles.badgeGold}`}>للتاجر</span>
      <h2 className={styles.slideTitle}>ظهور مجاني · بدون عمولة</h2>
      <div className={styles.iconGrid}>
        <IconTile Icon={StoreIcon} label="صفحة كاملة" gold />
        <IconTile Icon={WhatsAppIcon} label="طلبات واتساب" gold />
        <IconTile Icon={LayoutDashboardIcon} label="لوحة تحكم" gold />
        <IconTile Icon={TrendingUpIcon} label="تحليلات" gold />
        <IconTile Icon={StarIcon} label="تقييمات" gold />
        <IconTile Icon={ShieldCheckIcon} label="شارة ثقة" gold />
        <IconTile Icon={GiftIcon} label="عروض" gold />
        <IconTile Icon={CrownGoldIcon} label="ترقيات" gold />
      </div>
    </div>
  )
}

// ─── 7. How ───
function SlideHow() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>إزاي</span>
      <h2 className={styles.slideTitle}>3 خطوات</h2>
      <div className={styles.stepsRow}>
        <StepCard num="1" title="اكتشف" text="ابحث أو اتفرج على الأقسام." />
        <StepCard num="2" title="اتواصل" text="رسالة واتساب جاهزة في ضغطة." />
        <StepCard num="3" title="قيّم" text="ساعد غيرك — رأيك يساعد." />
      </div>
    </div>
  )
}

// ─── 8. Trust ───
function SlideTrust() {
  return (
    <div className={styles.slide}>
      <span className={`${styles.slideBadge} ${styles.badgeTeal}`}>أمان</span>
      <h2 className={styles.slideTitle}>أمان وشفافية</h2>
      <div className={styles.trioGrid}>
        <TrioCard
          num="🛡️"
          title="حماية كاملة للبيانات"
          text="كل جدول محمي. صفر تسريب."
          icon={<ShieldCheckIcon size={22} />}
        />
        <TrioCard
          num="🔒"
          title="بياناتك لك"
          text="مفيش بيع بيانات. مفيش تتبع خفي."
          icon={<InfoIcon size={22} />}
        />
        <TrioCard
          num="✨"
          title="لا حيل تصميمية مضللة"
          text="مفيش إعلانات مزعجة. لا اشتراك تلقائي."
          icon={<LampIcon size={22} />}
        />
      </div>
    </div>
  )
}

// ─── 9. Vision ───
function SlideVision() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>الرؤية</span>
      <h2 className={styles.slideTitle}>
        <span className={styles.accent}>500 ألف</span> مستخدم خلال 5 سنين
      </h2>
      <div className={styles.visionRow}>
        <VisionStat num="100" label="نشاط" sub="سنة 1" />
        <VisionStat num="1,000" label="نشاط" sub="سنوات 2-3" />
        <VisionStat num="5,000+" label="نشاط" sub="سنة 5" />
        <VisionStat num="500 ألف+" label="مستخدم" sub="سنة 5" />
      </div>
      <div className={styles.visionLine} aria-hidden />
      <div className={styles.trioGrid}>
        <TrioCard
          num="📍"
          title="البداية"
          text="شبين القناطر + القرى"
          icon={<MapPinIcon size={22} />}
        />
        <TrioCard
          num="🗺️"
          title="التوسّع"
          text="القليوبية → الدلتا"
          icon={<TargetIcon size={22} />}
        />
        <TrioCard
          num="🌍"
          title="الحلم"
          text="محافظات مصر كلها"
          icon={<SparklesIcon size={22} />}
        />
      </div>
    </div>
  )
}

// ─── 10. Palestine ───
function SlidePalestine() {
  return (
    <div className={`${styles.slide} ${styles.slidePalestine}`}>
      <span className={styles.palestineFlag}>🇵🇸</span>
      <h2 className={styles.palestineTitle}>فلسطين في القلب</h2>
      <p className={styles.palestineText}>
        EAH منصة فلسطينية الهوى، مصرية الجذور.
        <br />
        <strong className={styles.accent}>2% من دخل الباقات</strong> تروح لصندوق دعم فلسطين.
      </p>
    </div>
  )
}

// ─── 11. Team ───
function SlideTeam() {
  return (
    <div className={styles.slide}>
      <span className={styles.slideBadge}>المؤسس</span>
      <div className={styles.teamCard}>
        <div className={styles.teamAvatar}>N</div>
        <h3 className={styles.teamName}>NourEldin B7R</h3>
        <p className={styles.teamRole}>المؤسس · </p>
        <div className={styles.teamLine} aria-hidden />
        <p className={styles.teamText}>
          بدأت EAH من حلم بسيط: نوصّل الناس بأماكنهم، ونوقف استغلال التجار.
        </p>
      </div>
    </div>
  )
}

// ─── 12. CTA ───
function SlideCTA() {
  return (
    <div className={styles.slide}>
      <h2 className={styles.ctaTitle}>
        جاهز تبدأ مع <span className={styles.accent}>EAH</span>؟
      </h2>
      <p className={styles.ctaText}>اكتشف. اطلب. قيّم. أو سجّل نشاطك.</p>
      <div className={styles.ctaBtns}>
        <a href="/explore" className={styles.btnPrimary}>
          اكتشف الأنشطة
        </a>
        <a href="/merchant/apply" className={styles.btnSecondary}>
          سجّل نشاطك
        </a>
      </div>
      <p className={styles.ctaFooter}>
        شبيك لبيك .. <span className={styles.accent}>كل حاجة حواليك</span>
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Shared Sub-components
// ═══════════════════════════════════════════════════════════

function TrioCard({
  num,
  title,
  text,
  icon,
}: {
  num: string
  title: string
  text: string
  icon?: React.ReactNode
}) {
  return (
    <div className={styles.trioCard}>
      <span className={styles.trioNum}>{icon ?? num}</span>
      <h3 className={styles.trioTitle}>{title}</h3>
      <p className={styles.trioText}>{text}</p>
    </div>
  )
}

function IconTile({
  Icon,
  label,
  gold,
}: {
  Icon: React.ComponentType<{ size?: number }>
  label: string
  gold?: boolean
}) {
  return (
    <div className={`${styles.iconTile} ${gold ? styles.iconTileGold : ''}`}>
      <span className={styles.iconTileIcon}>
        <Icon size={20} />
      </span>
      <span className={styles.iconTileLabel}>{label}</span>
    </div>
  )
}

function StepCard({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className={styles.stepCard}>
      <span className={styles.stepNum}>{num}</span>
      <h3 className={styles.stepTitle}>{title}</h3>
      <p className={styles.stepText}>{text}</p>
    </div>
  )
}

function VisionStat({ num, label, sub }: { num: string; label: string; sub: string }) {
  return (
    <div className={styles.visionStat}>
      <span className={styles.visionNum}>{num}</span>
      <span className={styles.visionLabel}>{label}</span>
      <span className={styles.visionSub}>{sub}</span>
    </div>
  )
}
