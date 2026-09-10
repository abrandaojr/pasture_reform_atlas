# Pasture Reform Atlas

Static, bilingual Atlas dashboard published from `index.html`.

The browser reads `atlas_data.json`. `sync_google_sheet.py` combines the configured public Google Sheet with `atlas_indicator_details.json`, joined by IBGE municipal code. The detail file supplies pasture distances, persistent vigour transitions and FAO class areas; its source paths and hashes are recorded inside the file.

The sync applies the documented risk aggregation: sum available scores, assign 100 to non-applicable public forest, and leave an entirely missing score set undefined. It fails on invalid keys or missing columns. Conditions now follow the frozen `conditions_v2026_09_11` rules, defined in `conditions_methodology.json` and implemented in `conditions_methodology.py`. See [the methodology](conditions_methodology_en.md). Imputed drought is excluded from conditions scoring and numeric drought queries; partial coverage is labelled.

The Query tab combines measured variables and classes using AND/OR, supports ascending/descending sorting, exports all selected records to CSV and saves criteria in a shareable URL. Its preset selects pasture above the national median, Adequate conditions with complete coverage and Green environmental risk. The query does not redefine any official classification. Run `node --v8-pool-size=1 test_atlas_query.cjs` and `python3 -m unittest discover -p 'test_*.py' -v` before publication.

Rebuild indicator details locally with `../codes/repair_atlas_data_contract.py`. Validate with `python3 ../tests/validate_atlas_data_contract.py` and `node --v8-pool-size=1 ../tests/atlas_data_contract.test.cjs`. All data preparation uses one process and standard-library Python. Publishing remains a separate step through `publish_atlas.sh`.

Public site: <https://abrandaojr.github.io/pasture_reform_atlas/>

Municipal profiles show measurements in original units. Biome and Brazil references are unweighted medians of municipalities with observed values, not regional totals. Each chart uses a zero-based scale in its own unit. Extension, education and credit are separate measurements; environmental risk remains a category. The shared implementation is in `profile_real_values.js` and `profile_real_values.css`, embedded into HTML during the local build. Run `node --v8-pool-size=1 test_profile_real_values.cjs` to verify values, units, medians, peer selection and both languages.

Recommendations: [data-driven and multicriteria roadmap](docs/atlas_data_driven_recommendations.pdf).
