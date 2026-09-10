# Pasture Reform Atlas

Static, bilingual Atlas dashboard published from `index.html`.

The browser reads `atlas_data.json`. `sync_google_sheet.py` combines the configured public Google Sheet with `atlas_indicator_details.json`, joined by IBGE municipal code. The detail file supplies pasture distances, persistent vigour transitions and FAO class areas; its source paths and hashes are recorded inside the file.

The sync applies the documented risk aggregation: sum available scores, assign 100 to non-applicable public forest, and leave an entirely missing score set undefined. It fails on invalid keys or missing columns. Conditions now follow the frozen `conditions_v2026_09_11` rules, defined in `conditions_methodology.json` and implemented in `conditions_methodology.py`. See [the methodology](conditions_methodology_en.md). Imputed drought is excluded from conditions scoring and numeric drought queries; partial coverage is labelled.

The Query tab combines measured variables and classes using AND/OR, supports ascending/descending sorting, exports all selected records to CSV and saves criteria in a shareable URL. Its preset selects pasture above the national median, Adequate conditions with complete coverage and Green environmental risk. The query does not redefine any official classification. Run `node --v8-pool-size=1 test_atlas_query.cjs` and `python3 -m unittest discover -p 'test_*.py' -v` before publication.

Rebuild indicator details locally with `../codes/repair_atlas_data_contract.py`. Validate with `python3 ../tests/validate_atlas_data_contract.py` and `node --v8-pool-size=1 ../tests/atlas_data_contract.test.cjs`. All data preparation uses one process and standard-library Python. Publishing remains a separate step through `publish_atlas.sh`.

Public site: <https://abrandaojr.github.io/pasture_reform_atlas/>

Municipal profiles show measurements in original units. Biome and Brazil references are unweighted medians of municipalities with observed values, not regional totals. Each chart uses a zero-based scale in its own unit. Extension, education and credit are separate measurements; environmental risk remains a category. The shared implementation is in `profile_real_values.js` and `profile_real_values.css`, embedded into HTML during the local build. Run `node --v8-pool-size=1 test_profile_real_values.cjs` to verify values, units, medians, peer selection and both languages.

Recommendations: [data-driven and multicriteria roadmap](docs/atlas_data_driven_recommendations.pdf).

The **Simulation** tab compares four alternative allocations: a hectares-first or support-first screen over five or ten years. The budget is available once. Implementation costs, annual maintenance, support reserves, municipal caps, mobilisable area and retention are explicit user assumptions. National policy ambitions and financing routes are sourced in `simulation_programs.json`; no grant, loan approval, yield gain, carbon revenue or match funding is assumed. Municipal screening is not farm eligibility. [Allocation method](docs/simulation_methodology_en.md).

The Brazil flag in the upper-right corner switches to Portuguese. The selected language persists and changing it retains the active page. `atlas_language.js` handles static text, live content and accessibility labels; the English-authored guides also have reviewed Portuguese translations.

Rebuild local HTML distributions with `python3 ../codes/finalize_atlas_language.py`, then `python3 ../codes/build_atlas_simulation.py`. Run `node --v8-pool-size=1 test_atlas_simulation.cjs`. Browser regression: start a CPU-limited Chromium with CDP port 9224, serve this directory, then run `node --v8-pool-size=1 test_atlas_language_browser.cjs <site-url> <audit-output-directory>`. All work is sequential with one worker; do not exceed the workspace aggregate CPU limit.
