#!/bin/bash
# Builds the static preview into ./out (for GitHub Pages). Usage: NEXT_PUBLIC_BASE_PATH=/concretefactory NEXT_PUBLIC_SITE_URL=https://owner.github.io/concretefactory scripts/preview-build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${NEXT_PUBLIC_BASE_PATH:-}"
# Server-only pieces that a static export cannot contain
mkdir -p .preview-stash
mv src/proxy.ts .preview-stash/proxy.ts
mv "src/app/[locale]/[...rest]" .preview-stash/rest
mv "src/app/[locale]/story-demo" .preview-stash/story-demo
restore() { mv .preview-stash/proxy.ts src/proxy.ts; mv .preview-stash/rest "src/app/[locale]/[...rest]"; mv .preview-stash/story-demo "src/app/[locale]/story-demo"; rmdir .preview-stash; }
trap restore EXIT
rm -rf .next out
PREVIEW_EXPORT=1 pnpm build
# Root: send visitors to the English home; plain Jekyll off; 404 page
cat > out/index.html <<HTML
<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${BASE}/en/"><link rel="canonical" href="${BASE}/en/"><title>The Concrete Factory</title><a href="${BASE}/en/">The Concrete Factory</a>
HTML
touch out/.nojekyll
[ -f out/en/404.html ] && cp out/en/404.html out/404.html || true
echo "preview built: $(du -sh out | cut -f1)"
