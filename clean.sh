#!/usr/bin/env bash
cd "$(dirname "$0")/08-web"

echo "═══ EAH — فحص ملفات يتيمة ═══"
echo ""
echo "▶ CSS مش مستورد:"
FOUND=0
for css in $(find components app -name "*.css" -type f 2>/dev/null); do
  NAME=$(basename "$css")
  if ! grep -rl "$NAME" --include="*.tsx" --include="*.ts" --include="*.css" . 2>/dev/null | grep -v "^$css$" | grep -q .; then
    echo "  ✗ $css"
    FOUND=1
  fi
done
[ $FOUND -eq 0 ] && echo "  ✅ نضيف"
echo ""
echo "▶ TSX مش مستورد:"
FOUND=0
for tsx in $(find components app -name "*.tsx" -type f 2>/dev/null); do
  case "$tsx" in
    */page.tsx|*/layout.tsx|*/route.ts|*/loading.tsx|*/error.tsx|*/not-found.tsx|*/opengraph-image.tsx) continue ;;
  esac
  NAME=$(basename "$tsx" .tsx)
  if ! grep -rl "$NAME" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "^$tsx$" | grep -q .; then
    echo "  ✗ $tsx"
    FOUND=1
  fi
done
[ $FOUND -eq 0 ] && echo "  ✅ نضيف"
echo ""
echo "═══ الفحص خلص ═══"
