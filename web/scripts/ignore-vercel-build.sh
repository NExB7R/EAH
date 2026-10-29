#!/usr/bin/env bash
set -u

previous="${VERCEL_GIT_PREVIOUS_SHA:-}"
current="${VERCEL_GIT_COMMIT_SHA:-}"

# Fail open: missing refs/history must not hide application changes.
if [[ -z "$previous" || -z "$current" ]]; then
  echo "Missing Vercel git SHAs; continuing with build."
  exit 1
fi

if ! git cat-file -e "$previous^{commit}" 2>/dev/null || ! git cat-file -e "$current^{commit}" 2>/dev/null; then
  echo "Vercel git history unavailable; continuing with build."
  exit 1
fi

if git diff --quiet "$previous" "$current" -- . \
  ':(exclude)docs/**' \
  ':(exclude)**/*.md' \
  ':(exclude)LICENSE' \
  ':(exclude).gitignore'; then
  echo "Documentation-only change; skipping the build."
  exit 0
fi

echo "Application or configuration changes detected; continuing with build."
exit 1
