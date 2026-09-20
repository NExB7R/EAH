#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

python3 << PYEOF
from pathlib import Path
p = Path("docs/LIVE_STATE.md")
if p.exists():
    lines = p.read_text(encoding="utf-8").split("\n")
    for i, line in enumerate(lines[:10]):
        if line.startswith("> آخر تحديث"):
            lines[i] = f"> آخر تحديث: $TIMESTAMP — $BRANCH@$COMMIT"
            break
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ محدّث: $TIMESTAMP — $BRANCH@$COMMIT")
else:
    print("⚠️ LIVE_STATE.md مش موجود")
PYEOF
