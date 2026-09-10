#!/usr/bin/env bash
set -euo pipefail
export OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1

repo_dir="$(cd "$(dirname "$0")" && pwd)"
source_html="$repo_dir/../dashboard/v01_real_data/atlas_pastagen_prototipo.html"
source_geometry="$repo_dir/../outputs/03_gdrive_delivery/municipal_geometry.json"

python3 "$repo_dir/sync_google_sheet.py"
python3 -m unittest discover -s "$repo_dir" -p 'test_*.py' -v
cp "$source_html" "$repo_dir/index.html"
cp "$source_geometry" "$repo_dir/municipal_geometry.json"
node --v8-pool-size=1 "$repo_dir/test_profile_real_values.cjs"
node --v8-pool-size=1 "$repo_dir/test_atlas_query.cjs"
version="$(sha256sum "$repo_dir/index.html" "$repo_dir/atlas_data.json" "$repo_dir/municipal_geometry.json" | sha256sum | cut -c1-12)"
printf '{"version":"%s"}\n' "$version" > "$repo_dir/version.json"

git -C "$repo_dir" add index.html municipal_geometry.json atlas_data.json atlas_indicator_details.json version.json publish_atlas.sh sync_google_sheet.py test_sync_google_sheet.py test_profile_real_values.cjs profile_real_values.js profile_real_values.css README.md .gitignore .github/workflows/sync-atlas-data.yml
git -C "$repo_dir" add atlas_query.js atlas_query.css test_atlas_query.cjs conditions_methodology.py conditions_methodology.json conditions_methodology_pt.md conditions_methodology_en.md conditions_ui.js test_conditions_methodology.py
if git -C "$repo_dir" diff --cached --quiet; then
  echo "Atlas already published at version $version"
  exit 0
fi
git -C "$repo_dir" commit -m "Publish Atlas $version"
git -C "$repo_dir" push origin main
echo "Published https://abrandaojr.github.io/pasture_reform_atlas/?v=$version"
