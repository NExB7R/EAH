#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

MSG="$1"
[ -z "$MSG" ] && { echo "Usage: ./add-changelog.sh 'msg'"; exit 1; }

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
today_header = f"### {today}"

start_marker = "<!-- AUTO_START -->"
end_marker = "<!-- AUTO_END -->"

if start_marker not in s or end_marker not in s:
    print("⚠️ markers مش موجودة")
    exit(0)

# ابحث على الـ section بتاع النهاردة في الـ AUTO area
auto_start = s.index(start_marker) + len(start_marker)
auto_end = s.index(end_marker)
auto_block = s[auto_start:auto_end]

if today_header in auto_block:
    # ضيف سطر في الـ section
    lines = auto_block.split("\n")
    for i, line in enumerate(lines):
        if line.strip() == today_header:
            insert_at = i + 1
            while insert_at < len(lines) and lines[insert_at].strip() == "":
                insert_at += 1
            while insert_at < len(lines) and lines[insert_at].strip().startswith("- **"):
                insert_at += 1
            lines.insert(insert_at, f"- **{time}** — {msg}")
            break
    new_block = "\n".join(lines)
else:
    # اعمل section جديد
    if auto_block.strip():
        new_block = auto_block.rstrip() + f"\n\n{today_header}\n\n- **{time}** — {msg}\n"
    else:
        new_block = f"\n\n{today_header}\n\n- **{time}** — {msg}\n"

s = s[:auto_start] + new_block + s[auto_end:]
p.write_text(s, encoding="utf-8")
print(f"✓ CHANGELOG: {today} {time}")
PYEOF
