#!/bin/bash
set -e
MSG="${1:-update}"
cd ~/EAH/08-web
echo "═══ Typecheck ═══"
npx tsc --noEmit
cd ~/EAH
echo "═══ Commit + push ═══"
git add -A 08-web/
git commit -m "$MSG" || echo "no changes"
git push origin ui-onlook
echo "═══ Deploy to Vercel ═══"
cd ~/EAH/08-web
npx vercel --prod
