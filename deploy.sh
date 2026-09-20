#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH

# تحديث الملف الحيّ
./sync-docs.sh

# commit + push
git add -A
git commit -m "$1" || true
git push origin ui-onlook

# deploy
cd ~/EAH/08-web
vercel --prod --yes
