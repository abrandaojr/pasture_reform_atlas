# Allocation scenarios

Version: `allocation_scenarios_v1`. Sources reviewed 11 September 2026.

The planner distributes a single project budget across candidate municipalities. It does not estimate profit, treatment effectiveness, credit approval or causal environmental impact. Money is in constant 2026 BRL. National programme targets provide context, not funding or a claim of progress against official targets.

## Municipal screen

Apply selected geography and programme scope, then require observed positive low- and medium-vigour pasture area, the Atlas's green aggregate risk class, adequate or intermediate enabling conditions, complete conditions coverage and observed market distance and drought. Exclusion counts are sequential and mutually exclusive. A municipality's passing the screen does not establish legal or financial eligibility of any farm. Individual environmental indicators can differ from the aggregate risk class.

ABC+/RenovAgro and Caminho Verde scenarios cover all selected Brazilian biomes. The IFACC scenario uses Amazon and Cerrado municipalities to match the Brazilian scope of that initiative. IFACC's financial ambition spans countries and supply chains and is not converted into hectares or automatically added to the user's budget.

## Budget and area

For horizon H, lifecycle cost per hectare is implementation cost + annual maintenance × (H − 1). All hectares receive the full maintenance provision, conservatively including hectares introduced after the pilot. The initial examples (BRL 5,000/ha implementation and BRL 200/ha/year maintenance) are uncalibrated, editable planning assumptions, not official tariffs or local estimates.

Field budget = total budget × (1 − support reserve percentage). The support-first alternative adds ten percentage points to the reserve, capped at 80%. Each municipality is limited by the remaining field budget, the per-municipality share of the field budget and the mobilisable share of its observed pasture opportunity. Monetary allocations are floored to cents. No area is allocated beyond these limits. Residual money remains unallocated; reserve is zero if no intervention is funded. Allocation + support reserve + unallocated balance equals the budget rounded to cents.

The hectares-first scenario sorts by descending opportunity area, then adequate conditions and shorter market distance. Under a uniform per-hectare cost, equal-capacity alternatives tie financially; the selected municipalities are candidates, not a proven local economic optimum. The support-first scenario sorts by adequate conditions, shorter market distance, lower drought, then opportunity. Both stop at the chosen maximum number of municipalities, so support-first can leave more money unallocated.

Retained area = funded intervention area × the user's horizon-specific retention assumption. These percentages are not fitted from Atlas observations and do not increase automatically with support spending. Cost sensitivity reruns allocation at 75% and 125% of the implementation cost; it is not a confidence interval.

The five- and ten-year scenarios are alternatives using the same one-time budget. They cannot be added. Loan interest and amortisation are outside the project budget and require a separate borrower cash-flow assessment. The planner assumes no future loan renewal, carbon sale, revenue or international contribution.

## Implementation and provenance

The suggested sequence is farm screening and technical design, a 20% pilot, conditional expansion in years 2–3, verification through year 5 and maintenance/audit through year 10. This is a proposed workflow, not an official disbursement schedule. Expansion or new commitments require funding. Programme conditions and availability must be confirmed with the intermediary. The reviewed BNDES page contains both 2026/27 terms and an expired-program banner, which is disclosed in the interface.

CSV exports allocation and budget assumptions. JSON also records all settings, the selected programme's sources, method version, build version, review date and implementation plan. Shared URLs reproduce settings against the currently loaded Atlas snapshot, not a frozen dataset.

Source periods: pasture opportunity 2024, market distances 2025, extension/education 2017 and drought 1984–2025. The existing Atlas computes the official risk and conditions classes. This planner never changes those classifications. Low or medium vigour is an opportunity proxy, not a farm-level diagnosis of degradation.
