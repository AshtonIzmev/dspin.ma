#!/bin/bash
set -euo pipefail
PATH="/usr/local/bin:/usr/bin:/bin"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="$ROOT/dist"

rm -rf "$OUTPUT"
mkdir -p "$OUTPUT/assets/img/team"

cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/app.js" "$OUTPUT/"
cp -R "$ROOT/assets/fonts" "$OUTPUT/assets/"
cp -R "$ROOT/assets/img/favicon" "$OUTPUT/assets/img/"
cp "$ROOT/assets/img/team/iea.jpg" "$OUTPUT/assets/img/team/"
cp "$ROOT/cloudflare/_headers" "$OUTPUT/_headers"
cp "$ROOT/cloudflare/404.html" "$OUTPUT/404.html"
