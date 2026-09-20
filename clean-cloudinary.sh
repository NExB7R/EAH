#!/usr/bin/env bash
# EAH — تنظيف Cloudinary (folders قديمة)
set -e
cd ~/EAH/08-web

# حمّل الـ env
export $(grep -v '^#' .env.local | xargs)

if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
  echo "❌ محتاج CLOUDINARY env vars في .env.local"
  exit 1
fi

echo "▶ Cloudinary: $CLOUDINARY_CLOUD_NAME"
echo ""

# Folders عايزين نمسحها
FOLDERS=("gallery" "menu" "eah/gallery" "eah/menu")

for folder in "${FOLDERS[@]}"; do
  echo "▶ فحص: $folder"
  
  # جيب كل الملفات في الـ folder
  FILES=$(curl -s -u "$CLOUDINARY_API_KEY:$CLOUDINARY_API_SECRET" \
    "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/resources/image?prefix=$folder&max_results=500" \
    | grep -o '"public_id":"[^"]*"' | cut -d'"' -f4 || echo "")
  
  if [ -z "$FILES" ]; then
    echo "  (فاضي)"
    continue
  fi
  
  COUNT=$(echo "$FILES" | wc -l)
  echo "  $COUNT ملف"
  echo "$FILES" | while read -r public_id; do
    if [ -n "$public_id" ]; then
      curl -s -X POST -u "$CLOUDINARY_API_KEY:$CLOUDINARY_API_SECRET" \
        "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/resources/image/upload?public_ids[]=$public_id&type=upload" \
        -d "public_ids[]=$public_id" \
        -H "Content-Type: application/x-www-form-urlencoded" > /dev/null
      echo "    ✗ حذف: $public_id"
    fi
  done
done

echo ""
echo "✅ خلص"
