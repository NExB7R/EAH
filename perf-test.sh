#!/usr/bin/env bash
# EAH — اختبار الأداء والسلاسة
set -e

URL_BASE="https://eah-sq.vercel.app"
URLS=(
  "/"
  "/explore"
  "/businesses/seekh"
  "/offers"
  "/trends"
  "/about"
  "/pricing"
  "/contact"
  "/notifications"
  "/account"
  "/auth"
)

echo "═══════════════════════════════════════════════════════"
echo "  EAH — تقرير الأداء"
echo "═══════════════════════════════════════════════════════"
echo ""

printf "%-30s %-8s %-10s %-12s %-8s\n" "الصفحة" "الحالة" "الوقت" "الحجم" "TTFB"
echo "───────────────────────────────────────────────────────────"

for u in "${URLS[@]}"; do
  URL="${URL_BASE}${u}"
  # curl: time_total | http_code | size_download | time_starttransfer
  RESULT=$(curl -sL -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}|%{time_starttransfer}" --max-time 15 "$URL" 2>/dev/null || echo "000|0|0|0")
  
  CODE=$(echo "$RESULT" | cut -d'|' -f1)
  TIME=$(echo "$RESULT" | cut -d'|' -f2)
  SIZE=$(echo "$RESULT" | cut -d'|' -f3)
  TTFB=$(echo "$RESULT" | cut -d'|' -f4)
  
  # حوّل الحجم لـ KB
  SIZE_KB=$(echo "scale=1; $SIZE / 1024" | bc 2>/dev/null || echo "?")
  
  # الوقت بالثواني (٢ خانات)
  TIME_S=$(printf "%.2f" "$TIME" 2>/dev/null || echo "$TIME")
  TTFB_S=$(printf "%.2f" "$TTFB" 2>/dev/null || echo "$TTFB")
  
  # حكم على السرعة
  STATUS="✅"
  if [ "$CODE" != "200" ]; then STATUS="❌"
  elif (( $(echo "$TIME > 3" | bc -l 2>/dev/null || echo 0) )); then STATUS="⚠️"
  fi
  
  printf "%-30s %-8s %-10s %-12s %-8s %s\n" "$u" "$CODE" "${TIME_S}s" "${SIZE_KB}KB" "${TTFB_S}s" "$STATUS"
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ملخص"
echo "═══════════════════════════════════════════════════════"
echo ""

# اختبار الأصول الثابتة
echo "▶ اختبار الأصول الثابتة:"
for asset in "/crown-512.png" "/favicon.ico" "/manifest.webmanifest"; do
  RESULT=$(curl -sL -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" --max-time 10 "${URL_BASE}${asset}" 2>/dev/null || echo "000|0|0")
  CODE=$(echo "$RESULT" | cut -d'|' -f1)
  TIME=$(echo "$RESULT" | cut -d'|' -f2)
  SIZE=$(echo "$RESULT" | cut -d'|' -f3)
  TIME_S=$(printf "%.3f" "$TIME" 2>/dev/null || echo "$TIME")
  SIZE_KB=$(echo "scale=1; $SIZE / 1024" | bc 2>/dev/null || echo "?")
  echo "  $asset → $CODE · ${TIME_S}s · ${SIZE_KB}KB"
done

echo ""
echo "▶ اختبار APIs:"
for api in "/api/ads/active?slot=home_banner" "/api/qr?url=https://eah-sq.vercel.app"; do
  RESULT=$(curl -sL -o /dev/null -w "%{http_code}|%{time_total}" --max-time 10 "${URL_BASE}${api}" 2>/dev/null || echo "000|0")
  CODE=$(echo "$RESULT" | cut -d'|' -f1)
  TIME=$(echo "$RESULT" | cut -d'|' -f2)
  TIME_S=$(printf "%.3f" "$TIME" 2>/dev/null || echo "$TIME")
  echo "  $api → $CODE · ${TIME_S}s"
done

echo ""
echo "▶ إحصائيات الـ build:"
cd ~/EAH/08-web
BUNDLE_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "?")
NODE_MODULES=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "?")
echo "  .next: $BUNDLE_SIZE"
echo "  node_modules: $NODE_MODULES"
echo "  عدد الصفحات: $(find app -name 'page.tsx' | wc -l)"
echo "  عدد المكونات: $(find components -name '*.tsx' | wc -l)"

echo ""
echo "✅ التقرير خلص"
