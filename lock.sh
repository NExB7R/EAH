#!/usr/bin/env bash
# EAH — Encrypt local secrets to backup
set -e
cd "$(dirname "$0")"

mkdir -p ~/.eah-secure
chmod 700 ~/.eah-secure

echo "═══ تجهيز الأرشيف ═══"
TMP=/tmp/eah-lock-$$.tar.gz
FILES=""
[ -f 08-web/.env.local ] && FILES="$FILES 08-web/.env.local"
[ -f .env.local ] && FILES="$FILES .env.local"
[ -f .baseline.env ] && FILES="$FILES .baseline.env"
[ -d .private ] && FILES="$FILES .private"
[ -d ~/.eah-secure/.private ] && FILES="$FILES ~/.eah-secure/.private"

if [ -z "$FILES" ]; then
  echo "❌ مفيش ملفات للتشفير"
  exit 1
fi

tar czf "$TMP" $FILES 2>/dev/null
echo "✅ الأرشيف: $(du -h "$TMP" | cut -f1)"

echo ""
echo "═══ تشفير (GPG AES256) ═══"
echo "هيسألك على passphrase قوي:"
gpg --symmetric --cipher-algo AES256 --yes --output ~/.eah-secure/eah-secure.tar.gz.gpg "$TMP"

rm -f "$TMP"
chmod 600 ~/.eah-secure/eah-secure.tar.gz.gpg

echo ""
echo "✅ Backup محدّث: ~/.eah-secure/eah-secure.tar.gz.gpg"
ls -la ~/.eah-secure/
