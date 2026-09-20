#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH

# 1. سجل التعديل + sync
./add-changelog.sh "$1"
./sync-docs.sh

# 2. commit + push (كل حاجة في commit واحد)
git add -A
git commit -m "$1" || true
git push origin ui-onlook

# 3. deploy
cd ~/EAH/08-web
vercel --prod --yes
