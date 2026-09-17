#!/usr/bin/env bash
# EAH — Full Sync (Git + Env + Version)
set -e
cd "$(dirname "$0")"

echo "═══ 1. Git sync ═══"
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/ui-onlook)
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Git متزامن ($LOCAL)"
else
  echo "⚠️ Git مختلف: local=$LOCAL remote=$REMOTE"
  echo "   git status:"
  git status --short
fi

echo ""
echo "═══ 2. Version sync ═══"
V_FILE=$(cat VERSION | tr -d '\n')
V_PKG=$(grep '"version"' 08-web/package.json | sed 's/.*: "\(.*\)".*/\1/')
V_VERCEL=$(cd 08-web && vercel env ls 2>/dev/null | grep NEXT_PUBLIC_APP_VERSION | awk '{print $1}' | head -1)
echo "   VERSION:              $V_FILE"
echo "   package.json:         $V_PKG"
echo "   Vercel env (current): ⚠️ (encrypted, unsupported to display)"
if [ "$V_FILE" = "$V_PKG" ]; then
  echo "✅ متزامن"
else
  echo "❌ مختلف — شغّل ./bump.sh patch"
fi

echo ""
echo "═══ 3. Env sync (Vercel) ═══"
cd 08-web
vercel env pull .env.vercel.tmp --environment=production --yes 2>&1 | tail -1
if [ -f .env.vercel.tmp ]; then
  echo "   Vercel keys:"
  grep -oE '^[A-Z_]+' .env.vercel.tmp | sort -u | head -20
  rm -f .env.vercel.tmp
fi

echo ""
echo "═══ 4. ملفات محلية ═══"
[ -f 08-web/.env.local ] && echo "✅ 08-web/.env.local موجود" || echo "❌ ناقص"
[ -f .env.local ] && echo "✅ .env.local موجود" || echo "⚠️ (اختياري)"
[ -f ~/.eah-secure/eah-secure.tar.gz.gpg ] && echo "✅ Backup مشفّر موجود" || echo "⚠️ Backup ناقص — شغّل ./lock.sh"

echo ""
echo "✅ Sync check خلص"
