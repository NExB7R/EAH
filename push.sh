#!/bin/bash
set -e

# ═══ الاستخدام ═══
#   ./push.sh "fix: وصف"                    → patch bump
#   ./push.sh "feat: وصف" --minor           → minor bump
#   ./push.sh "feat!: وصف" --major          → major bump
#   ./push.sh "chore: وصف" --no-bump        → بدون bump
#   ./push.sh "wip" --draft                 → commit محلي بدون push

MSG="${1:-update}"
shift || true
BUMP="patch"
DO_PUSH=1

for arg in "$@"; do
  case "$arg" in
    --major) BUMP="major" ;;
    --minor) BUMP="minor" ;;
    --patch) BUMP="patch" ;;
    --no-bump) BUMP="none" ;;
    --draft) DO_PUSH=0 ;;
  esac
done

BRANCH="ui-onlook"
cd ~/EAH

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  EAH Ship — $MSG"
echo "═══════════════════════════════════════════════════════"

# ─── 1. Typecheck ───
echo ""
echo "▶ 1/4 Typecheck..."
cd ~/EAH/08-web
npx tsc --noEmit

# ─── 2. Version bump ───
cd ~/EAH
echo ""
echo "▶ 2/4 Version bump ($BUMP)..."
CURRENT=$(cat VERSION 2>/dev/null || echo "1.0.0")
echo "  Current: v$CURRENT"

if [ "$BUMP" != "none" ]; then
  IFS='.' read -r MAJ MIN PAT <<< "$CURRENT"
  case "$BUMP" in
    major) MAJ=$((MAJ+1)); MIN=0; PAT=0 ;;
    minor) MIN=$((MIN+1)); PAT=0 ;;
    patch) PAT=$((PAT+1)) ;;
  esac
  NEW="$MAJ.$MIN.$PAT"
  echo "$NEW" > VERSION
  echo "  → New: v$NEW"

  node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('08-web/package.json'));p.version='$NEW';fs.writeFileSync('08-web/package.json',JSON.stringify(p,null,2)+'\n')"

  cat >> docs/CHANGELOG_ACTIVE.md << CHANGELOG

## v$NEW — $(date +%Y-%m-%d)

- $MSG
CHANGELOG
else
  NEW="$CURRENT"
fi

# ─── 3. Session log ───
echo ""
echo "▶ 3/4 Session log..."
TS=$(date -u +"%Y-%m-%d %H:%M UTC")
cat >> docs/SESSION_LOG.md << SESSIONLOG

### $TS — v$NEW
- **Action:** $MSG
- **Branch:** $BRANCH
SESSIONLOG

# ─── 4. Commit + push ───
echo ""
echo "▶ 4/4 Commit + push..."
cd ~/EAH
git add -A 08-web/ VERSION docs/ push.sh

if git diff --cached --quiet; then
  echo "  (مفيش تغييرات جديدة)"
else
  git commit -m "$MSG"
  if [ "$DO_PUSH" = "1" ]; then
    git push origin "$BRANCH"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✅ Done — v$NEW"
    echo "  🚀 Vercel auto-deploy خلال 2-3 دقائق"
    echo "═══════════════════════════════════════════════════════"
  else
    echo "  (draft — لم يتم push)"
  fi
fi
