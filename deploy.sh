#!/bin/bash
set -e
cd ~/EAH/08-web
npx tsc --noEmit
cd ~/EAH

# 1. سجل + sync
./add-changelog.sh "$1"
./sync-docs.sh

# 2. commit + push UI-ONLOOK فقط
git add -A
git commit -m "$1" || true
git push origin ui-onlook

# 3. Deploy مباشر
cd ~/EAH/08-web
vercel --prod --yes

# 4. مزامنة main — يدوي بس لو اتغير workflow
# (مش هنا عشان ميعملش build تاني)
cd ~/EAH
echo ""
echo "✅ Done"
echo "📌 ملاحظة: main مش اتزامن — لو عدلت workflow قوللي"
