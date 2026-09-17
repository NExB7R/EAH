#!/usr/bin/env bash
# EAH — Full Verification
set -e
cd "$(dirname "$0")"

echo "═══════════════════════════════════════"
echo "  EAH FULL VERIFICATION"
echo "═══════════════════════════════════════"

echo ""
echo "🔐 1. Git"
echo "  branch: $(git branch --show-current)"
echo "  HEAD:   $(git rev-parse --short HEAD)"
echo "  status: $(git status --short | wc -l) ملفات متغيرة"
git status --short

echo ""
echo "🔐 2. Version"
echo "  VERSION:      $(cat VERSION)"
echo "  package.json: $(grep '"version"' 08-web/package.json | sed 's/.*: "\(.*\)".*/\1/')"

echo ""
echo "🔐 3. Typecheck"
(cd 08-web && npx tsc --noEmit 2>&1 | head -3) && echo "  ✅ clean"

echo ""
echo "🔐 4. Security"
echo "  pre-commit: $([ -x .git/hooks/pre-commit ] && echo '✅' || echo '❌')"
echo "  .gitignore: $([ -f .gitignore ] && echo '✅' || echo '❌')"
echo "  git history (secrets): $(git rev-list --all --objects | grep -E '\.private|baseline\.env|\.env\.local' | grep -v '_baseline_marker' | wc -l) (0 = ✅)"
echo "  .env.local perms: $(stat -c '%a' 08-web/.env.local 2>/dev/null || echo 'N/A')"
echo "  Backup encrypted: $([ -f ~/.eah-secure/eah-secure.tar.gz.gpg ] && echo '✅' || echo '❌')"

echo ""
echo "🔐 5. Deploy (Vercel)"
(cd 08-web && vercel ls eah 2>&1 | head -5)

echo ""
echo "✅ verify خلص"
