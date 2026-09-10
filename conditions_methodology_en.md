# Enabling conditions — 11 September 2026 edition

This edition defines the previously missing market and drought criteria. It supports comparative municipal screening, not farm certification, agronomic tolerance limits, road travel times or economic feasibility assessments.

## Components

**Market access:** 2025 pasture P80 spatial distance to any slaughterhouse, in km. The national reference contains 5,461 observations. Distance ≤38.6 km receives 100 points; >38.6 to 65.5 km receives 50; >65.5 km receives zero.

**Drought:** published municipal frequency in % of years, 1984–2025. The current dataset identifies 5,115 values as direct FAO HDF without a MapBiomas pasture mask, and 456 as biome-median imputations. Only direct observations with a known biome and values in [0,100] enter the reference and receive points. This direct series is not interpreted as a pasture-area-weighted frequency.

Within each biome, drought ≤P50 receives 100 points; >P50 to P75 receives 50; >P75 receives zero. Quantiles use unweighted linear interpolation at `(n−1) × p`.

| Biome | P50 (% of years) | P75 (% of years) | Reference municipalities |
|---|---:|---:|---:|
| Amazon | 6.6046325 | 11.84966425 | 482 |
| Caatinga | 11.878049 | 16.914773 | 1,101 |
| Cerrado | 5 | 10.017284 | 1,045 |
| Atlantic Forest | 1.877623 | 5 | 2,373 |
| Pantanal | 2.107782 | 7.66557 | 8 |

The Pampa has no direct observed reference in this snapshot; no threshold is borrowed from another biome. The Pantanal sample is small (n=8), so its thresholds are less stable. Municipalities without a known biome receive no drought score. Thresholds are frozen for this edition and do not change with filters or daily refreshes.

**Extension and education:** retain the previously documented 0/50/100 scores derived from the 2017 Agricultural Census, including denominator and availability filters. **Credit** remains queryable but is excluded from this aggregate, consistent with the earlier rules.

## Preserved aggregation

`Conditions = (drought + extension + education points) × market points / 100`

Adequate: >240. Intermediate: 150–240 inclusive. Limited: <150.

Market access acts as a multiplier: 100 preserves support points, 50 halves them, and zero reduces the result to zero. Therefore distance >65.5 km results in Limited conditions whenever any support is available. This inherited prioritization choice does not establish productive infeasibility.

## Missingness and coverage

A missing support indicator adds no points; this conservative treatment is not an observed zero. Missing market data or entirely missing support data leaves the municipality unclassified. Four observed components give **Complete** coverage; a calculable classification with missing support is **Partial**. Biome-median drought imputations are excluded from scoring while their source records are preserved.

The reference snapshot has 5,571 municipalities: 613 Adequate, 1,133 Intermediate, 3,658 Limited and 167 unclassified. Coverage is Complete for 4,335, Partial for 1,069 and Insufficient for 167. Counts can change with data updates; thresholds remain fixed until an explicitly versioned recalibration.

Version: `conditions_v2026_09_11`. Exact thresholds, sample sizes and reference hash: [conditions_methodology.json](conditions_methodology.json). Calculation: [conditions_methodology.py](conditions_methodology.py). This user-requested edition fills the previously undefined rules while preserving the remaining components and aggregation formula.
