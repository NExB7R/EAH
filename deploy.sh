#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH

# 1. سجل التعديل في CHANGELOG
./add-changelog.sh "$1"

# 2. تحديث الملف الحيّ
./sync-docs.sh

# 3. commit + push
git add -A
git commit -m "$1" || true
git push origin ui-onlook

# 4. deploy
cd ~/EAH/08-web
vercel --prod --yes
