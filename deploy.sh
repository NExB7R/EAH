#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH
git add -A
git commit -m "$1" || true
git push origin ui-onlook
cd ~/EAH/08-web
vercel --prod --yes
