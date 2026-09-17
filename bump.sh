#!/usr/bin/env bash
# EAH Version Bumper
# Usage: ./bump.sh [patch|minor|major]

set -e
cd "$(dirname "$0")"

BUMP="${1:-patch}"
CURRENT=$(cat VERSION)

# parse semver
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$BUMP" in
  major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR+1)); PATCH=0 ;;
  patch|*) PATCH=$((PATCH+1)) ;;
esac

NEW="$MAJOR.$MINOR.$PATCH"
echo "Bumping: $CURRENT → $NEW"

# update VERSION
echo "$NEW" > VERSION

# update package.json
python3 -c "
import json
from pathlib import Path
p = Path('08-web/package.json')
d = json.loads(p.read_text())
d['version'] = '$NEW'
p.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\\n')
print('  ✅ package.json → $NEW')
"

# update all docs
python3 -c "
import re
from pathlib import Path
docs = ['PROJECT_MEMORY.md', 'README_AI.md', '00-project-status.md', 'docs/CHANGELOG_ACTIVE.md']
for d in docs:
    p = Path(d)
    if not p.exists(): continue
    s = p.read_text()
    s = re.sub(r'v0\.[0-9]+\.[0-9]+|v1\.[0-9]+\.[0-9]+', 'v$NEW', s)
    p.write_text(s)
print('  ✅ docs updated')
"

# update Vercel env
if command -v vercel > /dev/null 2>&1; then
  cd 08-web
  vercel env rm NEXT_PUBLIC_APP_VERSION production -y 2>/dev/null || true
  echo "$NEW" | vercel env add NEXT_PUBLIC_APP_VERSION production 2>/dev/null || true
  cd ..
  echo "  ✅ Vercel env updated"
fi

echo ""
echo "✅ Version bumped to v$NEW"
echo ""
echo "Next:"
echo "  git add -A && git commit -m 'chore: bump v$NEW'"
echo "  git tag v$NEW"
echo "  git push origin ui-onlook --tags"
