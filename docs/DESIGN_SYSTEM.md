# EAH - DESIGN_SYSTEM.md

> نظام التصميم الكامل: الألوان، الخطوط، المكونات، القواعد.
> اقرأ SACRED.md الأول.

آخر تحديث: 2026-09-24
الإصدار: 1.0

---

## 1. الألوان

### 1.1 الأساسية

الخلفية:
- bg-base: #07020D
- bg-elevated: #0A0514
- bg-surface: #130822
- bg-overlay: rgba(7, 2, 13, 0.85)

البنفسجي:
- purple-primary: #9D4EDD
- purple-neon: #A855F7
- purple-light: #C77DFF
- purple-soft: rgba(168, 85, 247, 0.12)
- purple-line: rgba(168, 85, 247, 0.28)

الذهبي:
- gold-primary: #E8C79A
- gold-light: #F5D9A7
- gold-soft: rgba(232, 199, 154, 0.12)
- gold-line: rgba(232, 199, 154, 0.28)

الثانوية:
- teal: #55E7D1 (نجاح)
- orange: #FDBA74 (ترند)
- red: #FCA5A5 (تحذير)

### 1.2 النصوص

- text-primary: #F4F2FA (عناوين)
- text-secondary: #C9C2DB (نص)
- text-tertiary: #A29DB5 (ثانوي)
- text-muted: #7B7490 (خافت)
- text-disabled: #4A4555

### 1.3 الاستخدام

البنفسجي:
- الأزرار الأساسية
- اللينكات
- الحدود النشطة
- hover states

الذهبي:
- المميزين
- الأرقام المهمة
- الشارات
- التوقيع

Teal:
- رسائل النجاح
- "تم" checkbox
- التأكيدات

Orange:
- الترند
- العروض
- التنبيهات الودية

Red:
- الأخطاء
- التحذيرات
- "مغلق"
- الحظر

---

## 2. الخطوط

### 2.1 العائلات

- Cairo Variable: النص الأساسي
- Tajawal Variable: العناوين (Display)
- Brush Script MT: التوقيع

### 2.2 الأحجام

- xs: 0.65rem (10px)
- sm: 0.75rem (12px)
- base: 0.875rem (14px)
- md: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 2rem (32px)
- 4xl: 2.5rem (40px)

### 2.3 الأوزان

- regular: 400
- semibold: 600
- bold: 700
- extrabold: 800
- black: 900

### 2.4 الارتفاعات

- tight: 1.15 (عناوين)
- normal: 1.5 (نص)
- relaxed: 1.75 (نص طويل)

---

## 3. المسافات

- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 20px
- space-6: 24px
- space-8: 32px
- space-10: 40px
- space-12: 48px
- space-16: 64px

---

## 4. الحدود

- border-thin: 1px
- border-base: 1.5px
- border-thick: 2px

- radius-sm: 8px
- radius-base: 12px
- radius-md: 14px
- radius-lg: 16px
- radius-xl: 20px
- radius-full: 9999px

---

## 5. الظلال

- shadow-sm: 0 2px 8px rgba(0,0,0,0.2)
- shadow-base: 0 4px 16px rgba(0,0,0,0.3)
- shadow-md: 0 8px 24px rgba(0,0,0,0.4)
- shadow-lg: 0 12px 32px rgba(0,0,0,0.5)

Glow:
- glow-purple-sm: 0 0 0 1px rgba(168,85,247,0.35), 0 0 10px rgba(168,85,247,0.12)
- glow-purple-md: 0 0 0 1px rgba(168,85,247,0.45), 0 0 16px rgba(168,85,247,0.18)
- glow-purple-lg: 0 0 0 1px rgba(168,85,247,0.55), 0 0 24px rgba(168,85,247,0.28)

- glow-gold-sm: 0 0 0 1px rgba(232,199,154,0.35), 0 0 10px rgba(232,199,154,0.15)
- glow-gold-md: 0 0 0 1px rgba(232,199,154,0.45), 0 0 16px rgba(232,199,154,0.22)

---

## 6. الحركات

### 6.1 المدد

- instant: 100ms
- fast: 180ms
- base: 240ms
- slow: 400ms

### 6.2 منحنيات

- ease: cubic-bezier(0.4, 0, 0.2, 1)
- ease-out: cubic-bezier(0.22, 1, 0.36, 1)
- spring: cubic-bezier(0.34, 1.56, 0.64, 1)

### 6.3 القواعد

مسموح:
- hover transitions (180-240ms)
- entrance animations (200-400ms)
- focus rings (150ms)
- color transitions (200ms)

ممنوع:
- animations مستمرة
- durations > 400ms
- bounce/elastic عدا الأزرار الأساسية
- rotations مستمرة

---

## 7. الأنماط (Patterns)

### 7.1 Glass Card

خلفية: linear-gradient(160deg, rgba(20,14,34,0.85), rgba(10,7,20,0.92))
حدود: 1px solid rgba(168,85,247,0.22)
radius: 16px
بدون backdrop-filter

### 7.2 Neon Border

حدود: 1px solid rgba(168,85,247,0.4)
glow: 0 0 16px rgba(168,85,247,0.18)

