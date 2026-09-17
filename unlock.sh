#!/usr/bin/env bash
# EAH — Decrypt secrets backup (for restore only)
set -e
cd "$(dirname "$0")"

TMP=/tmp/eah-unlock-$$.tar.gz

echo "═══ فك التشفير ═══"
gpg -d ~/.eah-secure/eah-secure.tar.gz.gpg > "$TMP"

echo ""
echo "═══ الملفات في الأرشيف ═══"
tar tzf "$TMP"

echo ""
echo "═══ استخراج في /tmp/eah-restored ═══"
rm -rf /tmp/eah-restored && mkdir -p /tmp/eah-restored
tar xzf "$TMP" -C /tmp/eah-restored
rm -f "$TMP"

echo "✅ الملفات في /tmp/eah-restored/"
ls -la /tmp/eah-restored/
