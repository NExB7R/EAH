# EAH — Security Checklist

## تم
- [x] DB Password rotated
- [x] Git history clean
- [x] Backup encrypted (AES256)
- [x] Pre-commit hook (secrets)
- [x] Deployment Retention policy
- [x] VAPID Keys regenerated (local)

## لسه
- [ ] VAPID Keys — حدّث على Vercel
- [ ] Service Role Key — rotate
- [ ] Deploy Hook ui-onlook-deploy — Revoke

## قواعد
1. Secrets فقط في .env.local — ممنوع في chat / commit / screenshot
2. بعد أي كشف → rotate فوراً
3. Pre-commit hook يمنع أي secrets جديد
4. git push → secrets scan تلقائي

## VAPID Rotation
cd ~/EAH/08-web
node -e "const wp=require('web-push');const k=wp.generateVAPIDKeys();const fs=require('fs');let e=fs.readFileSync('.env.local','utf8');e=e.replace(/^VAPID_PUBLIC_KEY=.*/m,'VAPID_PUBLIC_KEY='+k.publicKey).replace(/^VAPID_PRIVATE_KEY=.*/m,'VAPID_PRIVATE_KEY='+k.privateKey).replace(/^NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*/m,'NEXT_PUBLIC_VAPID_PUBLIC_KEY='+k.publicKey);fs.writeFileSync('.env.local',e);console.log('OK: rotated')"
بعدها حدّث Vercel Environment Variables + Redeploy.

## Service Role Key Rotation
1. Supabase → Settings → API → Rotate Service Role
2. Vercel → Environment Variables → edit
3. Redeploy

## Deploy Hook Revoke
Vercel → Settings → Git → Deploy Hooks → ui-onlook-deploy → Revoke
