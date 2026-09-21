#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH

# 1. سجل + sync
./add-changelog.sh "$1"
./sync-docs.sh

# 2. commit + push ui-onlook
git add -A
git commit -m "$1" || true
git push origin ui-onlook

# 3. مزامنة main (للـ GitHub Actions)
git push origin ui-onlook:main --force 2>/dev/null || true

# 4. deploy
cd ~/EAH/08-web
vercel --prod --yes
