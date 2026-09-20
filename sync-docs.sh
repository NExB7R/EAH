#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
FILE="docs/LIVE_STATE.md"

python3 << PYEOF
from pathlib import Path
p = Path("$FILE")
if not p.exists():
    print("⚠️ LIVE_STATE مش موجود")
    exit(0)

lines = p.read_text(encoding="utf-8").split("\n")
for i, line in enumerate(lines[:10]):
    if line.startswith("> آخر تحديث"):
        lines[i] = f"> آخر تحديث: $TIMESTAMP"
        break
p.write_text("\n".join(lines), encoding="utf-8")
print(f"✓ LIVE_STATE: $TIMESTAMP")
PYEOF
