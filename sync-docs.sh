#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

python3 -c "
from pathlib import Path
p = Path(chr(100)+chr(111)+chr(99)+chr(115)+chr(47)+chr(76)+chr(73)+chr(86)+chr(69)+chr(95)+chr(83)+chr(84)+chr(65)+chr(84)+chr(69)+chr(46)+chr(109)+chr(100))
if p.exists():
    s = p.read_text(encoding=chr(117)+chr(116)+chr(102)+chr(45)+chr(56))
    import re
    s = re.sub(r.آخر تحديث: [^\n]+, f.آخر تحديث: $TIMESTAMP — $BRANCH@$COMMIT., s, count=1)
    p.write_text(s, encoding=chr(117)+chr(116)+chr(102)+chr(45)+chr(56))
    print(f.✓ محدّث: $TIMESTAMP — $BRANCH@$COMMIT.)
"
