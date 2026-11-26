# Architectural & Design Decisions (DECISIONS.md)

## 1. Materially Higher Spend Threshold (Insight #3)
- **Decision**: "Materially higher" than the prior equivalent period is defined as an increase in total spend of **$\ge 25\%$** compared to the prior period, given that the prior period baseline spend was **$> 0$**.
- **Rationale**: Provides a statistically meaningful signal of budget escalation without triggering on minor fluctuations.

## 2. All Time Range Fallback (Preset)
- **Decision**: If the All Time preset is selected and there are zero transactions in the ledger, the period falls back to `today → today` (1 day).
- **Rationale**: Prevents empty range errors, infinite loops, and division by zero while correctly returning zero metrics.

## 3. Money Precision & Minor Units
- **Decision**: While the spec suggests integers in minor units internally, existing app data stores amounts as standard floating-point numbers (e.g. `75.00`). Our calculation layer operates on numbers rounded to 2 decimal places (cents) to maintain 100% compatibility with existing app data models (`initialExpenses.js`, `transactions`), while strictly guarding all divisions against NaN, Infinity, and division by zero.

## 4. Category Caps as Single Source of Truth
- **Decision**: Total budget is computed dynamically as the sum of all individual category caps (`caps` / `limit`), as specified in BR-5. No separate standalone monthly budget state variable is maintained.

## 5. Custom Range Validation
- **Decision**: When custom range mode is active, if either `start` or `end` date is missing or `start > end`, the calculation module returns a validation error flag and the caller retains the previous valid period intact.

## 6. Category Group Assignment
- **Decision**: Enforce that each category belongs to at most one group (Edge Case 11). Attempting to assign a category to a second group automatically removes it from its previous group.
