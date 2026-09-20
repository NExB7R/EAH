#!/usr/bin/env bash
# EAH — إضافة سطر تلقائي في CHANGELOG
set -e
cd "$(dirname "$0")"

MSG="$1"
if [ -z "$MSG" ]; then
  echo "الاستخدام: ./add-changelog.sh 'feat: something'"
  exit 1
fi

TODAY=$(date -u +"%Y-%m-%d")
TIME=$(date -u +"%H:%M")
FILE="CHANGELOG.md"

python3 << PYEOF
from pathlib import Path
p = Path("$FILE")
if not p.exists():
    print("⚠️ CHANGELOG.md مش موجود")
    exit(0)

s = p.read_text(encoding="utf-8")
today = "$TODAY"
msg = "$MSG"
time = "$TIME"

# لو النهاردة موجود كـ section
header = f"## {today}"
if header in s:
    # ضيف السطر بعد الهيدر مباشرة
    lines = s.split("\n")
    for i, line in enumerate(lines):
        if line.strip() == header:
            # ابحث عن آخر سطر بيبدأ بـ - ** تحت الهيدر
            insert_at = i + 1
            # تخطّى سطر فاضي
            while insert_at < len(lines) and lines[insert_at].strip() == "":
                insert_at += 1
            lines.insert(insert_at, f"- **{time}** — {msg}")
            break
    s = "\n".join(lines)
else:
    # اعمل section جديد بعد المقدمة
    marker = "> كل تعديل كبير بيتسجّل هنا. صيغة: YYYY-MM-DD — الوصف"
    if marker in s:
        idx = s.index(marker) + len(marker)
        # تخطّى السطور لحد أول ##
        next_h = s.index("\n## ", idx) if "\n## " in s[idx:] else len(s)
        new_section = f"\n\n## {today}\n\n- **{time}** — {msg}\n"
        s = s[:next_h] + new_section + s[next_h:]
    else:
        s += f"\n\n## {today}\n\n- **{time}** — {msg}\n"

p.write_text(s, encoding="utf-8")
print(f"✓ CHANGELOG محدّث: {today} {time}")
PYEOF
