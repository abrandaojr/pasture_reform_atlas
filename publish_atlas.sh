#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")" && pwd)"
source_html="$repo_dir/../outputs/03_gdrive_delivery/atlas_pecuaria_final.html"
source_geometry="$repo_dir/../outputs/03_gdrive_delivery/municipal_geometry.json"

python3 "$repo_dir/sync_google_sheet.py"
cp "$source_html" "$repo_dir/index.html"
cp "$source_geometry" "$repo_dir/municipal_geometry.json"
version="$(sha256sum "$repo_dir/index.html" "$repo_dir/atlas_data.json" "$repo_dir/municipal_geometry.json" | sha256sum | cut -c1-12)"
printf '{"version":"%s"}\n' "$version" > "$repo_dir/version.json"

git -C "$repo_dir" add index.html municipal_geometry.json atlas_data.json version.json publish_atlas.sh sync_google_sheet.py
if git -C "$repo_dir" diff --cached --quiet; then
  echo "Atlas already published at version $version"
  exit 0
fi
git -C "$repo_dir" commit -m "Publish Atlas $version"
git -C "$repo_dir" push origin main
echo "Published https://abrandaojr.github.io/pasture_reform_atlas/?v=$version"
