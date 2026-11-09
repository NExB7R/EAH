# EAH — Design Tokens (2026-11-09)

> **الغرض:** قيم موحدة مستخدمة عبر المنصة. أي تعديل في القيمة = تعديل في كل مكان.
> **القاعدة:** استخدم tokens بدل الأرقام اليدوية في أي `*.module.css` جديد.

## الألوان الأساسية (Tokens)

### Purple (168, 85, 247)
- `--purple-2-06` = 0.06 opacity
- `--purple-2-08` = 0.08
- `--purple-2-10` = 0.10
- `--purple-2-12` = 0.12
- `--purple-2-15` = 0.15
- `--purple-2-20` = 0.20 (الحدود القياسية)
- `--purple-2-22` = 0.22
- `--purple-2-25` = 0.25
- `--purple-2-30` = 0.30
- `--purple-2-40` = 0.40
- `--purple-2-50` = 0.50

### Gold (232, 199, 154) — Premium
- `--gold-06` إلى `--gold-50` بنفس التدرج

### Teal (85, 231, 209) — Open/Closest/24h
- `--teal-06` إلى `--teal-40`

## Radius Scale
- `--radius-8` = 8px
- `--radius-10` = 10px
- `--radius-12` = 12px
- `--radius-14` = 14px
- `--radius-16` = 16px
- `--radius-18` = 18px
- `--radius-20` = 20px
- `--radius-22` = 22px
- `--radius-full` = 999px

## مثال

```css
.action {
  border: 1px solid var(--purple-2-22);
  border-radius: var(--radius-16);
  background: var(--purple-2-06);
}
