import React, { useMemo, useState } from 'react';
import {
  TrendingUp, Plus, Trash2, RotateCcw, Info, ChevronDown,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TAX DATA (2025 estimates — single source of truth)
   ═══════════════════════════════════════════════════════════ */
const FED_BRACKETS = {
  single: [
    [11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24],
    [250525, 0.32], [626350, 0.35], [Infinity, 0.37],
  ],
  married: [
    [23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24],
    [501050, 0.32], [751600, 0.35], [Infinity, 0.37],
  ],
  hoh: [
    [17000, 0.10], [64850, 0.12], [103350, 0.22], [197300, 0.24],
    [250500, 0.32], [626350, 0.35], [Infinity, 0.37],
  ],
};

const STD_DEDUCTION = { single: 15000, married: 30000, hoh: 22500 };
const ADD_MEDICARE_THRESHOLD = { single: 200000, married: 250000, hoh: 200000 };

const SS_WAGE_BASE = 176100;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADD_MEDICARE_RATE = 0.009;

const K401_LIMIT = 23500;
const HSA_LIMIT_FAMILY = 8550;

const PAY_FREQ = {
  weekly:      { periods: 52, label: 'week' },
  biweekly:    { periods: 26, label: 'paycheck' },
  semimonthly: { periods: 24, label: 'paycheck' },
  monthly:     { periods: 12, label: 'month' },
};

const FILING_LABEL = {
  single: 'Single',
  married: 'Married filing jointly',
  hoh: 'Head of household',
};

const STATE_RATES = {
  'No state tax': 0, AL: 5.0, AK: 0, AZ: 2.5, AR: 4.4, CA: 9.3, CO: 4.4,
  CT: 5.0, DE: 5.5, FL: 0, GA: 5.39, HI: 8.0, ID: 5.8, IL: 4.95, IN: 3.05,
  IA: 6.0, KS: 5.7, KY: 4.0, LA: 4.25, ME: 7.15, MD: 5.0, MA: 5.0, MI: 4.25,
  MN: 7.85, MS: 4.7, MO: 4.8, MT: 6.0, NE: 6.0, NV: 0, NH: 0, NJ: 6.37,
  NM: 5.9, NY: 6.85, NC: 4.25, ND: 2.5, OH: 3.5, OK: 4.75, OR: 9.0, PA: 3.07,
  RI: 5.99, SC: 6.4, SD: 0, TN: 0, TX: 0, UT: 4.55, VT: 7.0, VA: 5.75,
  WA: 0, WV: 5.12, WI: 7.65, WY: 0,
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const safe = (n) => (Number.isFinite(n) ? n : 0);
const fmt = (n, d = 0) =>
  safe(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const money0 = (n) => `$${fmt(Math.round(safe(n)), 0)}`;
const money2 = (n) => `$${fmt(safe(n), 2)}`;

function bracketTax(taxable, brackets) {
  let tax = 0;
  let lower = 0;
  let marginal = 0;
  for (const [upper, rate] of brackets) {
    if (taxable > lower) {
      tax += (Math.min(taxable, upper) - lower) * rate;
      marginal = rate;
    }
    lower = upper;
    if (taxable <= upper) break;
  }
  return { tax: Math.max(0, tax), marginal };
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT  —  NOTE: named export (not default)
   ═══════════════════════════════════════════════════════════ */
export function BlueprintTab() {
  // ── Income ─────────────────────────────────────────────
  const [grossAnnual, setGrossAnnual] = useState(95000);
  const [payFreq, setPayFreq] = useState('biweekly');

  // ── Filing ─────────────────────────────────────────────
  const [filing, setFiling] = useState('single');
  const [stateName, setStateName] = useState('No state tax');
  const [stateRate, setStateRate] = useState(0);
  const [dependents, setDependents] = useState(0);

  // ── Retirement & benefits ──────────────────────────────
  const [k401TradPct, setK401TradPct] = useState(6);
  const [k401RothPct, setK401RothPct] = useState(0);
  const [hsaAnnual, setHsaAnnual] = useState(0);
  const [matchRatePct, setMatchRatePct] = useState(50);
  const [matchCapPct, setMatchCapPct] = useState(6);
  const [startBalance, setStartBalance] = useState(0);
  const [returnPct, setReturnPct] = useState(7);
  const [salaryGrowthPct, setSalaryGrowthPct] = useState(3);
  const [horizon, setHorizon] = useState(30);

  // ── Custom deductions ──────────────────────────────────
  const [deductions, setDeductions] = useState([
    { id: 1, name: 'Health insurance', type: 'pretax', amount: 2400 },
  ]);

  const addDeduction = () =>
    setDeductions((d) => [
      ...d,
      { id: Date.now(), name: 'New deduction', type: 'pretax', amount: 0 },
    ]);

  const updateDeduction = (id, patch) =>
    setDeductions((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeDeduction = (id) =>
    setDeductions((d) => d.filter((x) => x.id !== id));

  const resetAll = () => {
    setGrossAnnual(95000);
    setPayFreq('biweekly');
    setFiling('single');
    setStateName('No state tax');
    setStateRate(0);
    setDependents(0);
    setK401TradPct(6);
    setK401RothPct(0);
    setHsaAnnual(0);
    setMatchRatePct(50);
    setMatchCapPct(6);
    setStartBalance(0);
    setReturnPct(7);
    setSalaryGrowthPct(3);
    setHorizon(30);
    setDeductions([{ id: 1, name: 'Health insurance', type: 'pretax', amount: 2400 }]);
  };

  /* ═══════════════════════════════════════════════════════
     PAYCHECK ENGINE
     ═══════════════════════════════════════════════════════ */
  const calc = useMemo(() => {
    const gross = Math.max(0, safe(grossAnnual));
    const periods = PAY_FREQ[payFreq].periods;

    const trad401k = Math.min((gross * safe(k401TradPct)) / 100, K401_LIMIT);
    const roth401k = Math.min(
      (gross * safe(k401RothPct)) / 100,
      Math.max(0, K401_LIMIT - trad401k)
    );

    const hsa = Math.min(Math.max(0, safe(hsaAnnual)), HSA_LIMIT_FAMILY);

    const otherPretax = deductions
      .filter((d) => d.type === 'pretax')
      .reduce((s, d) => s + safe(d.amount), 0);

    const otherPosttax = deductions
      .filter((d) => d.type === 'posttax')
      .reduce((s, d) => s + safe(d.amount), 0);

    const pretaxTotal = trad401k + hsa + otherPretax;

    const fedTaxable = Math.max(0, gross - pretaxTotal - STD_DEDUCTION[filing]);
    const { tax: fedTaxRaw, marginal } = bracketTax(fedTaxable, FED_BRACKETS[filing]);
    const childCredit = Math.min(safe(dependents) * 2000, fedTaxRaw);
    const fedTax = Math.max(0, fedTaxRaw - childCredit);

    const ss = Math.min(gross, SS_WAGE_BASE) * SS_RATE;
    const medicare =
      gross * MEDICARE_RATE +
      Math.max(0, gross - ADD_MEDICARE_THRESHOLD[filing]) * ADD_MEDICARE_RATE;
    const fica = ss + medicare;

    const stateTax = Math.max(0, gross - pretaxTotal) * (safe(stateRate) / 100);

    const posttaxTotal = roth401k + otherPosttax;
    const totalTax = fedTax + fica + stateTax;
    const netAnnual = Math.max(0, gross - pretaxTotal - totalTax - posttaxTotal);

    const per = (v) => v / periods;

    const employeeContrib = trad401k + roth401k;
    const employerMatch =
      Math.min(employeeContrib, (gross * safe(matchCapPct)) / 100) *
      (safe(matchRatePct) / 100);

    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;

    return {
      gross, periods, trad401k, roth401k, hsa, otherPretax, otherPosttax,
      pretaxTotal, posttaxTotal, fedTax, fica, stateTax, totalTax,
      netAnnual, netPerPeriod: per(netAnnual), grossPerPeriod: per(gross),
      fedPerPeriod: per(fedTax), ficaPerPeriod: per(fica),
      statePerPeriod: per(stateTax), marginal, effectiveRate,
      employerMatch, employeeContrib,
    };
  }, [
    grossAnnual, payFreq, filing, stateRate, dependents,
    k401TradPct, k401RothPct, hsaAnnual, deductions, matchRatePct, matchCapPct,
  ]);

  const periodLabel = PAY_FREQ[payFreq].label;

  /* ═══════════════════════════════════════════════════════
     RETIREMENT PROJECTION
     ═══════════════════════════════════════════════════════ */
  const projection = useMemo(() => {
    const years = Math.max(1, Math.min(50, safe(horizon)));
    let balance = Math.max(0, safe(startBalance));
    let salary = Math.max(0, safe(grossAnnual));
    const contribPct = Math.max(0, safe(k401TradPct) + safe(k401RothPct));
    const r = safe(returnPct) / 100;
    const g = safe(salaryGrowthPct) / 100;

    const points = [{ year: 0, balance }];
    let totalEmployee = 0;
    let totalMatch = 0;

    for (let y = 1; y <= years; y++) {
      const contrib = Math.min((salary * contribPct) / 100, K401_LIMIT);
      const match =
        Math.min(contrib, (salary * safe(matchCapPct)) / 100) *
        (safe(matchRatePct) / 100);

      totalEmployee += contrib;
      totalMatch += match;

      balance = balance * (1 + r) + contrib + match;
      salary *= 1 + g;
      points.push({ year: y, balance });
    }

    const step = Math.max(1, Math.round(years / 6));
    const milestones = points.filter(
      (p) => p.year > 0 && (p.year % step === 0 || p.year === years)
    );
    const maxBalance = Math.max(...milestones.map((m) => m.balance), 1);

    return {
      points, milestones, maxBalance,
      finalBalance: balance, totalEmployee, totalMatch,
    };
  }, [
    horizon, startBalance, grossAnnual, k401TradPct, k401RothPct,
    returnPct, salaryGrowthPct, matchRatePct, matchCapPct,
  ]);

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="animate-in">
      {/* ── HERO ───────────────────────────────────────── */}
      <div className="ps-hero">
        <div className="ps-hero-main">
          <div className="ps-hero-label">Estimated Take-Home</div>
          <div className="ps-hero-value">{money2(calc.netPerPeriod)}</div>
          <div className="ps-hero-sub">
            per {periodLabel} · {money0(calc.netAnnual)} / year
          </div>
        </div>

        <div className="ps-hero-stats">
          <div className="ps-stat">
            <span className="ps-stat-label">Gross</span>
            <div className="ps-stat-value">{money0(calc.gross)}</div>
            <div className="ps-stat-sub">{money2(calc.grossPerPeriod)} / {periodLabel}</div>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-label">Total Tax</span>
            <div className="ps-stat-value">{money0(calc.totalTax)}</div>
            <div className="ps-stat-sub">{fmt(calc.effectiveRate, 1)}% effective</div>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-label">Marginal Bracket</span>
            <div className="ps-stat-value">{fmt(calc.marginal * 100, 0)}%</div>
            <div className="ps-stat-sub">{FILING_LABEL[filing]}</div>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-label">Retirement @ {horizon}y</span>
            <div className="ps-stat-value">{money0(projection.finalBalance)}</div>
            <div className="ps-stat-sub">{money0(projection.totalMatch)} employer match</div>
          </div>
        </div>
      </div>

      {/* ── LAYOUT ─────────────────────────────────────── */}
      <div className="ps-layout">
        {/* ══════════ CONTROLS ══════════ */}
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head">
              <span className="ps-block-label">Income</span>
              <button className="ps-mini-btn" onClick={resetAll} type="button">
                <RotateCcw /> Reset
              </button>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>Gross annual income</span>
                <span className="ps-field-hint">{money0(calc.gross)}</span>
              </div>
              <div className="ps-field-input">
                <input
                  className="ps-input"
                  type="number"
                  min="0"
                  step="1000"
                  value={grossAnnual}
                  onChange={(e) => setGrossAnnual(Math.max(0, +e.target.value || 0))}
                />
                <input
                  className="ps-slider"
                  type="range"
                  min="0"
                  max="400000"
                  step="1000"
                  value={Math.min(grossAnnual, 400000)}
                  onChange={(e) => setGrossAnnual(+e.target.value)}
                />
              </div>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>Pay frequency</span>
                <span className="ps-field-hint">{calc.periods} periods / yr</span>
              </div>
              <div className="ps-seg">
                {Object.entries(PAY_FREQ).map(([key]) => (
                  <button
                    key={key}
                    type="button"
                    className={`ps-seg-item ${payFreq === key ? 'active' : ''}`}
                    onClick={() => setPayFreq(key)}
                  >
                    {key === 'semimonthly'
                      ? 'Semi-monthly'
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ps-block">
            <div className="ps-block-head">
              <span className="ps-block-label">Filing & Location</span>
            </div>

            <div className="ps-field">
              <div className="ps-field-label"><span>Filing status</span></div>
              <div className="ps-seg">
                {Object.entries(FILING_LABEL).map(([key]) => (
                  <button
                    key={key}
                    type="button"
                    className={`ps-seg-item ${filing === key ? 'active' : ''}`}
                    onClick={() => setFiling(key)}
                  >
                    {key === 'married' ? 'Married' : key === 'hoh' ? 'HoH' : 'Single'}
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>State</span>
                <span className="ps-field-hint">{fmt(stateRate, 2)}% est.</span>
              </div>
              <div className="ps-row-controls">
                <select
                  value={stateName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStateName(v);
                    setStateRate(STATE_RATES[v] ?? 0);
                  }}
                >
                  {Object.keys(STATE_RATES).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={stateRate}
                  onChange={(e) => setStateRate(Math.max(0, +e.target.value || 0))}
                  title="State effective rate override"
                />
              </div>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>Dependents (under 17)</span>
                <span className="ps-field-hint">$2,000 credit each</span>
              </div>
              <input
                className="ps-input"
                type="number"
                min="0"
                max="10"
                value={dependents}
                onChange={(e) =>
                  setDependents(Math.max(0, Math.min(10, +e.target.value || 0)))
                }
              />
            </div>
          </div>

          <div className="ps-block">
            <div className="ps-block-head">
              <span className="ps-block-label">Retirement & Benefits</span>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>Traditional 401(k)</span>
                <span className="ps-field-hint">
                  {money0(calc.trad401k)} / yr · pre-tax
                </span>
              </div>
              <div className="ps-field-input">
                <input
                  className="ps-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={k401TradPct}
                  onChange={(e) => setK401TradPct(Math.max(0, +e.target.value || 0))}
                />
                <input
                  className="ps-slider"
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={Math.min(k401TradPct, 50)}
                  onChange={(e) => setK401TradPct(+e.target.value)}
                />
              </div>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>Roth 401(k)</span>
                <span className="ps-field-hint">
                  {money0(calc.roth401k)} / yr · post-tax
                </span>
              </div>
              <div className="ps-field-input">
                <input
                  className="ps-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={k401RothPct}
                  onChange={(e) => setK401RothPct(Math.max(0, +e.target.value || 0))}
                />
                <input
                  className="ps-slider"
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={Math.min(k401RothPct, 50)}
                  onChange={(e) => setK401RothPct(+e.target.value)}
                />
              </div>
            </div>

            <div className="ps-field">
              <div className="ps-field-label">
                <span>HSA contribution</span>
                <span className="ps-field-hint">{money0(calc.hsa)} / yr · pre-tax</span>
              </div>
              <input
                className="ps-input"
                type="number"
                min="0"
                step="100"
                value={hsaAnnual}
                onChange={(e) => setHsaAnnual(Math.max(0, +e.target.value || 0))}
              />
            </div>

            <div className="ps-row">
              <div className="ps-row-label-row">
                <span className="ps-row-label">Employer match</span>
              </div>
              <div className="ps-row-controls">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={matchRatePct}
                  onChange={(e) => setMatchRatePct(Math.max(0, +e.target.value || 0))}
                  title="Match rate %"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={matchCapPct}
                  onChange={(e) => setMatchCapPct(Math.max(0, +e.target.value || 0))}
                  title="Match up to % of salary"
                />
                <input
                  type="text"
                  value={`${money0(calc.employerMatch)}/yr`}
                  readOnly
                  title="Estimated employer contribution"
                />
              </div>
            </div>
          </div>

          {/* ── Advanced ── */}
          <details className="ps-adv">
            <summary className="ps-adv-summary">
              <span>Deductions & growth assumptions</span>
              <ChevronDown className="ps-adv-chevron" />
            </summary>

            <div className="ps-adv-body">
              <div className="ps-sub-block">
                <div className="ps-sub-head">
                  <span className="ps-block-label">Custom deductions</span>
                  <button className="ps-mini-btn" type="button" onClick={addDeduction}>
                    <Plus /> Add
                  </button>
                </div>

                <div className="ps-rows">
                  {deductions.map((d) => (
                    <div className="ps-row" key={d.id}>
                      <div className="ps-row-label-row">
                        <input
                          className="ps-row-label-input"
                          value={d.name}
                          onChange={(e) => updateDeduction(d.id, { name: e.target.value })}
                          placeholder="Deduction name"
                        />
                        <button
                          className="ps-mini-btn"
                          type="button"
                          onClick={() => removeDeduction(d.id)}
                          title="Remove"
                        >
                          <Trash2 />
                        </button>
                      </div>
                      <div className="ps-row-controls">
                        <select
                          value={d.type}
                          onChange={(e) => updateDeduction(d.id, { type: e.target.value })}
                        >
                          <option value="pretax">Pre-tax</option>
                          <option value="posttax">Post-tax</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={d.amount}
                          onChange={(e) =>
                            updateDeduction(d.id, {
                              amount: Math.max(0, +e.target.value || 0),
                            })
                          }
                        />
                        <input
                          type="text"
                          value="annual"
                          readOnly
                          tabIndex={-1}
                          style={{ textAlign: 'center', color: 'var(--text-4)' }}
                        />
                      </div>
                    </div>
                  ))}
                  {deductions.length === 0 && (
                    <div className="settings-empty">No custom deductions added.</div>
                  )}
                </div>
              </div>

              <div className="ps-sub-block">
                <div className="ps-sub-head">
                  <span className="ps-block-label">Projection assumptions</span>
                </div>
                <div className="ps-withhold-grid">
                  <div className="ps-field ps-field-sm">
                    <div className="ps-field-label"><span>Starting balance</span></div>
                    <input
                      className="ps-input"
                      type="number"
                      min="0"
                      step="1000"
                      value={startBalance}
                      onChange={(e) => setStartBalance(Math.max(0, +e.target.value || 0))}
                    />
                  </div>
                  <div className="ps-field ps-field-sm">
                    <div className="ps-field-label"><span>Annual return %</span></div>
                    <input
                      className="ps-input"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={returnPct}
                      onChange={(e) => setReturnPct(Math.max(0, +e.target.value || 0))}
                    />
                  </div>
                  <div className="ps-field ps-field-sm">
                    <div className="ps-field-label"><span>Salary growth %</span></div>
                    <input
                      className="ps-input"
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={salaryGrowthPct}
                      onChange={(e) => setSalaryGrowthPct(Math.max(0, +e.target.value || 0))}
                    />
                  </div>
                  <div className="ps-field ps-field-sm">
                    <div className="ps-field-label"><span>Horizon (years)</span></div>
                    <input
                      className="ps-input"
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={horizon}
                      onChange={(e) =>
                        setHorizon(Math.max(1, Math.min(50, +e.target.value || 1)))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* ══════════ RECEIPT ══════════ */}
        <div>
          <div className="ps-receipt-wrap">
            <div className="ps-receipt">
              <div className="ps-receipt-head">
                <div>
                  <div className="ps-receipt-eyebrow">Paycheck breakdown</div>
                  <div className="ps-receipt-title">
                    {FILING_LABEL[filing]}
                    <span className="ps-receipt-sep">·</span>
                    {stateName === 'No state tax' ? 'No state tax' : stateName}
                  </div>
                </div>
                <div className="ps-receipt-badge">{calc.periods}× / year</div>
              </div>

              <div className="ps-receipt-body">
                <table className="ps-receipt-table">
                  <tbody>
                    <tr className="ps-receipt-section">
                      <td colSpan={3}>Earnings</td>
                    </tr>
                    <tr className="ps-receipt-row">
                      <td>Gross pay</td>
                      <td>{money2(calc.grossPerPeriod)}</td>
                      <td>{money0(calc.gross)}</td>
                    </tr>

                    <tr className="ps-receipt-section">
                      <td colSpan={3}>Pre-tax deductions</td>
                    </tr>
                    <tr className="ps-receipt-row is-neg">
                      <td>Traditional 401(k)</td>
                      <td>-{money2(calc.trad401k / calc.periods)}</td>
                      <td>-{money0(calc.trad401k)}</td>
                    </tr>
                    {calc.hsa > 0 && (
                      <tr className="ps-receipt-row is-neg">
                        <td>HSA</td>
                        <td>-{money2(calc.hsa / calc.periods)}</td>
                        <td>-{money0(calc.hsa)}</td>
                      </tr>
                    )}
                    {deductions.filter((d) => d.type === 'pretax').map((d) => (
                      <tr className="ps-receipt-row is-neg" key={`pre-${d.id}`}>
                        <td>{d.name || 'Deduction'}</td>
                        <td>-{money2(safe(d.amount) / calc.periods)}</td>
                        <td>-{money0(safe(d.amount))}</td>
                      </tr>
                    ))}
                    <tr className="ps-receipt-subtotal">
                      <td>Total pre-tax</td>
                      <td>{money2(calc.pretaxTotal / calc.periods)}</td>
                      <td>{money0(calc.pretaxTotal)}</td>
                    </tr>

                    <tr className="ps-receipt-section">
                      <td colSpan={3}>Taxes</td>
                    </tr>
                    <tr className="ps-receipt-row is-neg">
                      <td>Federal income tax</td>
                      <td>-{money2(calc.fedPerPeriod)}</td>
                      <td>-{money0(calc.fedTax)}</td>
                    </tr>
                    <tr className="ps-receipt-row is-neg">
                      <td>FICA (Social Security + Medicare)</td>
                      <td>-{money2(calc.ficaPerPeriod)}</td>
                      <td>-{money0(calc.fica)}</td>
                    </tr>
                    <tr className="ps-receipt-row is-neg">
                      <td>State income tax</td>
                      <td>-{money2(calc.statePerPeriod)}</td>
                      <td>-{money0(calc.stateTax)}</td>
                    </tr>
                    <tr className="ps-receipt-subtotal">
                      <td>Total taxes</td>
                      <td>{money2(calc.totalTax / calc.periods)}</td>
                      <td>{money0(calc.totalTax)}</td>
                    </tr>

                    {(calc.roth401k > 0 || deductions.some((d) => d.type === 'posttax')) && (
                      <>
                        <tr className="ps-receipt-section">
                          <td colSpan={3}>Post-tax deductions</td>
                        </tr>
                        {calc.roth401k > 0 && (
                          <tr className="ps-receipt-row is-neg">
                            <td>Roth 401(k)</td>
                            <td>-{money2(calc.roth401k / calc.periods)}</td>
                            <td>-{money0(calc.roth401k)}</td>
                          </tr>
                        )}
                        {deductions.filter((d) => d.type === 'posttax').map((d) => (
                          <tr className="ps-receipt-row is-neg" key={`post-${d.id}`}>
                            <td>{d.name || 'Deduction'}</td>
                            <td>-{money2(safe(d.amount) / calc.periods)}</td>
                            <td>-{money0(safe(d.amount))}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    <tr className="ps-receipt-net">
                      <td>Net pay</td>
                      <td>{money2(calc.netPerPeriod)}</td>
                      <td>{money0(calc.netAnnual)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ps-banner" style={{ marginTop: '0.85rem' }}>
              <Info />
              <span>
                Estimates only. Federal brackets, standard deduction, and FICA use 2025
                figures; state tax is a flat effective rate. Consult a tax professional
                before making decisions.
              </span>
            </div>
          </div>

          {/* ══════════ PROJECTION ══════════ */}
          <div className="settings-card" style={{ marginTop: '1.25rem' }}>
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3>Retirement Blueprint</h3>
                <p>{horizon}-year projection at {fmt(returnPct, 1)}% return</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div>
                <div
                  className="text-[0.6rem] font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  Projected balance
                </div>
                <div
                  className="text-lg font-extrabold tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {money0(projection.finalBalance)}
                </div>
              </div>
              <div>
                <div
                  className="text-[0.6rem] font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  Your contributions
                </div>
                <div className="text-lg font-extrabold tabular-nums">
                  {money0(projection.totalEmployee)}
                </div>
              </div>
              <div>
                <div
                  className="text-[0.6rem] font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  Employer match
                </div>
                <div className="text-lg font-extrabold tabular-nums">
                  {money0(projection.totalMatch)}
                </div>
              </div>
              <div>
                <div
                  className="text-[0.6rem] font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  Growth earned
                </div>
                <div className="text-lg font-extrabold tabular-nums">
                  {money0(
                    projection.finalBalance -
                      projection.totalEmployee -
                      projection.totalMatch -
                      Math.max(0, startBalance)
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-end gap-2 h-28 mt-2">
              {projection.milestones.map((m) => {
                const h = Math.max(4, (m.balance / projection.maxBalance) * 100);
                return (
                  <div
                    key={m.year}
                    className="flex-1 flex flex-col items-center gap-1.5 min-w-0"
                  >
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${h}%`,
                        background:
                          'linear-gradient(180deg, var(--accent), var(--accent-2))',
                        opacity: 0.9,
                      }}
                      title={`Year ${m.year}: ${money0(m.balance)}`}
                    />
                    <div
                      className="text-[0.55rem] font-extrabold tabular-nums"
                      style={{ color: 'var(--text-4)' }}
                    >
                      {m.year}y
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="flex items-center justify-between mt-3 pt-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div
                className="text-[0.65rem] font-semibold"
                style={{ color: 'var(--text-4)' }}
              >
                Contributions grow with salary at {fmt(salaryGrowthPct, 1)}% / yr
              </div>
              <div
                className="text-[0.65rem] font-extrabold tabular-nums"
                style={{ color: 'var(--text-2)' }}
              >
                {money0(projection.finalBalance)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep default export as an alias so both import styles work.
export default BlueprintTab;