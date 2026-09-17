#!/usr/bin/env bash
# EAH Full Ship — typecheck + commit + push + tag
set -e
cd "$(dirname "$0")"

MSG="${1:-chore: update}"
VERSION=$(cat VERSION)

echo "═══ 1. Typecheck ═══"
cd 08-web
npx tsc --noEmit
cd ..
echo "  ✅ typecheck passed"

echo ""
echo "═══ 2. Git commit ═══"
git add -A
git commit -m "$MSG"

echo ""
echo "═══ 3. Tag v$VERSION ═══"
git tag -a "v$VERSION" -m "EAH v$VERSION" 2>/dev/null || echo "  (tag exists)"

echo ""
echo "═══ 4. Push ═══"
git push origin ui-onlook
git push origin "v$VERSION" 2>/dev/null || true

echo ""
echo "✅ Shipped v$VERSION"