### 7.3 Gold Accent

حدود: 1px solid rgba(232,199,154,0.3)
glow: 0 0 12px rgba(232,199,154,0.15)

### 7.4 Gradient Text

background: linear-gradient(180deg, #F5E4BC, #E8C79A, #C9A56C)
-webkit-background-clip: text
-webkit-text-fill-color: transparent
filter: drop-shadow ناعم

---

## 8. المكونات الأساسية

### 8.1 Button

Variants:
- primary (بنفسجي)
- gold (ذهبي)
- ghost (شفاف)
- danger (أحمر)

Sizes:
- sm: 32px height
- md: 40px
- lg: 48px

States:
- default
- hover (translateY -1px)
- active (translateY 0)
- disabled (opacity 0.5)
- loading (spinner)

### 8.2 Input

- Height: 40px
- Radius: 12px
- Border: 1px solid rgba(168,85,247,0.22)
- Focus: border purple + glow
- Placeholder: text-muted

### 8.3 Card

- Radius: 14-16px
- Border: 1px solid rgba(168,85,247,0.2)
- Hover: border + translateY -2px
- Padding: 12-16px

---

## 9. المكونات الإضافية

### Modal
- خلفية: rgba(7,2,13,0.85)
- Panel: glass card
- Radius: 20px
- Padding: 24px
- Close X في الأعلى

### Toast
- Position: أسفل يمين (desktop) / أسفل الوسط (mobile)
- Radius: 14px
- Duration: 3-5 ثواني
- Variants: success / error / info

### Skeleton
- خلفية: rgba(168,85,247,0.06)
- Animation: shimmer (1.5s)
- Shapes: line / circle / rect

### Badge
- Radius: 999px
- Padding: 3-8px
- Sizes: xs / sm / md
- Colors: purple / gold / teal / orange / red

### Chip
- Shape: pill
- Border: 1px solid rgba(168,85,247,0.2)
- Background: rgba(168,85,247,0.08)
- Font: 0.68rem / 800

### Avatar
- Sizes: 24 / 32 / 40 / 48 / 64px
- Border-radius: 50%
- Border: 2px solid purple-soft
- Fallback: initial letter

---

## 10. Layouts

### Container
- max-width: 1280px
- margin: 0 auto
- padding: 0 16px (mobile) / 24px (desktop)

### Section
- margin: 24px auto
- gap: 16px

### Grid
- 1 col (mobile)
- 2 col (tablet)
- 3-4 col (desktop)
- gap: 12-16px

### Flex
- Row أو Column
- gap: 8-16px

---

## 11. Responsive Breakpoints

- xs: 320px (iPhone SE)
- sm: 393px (iPhone 14)
- md: 640px (mobile landscape)
- lg: 768px (iPad Mini)
- xl: 1024px (iPad Pro)
- 2xl: 1440px (Laptop)
- 3xl: 2560px+ (4K)

---

## 12. Container Queries

استخدم container queries بدل media queries لما ممكن:

مثال:
- card-wrapper: container-type inline-size
- عند min-width 400px داخل الحاوية:
  - card يبقى grid 2fr 1fr

الفايدة: الكارت يتكيف حسب حجم الحاوية، مش حجم الشاشة.

---

## 13. أنماط النصوص

### h1 (العنوان الرئيسي)
- Font: Tajawal
- Size: clamp(1.5rem, 4vw, 2.5rem)
- Weight: 900
- Line-height: 1.15
- Gradient ذهبي أو بنفسجي

### h2 (العنوان الثانوي)
- Font: Tajawal
- Size: clamp(1.15rem, 2.8vw, 1.7rem)
- Weight: 900

### p (الفقرة)
- Font: Cairo
- Size: 0.85-0.95rem
- Weight: 600
- Line-height: 1.7

### small (الكابشن)
- Size: 0.68-0.75rem
- Weight: 700
- Color: text-tertiary

---

## 14. Iconography

- Library: SVG custom (components/eah-icons.tsx)
- Style: outline
- Stroke: 1.8-2.2
- Sizes: 14 / 16 / 18 / 20 / 24 / 32
- ممنوع: emoji في UI
- مسموح: emoji في بيانات (مش UI)

---

## 15. Accessibility

- Contrast: WCAG AA
- Touch targets: 44px+
- Focus visible: 2px solid purple
- ARIA labels على كل عنصر تفاعلي
- Keyboard navigation
- Skip to content
- Reduced motion supported

---

## 16. قواعد صارمة

مسموح:
- CSS Modules
- CSS Variables
- Container Queries
- Native scroll

ممنوع:
- inline styles (إلا dynamic)
- !important بدون سبب
- Tailwind
- styled-components
- CSS-in-JS libraries
- animations مستمرة
- backdrop-filter على الكروت

---

## 17. الملفات المرتبطة

- docs/SACRED.md - المقدسات
- docs/MASTER_BRIEF.md - الرؤية
- docs/AI_CONTRACT.md - القواعد

---

آخر تحديث: 2026-09-24
الإصدار: 1.0
المالك: NourEldin B7R - فلسطين في القلب
