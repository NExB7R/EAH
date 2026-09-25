# EAH — STRUCTURE.md

> بنية الملفات + قواعد التنظيم + ترتيب الكود.
> آخر تحديث: 2026-09-25

---

## 1. البنية العامة

```
EAH-V2/
├── docs/                      ← الوثائق
├── web/                       ← Next.js app
│   ├── app/                   ← App Router
│   ├── components/            ← مكونات
│   ├── lib/                   ← Utilities
│   ├── public/                ← Static assets
│   ├── proxy.ts               ← Session refresh
│   └── next.config.ts         ← Config
└── CHANGELOG.md
```

---

## 2. قواعد التسمية

| النوع | Convention | مثال |
|------|-----------|------|
| Components | PascalCase | BusinessCard.tsx |
| Files | kebab-case | business-card.tsx |
| Variables | camelCase | userName |
| Constants | UPPER_SNAKE | MAX_RETRIES |
| CSS Classes | camelCase | .cardHeader |
| CSS Variables | kebab-case | --purple-primary |
| Types | PascalCase | BusinessType |
| DB Tables | snake_case | business_media |

---

## 3. ترتيب الملفات

### Component (.tsx)

1. Imports (external → internal → relative)
2. Types
3. Constants
4. Helpers
5. Component
6. Export

### CSS Module

1. Base
2. Variants
3. States
4. Children
5. Responsive
6. Reduced motion

---

## 4. ترتيب الـ Imports

1. React
2. Next.js
3. External libraries
4. Internal (@/ aliases)
5. Relative

---

## 5. قواعد DRY / KISS / YAGNI

### DRY (Don't Repeat Yourself)
- 3 مرات → استخرج Helper/Component.
- 3 مرات CSS → Variable.
- 3 مرات query → دالة.

### KISS (Keep It Simple)
- أبسط حل = الأحسن.
- مفيش over-engineering.

### YAGNI (You Aren't Gonna Need It)
- متضيفش features لم تُطلب.
- متضيفش flexibility قبل الحاجة.

---

## 6. مسؤوليات الملفات

| الملف | المسؤولية |
|------|-----------|
| app/page.tsx | Server Component — fetch + render |
| components/*.tsx | UI (Client أو Server) |
| lib/data.ts | Data fetching |
| lib/ranking.ts | ترتيب + scoring |
| lib/supabase/* | Supabase clients |
| proxy.ts | Middleware |
| next.config.ts | Config + CSP |

**القاعدة:** ملف واحد = مسؤولية واحدة.

---

## 7. Features (إضافة جديدة)

1. مجلد في app/ — app/[feature]/page.tsx
2. مجلد في components/[feature]/
3. دالة في lib/data.ts
4. Schema في lib/validations/
5. Action في app/[feature]/actions.ts

---

## 8. المراجع

- AI_CONTRACT.md
- ARCHITECTURE.md
- DESIGN_SYSTEM.md
- LESSONS.md

---

آخر تحديث: 2026-09-25