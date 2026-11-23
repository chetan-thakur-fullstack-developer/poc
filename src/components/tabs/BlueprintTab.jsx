import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart } from '../charts/AreaChart.jsx';

/* ═══════════════════════════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════════════════════════ */
const fmt = (n, d = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: d, maximumFractionDigits: d,
  }).format(Number.isFinite(n) ? n : 0);
const pct = (n, d = 2) => `${(Number.isFinite(n) ? n : 0).toFixed(d)}%`;
const num = (v, fallback = 0) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fallback; };

const TABS = [
  { key: 'paycheck',    label: 'Paycheck',      icon: 'receipt' },
  { key: 'rule72',      label: 'Rule of 72',    icon: 'percent' },
  { key: 'mortgage',    label: 'Mortgage',      icon: 'home' },
  { key: 'vehicle',     label: 'Vehicle',       icon: 'car' },
  { key: 'projections', label: 'Projections',   icon: 'rocket' },
  { key: 'fire',        label: 'FIRE',          icon: 'flame' },
  { key: 'emergency',   label: 'Emergency',     icon: 'shield' },
  { key: 'inflation',   label: 'Inflation',     icon: 'trending-down' },
  { key: 'insights',    label: 'Insights',      icon: 'lightbulb' },
];

const FREQ = {
  52: 'Weekly', 26: 'Bi-Weekly', 24: 'Semi-Monthly', 12: 'Monthly',
};

const FED_BRACKETS_2024 = {
  single: [[11600,.10],[47150,.12],[100525,.22],[191950,.24],[243725,.32],[609350,.35],[Infinity,.37]],
  mfj:    [[23200,.10],[94300,.12],[201050,.22],[383900,.24],[487450,.32],[731200,.35],[Infinity,.37]],
};
const marginalTax = (income, filing) => {
  let tax = 0, prev = 0;
  for (const [cap, rate] of FED_BRACKETS_2024[filing]) {
    if (income <= prev) break;
    tax += (Math.min(income, cap) - prev) * rate;
    prev = cap;
  }
  return tax;
};

/* Dual slider + number input wrapper */
function DualField({ label, hint, value, onChange, min, max, step, prefix, suffix, placeholder }) {
  const rangePct = max !== undefined && min !== undefined && max > min
    ? Math.max(0, Math.min(100, ((num(value) - min) / (max - min)) * 100))
    : 0;

  return (
    <div className="ps-field">
      <label className="ps-field-label">
        <span>{label}</span>
        {hint !== undefined && <span className="ps-field-hint">{hint}</span>}
      </label>
      <div className="ps-field-input">
        <div style={{ position: 'relative' }}>
          <input
            type="number" className="ps-input"
            value={value} min={min} max={max} step={step}
            placeholder={placeholder}
            onChange={(e) => onChange(num(e.target.value))}
            style={suffix ? { paddingRight: '1.9rem' } : undefined}
          />
          {suffix && (
            <span style={{
              position: 'absolute', right: '.6rem', top: '50%',
              transform: 'translateY(-50%)', fontSize: 11, fontWeight: 800,
              color: 'var(--text-4)',
            }}>{suffix}</span>
          )}
        </div>
        {min !== undefined && max !== undefined && (
          <input
            type="range" className="ps-slider"
            min={min} max={max} step={step || 1}
            value={value}
            onChange={(e) => onChange(num(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--accent) ${rangePct}%, var(--surface-3) ${rangePct}%)`
            }}
          />
        )}
      </div>
    </div>
  );
}

/* Segmented control */
function Seg({ options, value, onChange }) {
  return (
    <div className="ps-seg">
      {options.map(({ value: v, label }) => (
        <button
          key={v} type="button"
          className={`ps-seg-item${value === v ? ' active' : ''}`}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. PAYCHECK CALCULATOR
   ═══════════════════════════════════════════════════════════ */
function PaycheckCalc() {
  const [salary, setSalary] = useState(145000);
  const [freq, setFreq] = useState(26);
  const [filing, setFiling] = useState('mfj');
  const [override, setOverride] = useState(false);
  const [preTax, setPreTax] = useState([
    { id: 'p1', label: '401(k)', method: 'percent', type: 'per_paycheck', amount: 6 },
    { id: 'p2', label: 'Health Insurance', method: 'fixed', type: 'per_paycheck', amount: 220 },
  ]);
  const [postTax, setPostTax] = useState([]);
  const [extraFed, setExtraFed] = useState(0);
  const [extraState, setExtraState] = useState(0);
  const [extraLocal, setExtraLocal] = useState(0);
  const [stateRate, setStateRate] = useState(0);
  const [localRate, setLocalRate] = useState(0);

  const calc = useMemo(() => {
    const grossPeriod = salary / freq;
    const grossAnnual = salary;
    const prePerPeriod = preTax.reduce((s, d) =>
      s + (d.method === 'percent' ? grossPeriod * d.amount / 100
        : d.type === 'per_paycheck' ? d.amount
        : d.amount / freq), 0);
    const postPerPeriod = postTax.reduce((s, d) =>
      s + (d.method === 'percent' ? grossPeriod * d.amount / 100
        : d.type === 'per_paycheck' ? d.amount
        : d.amount / freq), 0);

    const taxableAnnual = Math.max(0, grossAnnual - prePerPeriod * freq);
    const fedAnnual = marginalTax(taxableAnnual, filing);
    const fedPerPeriod = fedAnnual / freq + extraFed;
    const statePerPeriod = taxableAnnual * stateRate / 100 / freq + extraState;
    const localPerPeriod = taxableAnnual * localRate / 100 / freq + extraLocal;
    const ssBase = Math.min(taxableAnnual, 168600);
    const ssPerPeriod = ssBase * .062 / freq;
    const mediBase = taxableAnnual;
    const mediPerPeriod = (mediBase * .0145 + Math.max(0, mediBase - 200000) * .009) / freq;

    const totalTax = fedPerPeriod + statePerPeriod + localPerPeriod + ssPerPeriod + mediPerPeriod;
    const netPeriod = Math.max(0, grossPeriod - prePerPeriod - totalTax - postPerPeriod);
    const effTax = grossAnnual > 0 ? (totalTax * freq / grossAnnual) * 100 : 0;

    return {
      grossPeriod, grossAnnual, prePerPeriod, postPerPeriod,
      fedPerPeriod, statePerPeriod, localPerPeriod, ssPerPeriod, mediPerPeriod,
      totalTax, netPeriod, netAnnual: netPeriod * freq, effTax,
    };
  }, [salary, freq, filing, preTax, postTax, extraFed, extraState, extraLocal, stateRate, localRate]);

  const addDeduction = (kind) => {
    const setter = kind === 'pre' ? setPreTax : setPostTax;
    setter((arr) => [...arr, {
      id: kind + '_' + Date.now(),
      label: 'New Deduction', method: 'fixed', type: 'per_paycheck', amount: 0,
    }]);
  };
  const updateDed = (kind, id, patch) => {
    const setter = kind === 'pre' ? setPreTax : setPostTax;
    setter((arr) => arr.map((d) => d.id === id ? { ...d, ...patch } : d));
  };
  const removeDed = (kind, id) => {
    const setter = kind === 'pre' ? setPreTax : setPostTax;
    setter((arr) => arr.filter((d) => d.id !== id));
  };

  const renderDedList = (list, kind) => list.map((d) => (
    <div key={d.id} className="ps-row">
      <div className="ps-row-label-row">
        <input className="ps-row-label-input" value={d.label}
          onChange={(e) => updateDed(kind, d.id, { label: e.target.value })} />
        <button className="cat-action-btn danger" onClick={() => removeDed(kind, d.id)} title="Remove">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="ps-row-controls">
        <select value={d.method} onChange={(e) => updateDed(kind, d.id, { method: e.target.value })}>
          <option value="fixed">$ fixed</option>
          <option value="percent">% of gross</option>
        </select>
        <input type="number" value={d.amount} min={0}
          onChange={(e) => updateDed(kind, d.id, { amount: num(e.target.value) })} />
        <select value={d.type} onChange={(e) => updateDed(kind, d.id, { type: e.target.value })}>
          <option value="per_paycheck">per paycheck</option>
          <option value="annual">per year</option>
        </select>
      </div>
    </div>
  ));

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Net Take-Home</span>
          <div className="ps-hero-value">{fmt(calc.netPeriod)}</div>
          <div className="ps-hero-sub">per paycheck ({FREQ[freq]})</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Gross</span><div className="ps-stat-value">{fmt(calc.grossPeriod)}</div><div className="ps-stat-sub">per period</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Effective Tax</span><div className="ps-stat-value">{pct(calc.effTax, 1)}</div><div className="ps-stat-sub">of gross</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Annual Net</span><div className="ps-stat-value">{fmt(calc.netAnnual)}</div><div className="ps-stat-sub">{freq} periods / yr</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head">
              <span className="ps-block-label">Compensation</span>
              {override && <button className="ps-mini-btn" onClick={() => { setOverride(false); setSalary(145000); }}>Reset</button>}
            </div>

            <DualField
              label="Annual Salary" hint={fmt(salary)}
              value={salary} onChange={setSalary}
              min={0} max={500000} step={1000}
            />

            <div className="ps-field">
              <label className="ps-field-label"><span>Pay Frequency</span></label>
              <Seg value={freq} onChange={setFreq}
                options={Object.entries(FREQ).map(([v, l]) => ({ value: Number(v), label: l }))} />
            </div>

            <div className="ps-field">
              <label className="ps-field-label"><span>Filing Status</span></label>
              <Seg value={filing} onChange={setFiling}
                options={[{ value: 'single', label: 'Single' }, { value: 'mfj', label: 'Married Filing Jointly' }]} />
            </div>

            <label className="ps-check">
              <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
              <span>Simulate override</span>
            </label>
            {override && (
              <div className="ps-banner">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 2v6l-4 8v4h12v-4l-4-8V2"/><line x1="8" y1="2" x2="16" y2="2"/></svg>
                <span>Simulation mode — changes here don't affect your global Income Profile.</span>
              </div>
            )}
          </div>

          <details className="ps-adv">
            <summary className="ps-adv-summary">
              <span>Advanced Deductions &amp; Withholding</span>
              <svg className="ps-adv-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div className="ps-adv-body">
              <div className="ps-sub-block">
                <div className="ps-sub-head">
                  <span className="ps-block-label">Pre-Tax</span>
                  <span className="ps-sub-hint">Applied before federal tax</span>
                </div>
                <div className="ps-rows">{renderDedList(preTax, 'pre')}</div>
              </div>
              <div className="ps-sub-block">
                <div className="ps-sub-head">
                  <span className="ps-block-label">Post-Tax</span>
                  <button className="ps-mini-btn" onClick={() => addDeduction('post')}>+ Add</button>
                </div>
                <div className="ps-rows">{renderDedList(postTax, 'post')}</div>
              </div>
              <div className="ps-sub-block">
                <div className="ps-sub-head"><span className="ps-block-label">Withholding &amp; Rates</span></div>
                <div className="ps-withhold-grid">
                  <div className="ps-field ps-field-sm"><label className="ps-field-label"><span>Extra Fed / Period</span></label><input type="number" className="ps-input" value={extraFed} onChange={(e) => setExtraFed(num(e.target.value))} /></div>
                  <div className="ps-field ps-field-sm"><label className="ps-field-label"><span>State / Period</span></label><input type="number" className="ps-input" value={extraState} onChange={(e) => setExtraState(num(e.target.value))} /></div>
                  <div className="ps-field ps-field-sm"><label className="ps-field-label"><span>Local / Period</span></label><input type="number" className="ps-input" value={extraLocal} onChange={(e) => setExtraLocal(num(e.target.value))} /></div>
                  <div className="ps-field ps-field-sm"><label className="ps-field-label"><span>State Tax %</span></label><input type="number" className="ps-input" value={stateRate} step={0.1} onChange={(e) => setStateRate(num(e.target.value))} /></div>
                  <div className="ps-field ps-field-sm"><label className="ps-field-label"><span>Local Tax %</span></label><input type="number" className="ps-input" value={localRate} step={0.1} onChange={(e) => setLocalRate(num(e.target.value))} /></div>
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div>
                <div className="ps-receipt-eyebrow">Paystub Breakdown</div>
                <div className="ps-receipt-title">Per Period<span className="ps-receipt-sep">·</span>Annual</div>
              </div>
              <span className="ps-receipt-badge">{freq} periods / yr</span>
            </div>
            <div className="ps-receipt-body">
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-section"><td colSpan={3}>Earnings</td></tr>
                <tr className="ps-receipt-row"><td>Gross</td><td>{fmt(calc.grossAnnual)}</td><td>{fmt(calc.grossPeriod)}</td></tr>

                {preTax.length > 0 && (<>
                  <tr className="ps-receipt-section"><td colSpan={3}>Pre-Tax Deductions</td></tr>
                  {preTax.map((d) => {
                    const per = d.method === 'percent' ? calc.grossPeriod * d.amount / 100 : d.type === 'per_paycheck' ? d.amount : d.amount / freq;
                    return <tr key={d.id} className="ps-receipt-row is-neg"><td>{d.label}</td><td>{per * freq > 0 ? fmt(per * freq) : '—'}</td><td>− {fmt(per)}</td></tr>;
                  })}
                </>)}

                <tr className="ps-receipt-section"><td colSpan={3}>Taxes</td></tr>
                <tr className="ps-receipt-row is-neg"><td>Federal</td><td>{fmt(calc.fedPerPeriod * freq)}</td><td>− {fmt(calc.fedPerPeriod)}</td></tr>
                <tr className="ps-receipt-row is-neg"><td>State</td><td>{fmt(calc.statePerPeriod * freq)}</td><td>− {fmt(calc.statePerPeriod)}</td></tr>
                <tr className="ps-receipt-row is-neg"><td>Local</td><td>{fmt(calc.localPerPeriod * freq)}</td><td>− {fmt(calc.localPerPeriod)}</td></tr>
                <tr className="ps-receipt-row is-neg"><td>Social Security</td><td>{fmt(calc.ssPerPeriod * freq)}</td><td>− {fmt(calc.ssPerPeriod)}</td></tr>
                <tr className="ps-receipt-row is-neg"><td>Medicare</td><td>{fmt(calc.mediPerPeriod * freq)}</td><td>− {fmt(calc.mediPerPeriod)}</td></tr>

                {postTax.length > 0 && (<>
                  <tr className="ps-receipt-section"><td colSpan={3}>Post-Tax Deductions</td></tr>
                  {postTax.map((d) => {
                    const per = d.method === 'percent' ? calc.grossPeriod * d.amount / 100 : d.type === 'per_paycheck' ? d.amount : d.amount / freq;
                    return <tr key={d.id} className="ps-receipt-row is-neg"><td>{d.label}</td><td>—</td><td>− {fmt(per)}</td></tr>;
                  })}
                </>)}

                <tr className="ps-receipt-subtotal"><td>Total Deductions</td><td></td><td>{fmt(calc.grossPeriod - calc.netPeriod)}</td></tr>
                <tr className="ps-receipt-net"><td>Net</td><td></td><td>{fmt(calc.netPeriod)}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. RULE OF 72
   ═══════════════════════════════════════════════════════════ */
function Rule72Calc() {
  const [mode, setMode] = useState('rate');
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(9);
  const [initial, setInitial] = useState(10000);

  const calc = useMemo(() => {
    const r = mode === 'rate' ? rate : 72 / years;
    const y = mode === 'rate' ? 72 / rate : years;
    const exact = r > 0 ? Math.log(2) / Math.log(1 + r / 100) : Infinity;
    return {
      r, y,
      ruleYears: y,
      exactYears: exact,
      finalAmount: initial * 2,
    };
  }, [mode, rate, years, initial]);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Doubling Result</span>
          <div className="ps-hero-value">{calc.y.toFixed(1)} yrs</div>
          <div className="ps-hero-sub">to double your money</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Rate</span><div className="ps-stat-value">{pct(calc.r, 2)}</div><div className="ps-stat-sub">annual return</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Exact Doubling</span><div className="ps-stat-value">{calc.exactYears.toFixed(2)} yrs</div><div className="ps-stat-sub">compounded</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Final Amount</span><div className="ps-stat-value">{fmt(calc.finalAmount)}</div><div className="ps-stat-sub">2× principal</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Solve For</span></div>
            <Seg value={mode} onChange={setMode} options={[
              { value: 'rate', label: 'Years from Rate' },
              { value: 'years', label: 'Rate from Years' },
            ]} />
          </div>
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Inputs</span>
              <button className="ps-mini-btn" onClick={() => { setRate(8); setYears(9); setInitial(10000); }}>Reset</button>
            </div>
            {mode === 'rate' ? (
              <DualField label="Annual Return / Interest Rate" hint={pct(rate)}
                value={rate} onChange={setRate} min={0.1} max={30} step={0.1} suffix="%" />
            ) : (
              <DualField label="Desired Years to Double" hint={`${years} yrs`}
                value={years} onChange={setYears} min={1} max={50} step={1} suffix="y" />
            )}
            <DualField label="Initial Investment (optional)" hint={fmt(initial)}
              value={initial} onChange={setInitial} min={0} max={1000000} step={1000} />
          </div>
          <div className="ps-banner">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>The <b>Rule of 72</b> divides 72 by the annual rate to approximate doubling time. Most accurate near <b>8%</b>.</span>
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Rule of 72</div><div className="ps-receipt-title">Step-by-Step Breakdown</div></div>
              <span className="ps-receipt-badge">{mode === 'rate' ? `${pct(rate)} → ${calc.y.toFixed(1)}y` : `${years}y → ${pct(calc.r)}`}</span>
            </div>
            <div className="ps-receipt-body">
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-section"><td colSpan={2}>Formula</td></tr>
                <tr className="ps-receipt-row"><td>Rule of 72</td><td>Years = 72 ÷ Rate%</td></tr>
                <tr className="ps-receipt-row"><td>Exact Formula</td><td>ln(2) ÷ ln(1+r)</td></tr>
                <tr className="ps-receipt-section"><td colSpan={2}>Your Numbers</td></tr>
                <tr className="ps-receipt-row"><td>Rate</td><td>{pct(calc.r)}</td></tr>
                <tr className="ps-receipt-row"><td>Rule-of-72 estimate</td><td>{calc.y.toFixed(2)} years</td></tr>
                <tr className="ps-receipt-row"><td>Exact estimate</td><td>{calc.exactYears.toFixed(2)} years</td></tr>
                <tr className="ps-receipt-row"><td>Accuracy</td><td>{pct(Math.abs(calc.exactYears - calc.y) / calc.exactYears * 100, 1)} error</td></tr>
                <tr className="ps-receipt-net"><td>Final (2×)</td><td>{fmt(calc.finalAmount)}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. MORTGAGE
   ═══════════════════════════════════════════════════════════ */
function MortgageCalc() {
  const [propVal, setPropVal] = useState(622000);
  const [downPct, setDownPct] = useState(5);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(30);
  const [extra, setExtra] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [taxPct, setTaxPct] = useState(2.3);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [subTab, setSubTab] = useState('amortization');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const calc = useMemo(() => {
    const downAmt = propVal * downPct / 100;
    const principal = Math.max(0, propVal - downAmt);
    const monthlyRate = rate / 100 / 12;
    const months = term * 12;
    const monthlyPmt = principal > 0 && monthlyRate > 0
      ? principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : principal / Math.max(1, months);

    // Amortization
    const schedule = [];
    let balance = principal, totalInterest = 0;
    for (let m = 1; m <= months && balance > 0.01; m++) {
      const interest = balance * monthlyRate;
      const scheduled = Math.min(monthlyPmt - interest, balance);
      const extraThis = Math.min(extra, balance - scheduled);
      const newBalance = Math.max(0, balance - scheduled - extraThis);
      totalInterest += interest;
      schedule.push({
        month: m, payment: interest + scheduled + extraThis,
        interest, principal: scheduled, extra: extraThis,
        balance: newBalance, cumInterest: totalInterest,
      });
      balance = newBalance;
    }

    const annualTax = propVal * taxPct / 100;
    const monthlyTax = annualTax / 12;
    const monthlyIns = insurance / 12;
    const totalMonthly = monthlyPmt + monthlyTax + monthlyIns + utilities;

    return {
      principal, downAmt, monthlyPmt, schedule,
      totalInterest, annualTax, monthlyTax, monthlyIns, totalMonthly,
      monthsActual: schedule.length,
      baseMonths: months,
    };
  }, [propVal, downPct, rate, term, extra, utilities, insurance, taxPct]);

  const pageRows = calc.schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(calc.schedule.length / PAGE_SIZE);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Monthly Out-of-Pocket</span>
          <div className="ps-hero-value">{fmt(calc.totalMonthly)}</div>
          <div className="ps-hero-sub">P&amp;I + tax + insurance + utilities</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Annual Property Tax</span><div className="ps-stat-value">{fmt(calc.annualTax)}</div><div className="ps-stat-sub">@ {pct(taxPct)}</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Insurance</span><div className="ps-stat-value">{fmt(calc.monthlyIns)}/mo</div><div className="ps-stat-sub">{fmt(insurance)}/yr</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Payoff</span><div className="ps-stat-value">{calc.monthsActual} mo</div><div className="ps-stat-sub">{calc.monthsActual < calc.baseMonths ? `saved ${calc.baseMonths - calc.monthsActual} mo` : 'on schedule'}</div></div>
        </div>
      </div>

      <div className="mort-subtabs">
        {['amortization', 'tax', 'formula'].map((k) => (
          <button key={k} className={`mort-subtab${subTab === k ? ' active' : ''}`} onClick={() => setSubTab(k)}>
            {k === 'amortization' ? 'Mortgage & Amortization' : k === 'tax' ? 'Property Tax Details' : 'Step-by-Step Formula'}
          </button>
        ))}
      </div>

      {subTab === 'amortization' && (
        <>
          <div className="ps-layout">
            <div className="ps-controls">
              <div className="ps-block">
                <div className="ps-block-head"><span className="ps-block-label">Loan Parameters</span></div>
                <DualField label="Property Value" hint={fmt(propVal)} value={propVal} onChange={setPropVal} min={50000} max={2500000} step={1000} />
                <DualField label="Down Payment %" hint={`${downPct}% · ${fmt(calc.downAmt)}`} value={downPct} onChange={setDownPct} min={0} max={100} step={0.5} suffix="%" />
                <DualField label="Interest Rate" hint={pct(rate)} value={rate} onChange={setRate} min={1} max={15} step={0.01} suffix="%" />
                <DualField label="Loan Length" hint={`${term} years`} value={term} onChange={setTerm} min={1} max={40} step={1} suffix="y" />
              </div>
              <div className="ps-block">
                <div className="ps-block-head"><span className="ps-block-label">Acceleration &amp; Carrying Costs</span></div>
                <DualField label="Extra Monthly Principal" hint={fmt(extra)} value={extra} onChange={setExtra} min={0} max={25000} step={50} />
                <DualField label="Monthly Utilities" hint={fmt(utilities)} value={utilities} onChange={setUtilities} min={0} max={1500} step={10} />
                <DualField label="Home Insurance (Annual)" hint={`${fmt(insurance)}/yr`} value={insurance} onChange={setInsurance} min={0} max={12000} step={50} />
                <DualField label="Property Tax Rate" hint={pct(taxPct)} value={taxPct} onChange={setTaxPct} min={0} max={15} step={0.01} suffix="%" />
              </div>
            </div>
            <div className="ps-receipt-wrap">
              <div className="ps-receipt">
                <div className="ps-receipt-head">
                  <div><div className="ps-receipt-eyebrow">Long-Term Cost Analysis</div><div className="ps-receipt-title">Traditional vs Accelerated</div></div>
                  <span className="ps-receipt-badge">{fmt(calc.monthlyPmt)}/mo P&amp;I</span>
                </div>
                <div className="ps-receipt-body" style={{ padding: '1rem 0' }}>
                  <table className="ps-receipt-table"><tbody>
                    <tr className="ps-receipt-section"><td colSpan={2}>Loan Summary</td></tr>
                    <tr className="ps-receipt-row"><td>Loan Amount</td><td>{fmt(calc.principal)}</td></tr>
                    <tr className="ps-receipt-row"><td>Monthly P&amp;I</td><td>{fmt(calc.monthlyPmt)}</td></tr>
                    <tr className="ps-receipt-row"><td>Total Interest</td><td>{fmt(calc.totalInterest)}</td></tr>
                    <tr className="ps-receipt-row"><td>Total Paid</td><td>{fmt(calc.principal + calc.totalInterest)}</td></tr>
                    <tr className="ps-receipt-section"><td colSpan={2}>Monthly Carry</td></tr>
                    <tr className="ps-receipt-row"><td>P&amp;I</td><td>{fmt(calc.monthlyPmt)}</td></tr>
                    <tr className="ps-receipt-row"><td>Property tax (escrow)</td><td>{fmt(calc.monthlyTax)}</td></tr>
                    <tr className="ps-receipt-row"><td>Insurance</td><td>{fmt(calc.monthlyIns)}</td></tr>
                    <tr className="ps-receipt-row"><td>Utilities</td><td>{fmt(utilities)}</td></tr>
                    <tr className="ps-receipt-net"><td>Total Monthly</td><td>{fmt(calc.totalMonthly)}</td></tr>
                  </tbody></table>
                </div>
              </div>
            </div>
          </div>

          <div className="surface p-5 lg:p-6" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '.85rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '.8125rem', fontWeight: 800, color: 'var(--text-1)' }}>Month-by-Month Amortization</h3>
              <button className="btn btn-ghost" onClick={() => exportMortgageCSV(calc.schedule)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table className="ledger-table" style={{ width: '100%' }}>
                <thead><tr>
                  <th>Month</th><th>Payment</th><th>Scheduled Principal</th><th>Extra Principal</th><th>Interest</th><th>Balance</th><th>Cum. Interest</th>
                </tr></thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.month}>
                      <td>{r.month}</td>
                      <td style={{ fontFamily: 'JetBrains Mono' }}>{fmt(r.payment)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono' }}>{fmt(r.principal)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#C4B5FD' }}>{r.extra > 0 ? fmt(r.extra) : '—'}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#FDA4AF' }}>{fmt(r.interest)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono' }}>{fmt(r.balance)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-3)' }}>{fmt(r.cumInterest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mort-pager" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div className="mort-pager-info" style={{ fontSize: 11, color: 'var(--text-4)' }}>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, calc.schedule.length)} of {calc.schedule.length}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>← Prev</button>
                <span style={{ fontSize: 11 }}>Page {page + 1} / {totalPages}</span>
                <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Next →</button>
              </div>
            </div>
          </div>
        </>
      )}

      {subTab === 'tax' && (
        <div className="ps-layout">
          <div className="ps-controls">
            <div className="ps-block">
              <div className="ps-block-head"><span className="ps-block-label">Regional Tax Evaluation</span></div>
              <DualField label="Property Value" hint={fmt(propVal)} value={propVal} onChange={setPropVal} min={50000} max={2500000} step={1000} />
              <DualField label="Property Tax Rate" hint={pct(taxPct)} value={taxPct} onChange={setTaxPct} min={0} max={15} step={0.01} suffix="%" />
            </div>
          </div>
          <div className="ps-receipt-wrap">
            <div className="ps-receipt">
              <div className="ps-receipt-head">
                <div><div className="ps-receipt-eyebrow">Tax Breakdown</div><div className="ps-receipt-title">Annual &amp; Monthly Liability</div></div>
                <span className="ps-receipt-badge">ESCROW</span>
              </div>
              <div className="ps-receipt-body" style={{ padding: '1.15rem 1.35rem' }}>
                <table className="ps-receipt-table"><tbody>
                  <tr className="ps-receipt-row"><td>Property Value Base</td><td>{fmt(propVal)}</td></tr>
                  <tr className="ps-receipt-row"><td>Effective Tax Rate</td><td>{pct(taxPct)}</td></tr>
                  <tr className="ps-receipt-row"><td>Annual Property Tax</td><td>{fmt(calc.annualTax)}</td></tr>
                  <tr className="ps-receipt-row"><td>Monthly Escrow</td><td>{fmt(calc.monthlyTax)}</td></tr>
                  <tr className="ps-receipt-row"><td>Daily Accrual</td><td>{fmt(calc.annualTax / 365, 2)}</td></tr>
                  <tr className="ps-receipt-section"><td colSpan={2}>Benchmark</td></tr>
                  <tr className="ps-receipt-row"><td>vs US National Avg (1.07%)</td><td>{taxPct > 1.07 ? '+' : ''}{pct(taxPct - 1.07)}</td></tr>
                  <tr className="ps-receipt-row"><td>vs Baseline (2.30%)</td><td>{taxPct > 2.3 ? '+' : ''}{pct(taxPct - 2.3)}</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'formula' && (
        <div className="surface p-5 lg:p-6">
          <div className="mort-formula" style={{ fontSize: 18, padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 12, marginBottom: '1rem', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
            M = P × [ r(1+r)<sup>n</sup> ] ÷ [ (1+r)<sup>n</sup> − 1 ]
          </div>
          <table className="ps-receipt-table"><tbody>
            <tr className="ps-receipt-row"><td>P (Principal)</td><td>{fmt(calc.principal)}</td></tr>
            <tr className="ps-receipt-row"><td>r (Monthly rate)</td><td>{(rate / 12).toFixed(4)}%</td></tr>
            <tr className="ps-receipt-row"><td>n (Months)</td><td>{term * 12}</td></tr>
            <tr className="ps-receipt-row"><td>(1+r)^n</td><td>{Math.pow(1 + rate / 100 / 12, term * 12).toFixed(4)}</td></tr>
            <tr className="ps-receipt-net"><td>M (Monthly payment)</td><td>{fmt(calc.monthlyPmt)}</td></tr>
          </tbody></table>
        </div>
      )}
    </>
  );
}

function exportMortgageCSV(schedule) {
  const header = 'Month,Payment,Scheduled Principal,Extra Principal,Interest,Balance,Cum. Interest\n';
  const rows = schedule.map(r =>
    `${r.month},${r.payment.toFixed(2)},${r.principal.toFixed(2)},${r.extra.toFixed(2)},${r.interest.toFixed(2)},${r.balance.toFixed(2)},${r.cumInterest.toFixed(2)}`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mortgage-amortization.csv';
  a.click(); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   4. VEHICLE (Lease + Valuation)
   ═══════════════════════════════════════════════════════════ */
function VehicleCalc() {
  const [mode, setMode] = useState('lease');
  return (
    <>
      <div className="mb-5" style={{ maxWidth: 320 }}>
        <Seg
          value={mode}
          onChange={setMode}
          options={[
            { value: 'lease', label: '🚗 Lease Check' },
            { value: 'valuation', label: '🏷️ Buy / Sell Value' }
          ]}
        />
      </div>
      {mode === 'lease' ? <LeaseCalc /> : <ValuationCalc />}
    </>
  );
}

function LeaseCalc() {
  const [msrp, setMsrp] = useState(45000);
  const [monthly, setMonthly] = useState(499);
  const [down, setDown] = useState(0);
  const [term, setTerm] = useState(36);
  const [miles, setMiles] = useState(12000);

  const calc = useMemo(() => {
    const totalCost = down + monthly * term;
    const trueMonthly = totalCost / term;
    const dealPct = msrp > 0 ? (trueMonthly / msrp) * 100 : 0;
    const threshold = miles === 15000 ? 1.35 : miles === 10000 ? 1.20 : 1.25;
    let grade = 'excellent';
    if (dealPct > 2.0) grade = 'poor';
    else if (dealPct > 1.5) grade = 'average';
    else if (dealPct > threshold) grade = 'good';
    return { totalCost, trueMonthly, dealPct, threshold, grade };
  }, [msrp, monthly, down, term, miles]);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Deal Percentage</span>
          <div className="ps-hero-value">{pct(calc.dealPct)}</div>
          <div className="ps-hero-sub">
            <b style={{ color: '#14B8A6' }}>Target: ≤ {pct(calc.threshold)}</b> · {term}mo · {miles.toLocaleString()} mi/yr
          </div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">True Monthly</span><div className="ps-stat-value">{fmt(calc.trueMonthly)}</div><div className="ps-stat-sub">down amortized</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Quoted</span><div className="ps-stat-value">{fmt(monthly)}</div><div className="ps-stat-sub">as advertised</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Total Cost</span><div className="ps-stat-value">{fmt(calc.totalCost)}</div><div className="ps-stat-sub">over {term} months</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Deal Inputs</span></div>
            <DualField label="Vehicle MSRP" hint={fmt(msrp)} value={msrp} onChange={setMsrp} min={0} max={200000} step={500} />
            <DualField label="Quoted Monthly Payment" hint={fmt(monthly)} value={monthly} onChange={setMonthly} min={0} max={3000} step={5} />
            <DualField label="Down Payment" hint={fmt(down)} value={down} onChange={setDown} min={0} max={20000} step={100} />
            <div className="ps-field">
              <label className="ps-field-label"><span>Lease Term</span></label>
              <Seg value={term} onChange={setTerm} options={[
                { value: 12, label: '12' }, { value: 24, label: '24' }, { value: 36, label: '36' }, { value: 39, label: '39' }, { value: 48, label: '48' },
              ]} />
            </div>
            <div className="ps-field">
              <label className="ps-field-label"><span>Annual Mileage</span></label>
              <Seg value={miles} onChange={setMiles} options={[
                { value: 10000, label: '10k' }, { value: 12000, label: '12k' }, { value: 15000, label: '15k' },
              ]} />
            </div>
          </div>
          <div className="ps-banner">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>The <b>1.25% rule</b>: a strong lease is ≤1.25% of MSRP/month with $0 down. 15k-mi gets a +0.10% leniency.</span>
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Deal Analysis</div><div className="ps-receipt-title">1.25% Rule Benchmark</div></div>
              <span className="ps-receipt-badge" style={{ background: calc.grade === 'excellent' ? '#10B981' : calc.grade === 'good' ? '#14B8A6' : calc.grade === 'average' ? '#F59E0B' : '#F43F5E', color: '#fff' }}>{calc.grade.toUpperCase()}</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1rem 1.35rem' }}>
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-row"><td>MSRP</td><td>{fmt(msrp)}</td></tr>
                <tr className="ps-receipt-row"><td>Quoted Monthly</td><td>{fmt(monthly)}</td></tr>
                <tr className="ps-receipt-row"><td>Down Payment</td><td>{fmt(down)}</td></tr>
                <tr className="ps-receipt-row"><td>Term</td><td>{term} months</td></tr>
                <tr className="ps-receipt-row"><td>Total Cost</td><td>{fmt(calc.totalCost)}</td></tr>
                <tr className="ps-receipt-row"><td>True Monthly</td><td>{fmt(calc.trueMonthly)}</td></tr>
                <tr className="ps-receipt-row"><td>Deal %</td><td style={{ color: '#C4B5FD', fontWeight: 800 }}>{pct(calc.dealPct)}</td></tr>
                <tr className="ps-receipt-row"><td>Target</td><td>≤ {pct(calc.threshold)}</td></tr>
                <tr className="ps-receipt-net"><td>Verdict</td><td style={{ textTransform: 'capitalize' }}>{calc.grade} deal</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ValuationCalc() {
  const [perspective, setPerspective] = useState('buying');
  const [msrp, setMsrp] = useState(35000);
  const [age, setAge] = useState(3);
  const [mileage, setMileage] = useState(36000);
  const [condition, setCondition] = useState('good');
  const [listed, setListed] = useState(25000);
  const [final, setFinal] = useState(0);

  const calc = useMemo(() => {
    const condMult = { excellent: 1.05, good: 1.00, fair: 0.85, poor: 0.65 }[condition];
    let value = msrp;
    if (age >= 1) value *= 0.80;
    for (let i = 1; i < age; i++) value *= 0.90;
    const expectedMiles = age * 12000;
    const mileAdj = 1 - Math.max(-0.15, Math.min(0.15, (mileage - expectedMiles) / 12000 * 0.03));
    value *= mileAdj * condMult;
    const target = final > 0 ? final : listed;
    const variance = value > 0 ? ((target - value) / value) * 100 : 0;
    let grade = 'average';
    if (perspective === 'buying') {
      if (variance < -10) grade = 'excellent';
      else if (variance < 0) grade = 'good';
      else if (variance < 10) grade = 'average';
      else grade = 'poor';
    } else {
      if (variance > 10) grade = 'excellent';
      else if (variance > 0) grade = 'good';
      else if (variance > -10) grade = 'average';
      else grade = 'poor';
    }
    return { value, target, variance, grade };
  }, [msrp, age, mileage, condition, listed, final, perspective]);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Market Value</span>
          <div className="ps-hero-value">{fmt(calc.value)}</div>
          <div className="ps-hero-sub">Age · mileage · condition adjusted</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Listed</span><div className="ps-stat-value">{fmt(listed)}</div><div className="ps-stat-sub">asking</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Target</span><div className="ps-stat-value">{fmt(calc.target)}</div><div className="ps-stat-sub">effective</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Variance</span><div className="ps-stat-value">{calc.variance > 0 ? '+' : ''}{pct(calc.variance, 1)}</div><div className="ps-stat-sub">vs market</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Your Perspective</span></div>
            <Seg value={perspective} onChange={setPerspective} options={[
              { value: 'buying', label: 'I am Buying' },
              { value: 'selling', label: 'I am Selling' },
            ]} />
          </div>
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Vehicle Baseline</span></div>
            <DualField label="Original MSRP" hint={fmt(msrp)} value={msrp} onChange={setMsrp} min={0} max={200000} step={500} />
            <DualField label="Vehicle Age" hint={`${age} years`} value={age} onChange={setAge} min={0} max={15} step={1} suffix="y" />
            <DualField label="Odometer Mileage" hint={`${mileage.toLocaleString()} mi`} value={mileage} onChange={setMileage} min={0} max={300000} step={1000} />
            <div className="ps-field">
              <label className="ps-field-label"><span>Condition</span></label>
              <select className="input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="excellent">Excellent — 1.05×</option>
                <option value="good">Good — 1.00×</option>
                <option value="fair">Fair — 0.85×</option>
                <option value="poor">Poor — 0.65×</option>
              </select>
            </div>
          </div>
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Pricing</span></div>
            <DualField label="Listed Selling Price" hint={fmt(listed)} value={listed} onChange={setListed} min={0} max={200000} step={500} />
            <div className="ps-field">
              <label className="ps-field-label"><span>Final Sale Price (optional)</span></label>
              <div className="ps-field-input">
                <input type="number" className="ps-input" value={final} placeholder="0 = use listed"
                  onChange={(e) => setFinal(num(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Deal Analysis</div><div className="ps-receipt-title">Market Value &amp; Verdict</div></div>
              <span className="ps-receipt-badge" style={{ background: calc.grade === 'excellent' ? '#10B981' : calc.grade === 'good' ? '#14B8A6' : calc.grade === 'average' ? '#F59E0B' : '#F43F5E', color: '#fff' }}>{calc.grade.toUpperCase()}</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1rem 1.35rem' }}>
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-row"><td>MSRP</td><td>{fmt(msrp)}</td></tr>
                <tr className="ps-receipt-row"><td>Age ({age} yrs)</td><td>−20% yr1, −10% / yr</td></tr>
                <tr className="ps-receipt-row"><td>Mileage adj ({mileage.toLocaleString()} mi)</td><td>±3% per 12k delta</td></tr>
                <tr className="ps-receipt-row"><td>Condition ({condition})</td><td>× {({excellent:1.05,good:1,fair:.85,poor:.65})[condition]}</td></tr>
                <tr className="ps-receipt-row"><td>Listed / final</td><td>{fmt(calc.target)}</td></tr>
                <tr className="ps-receipt-net"><td>Market Value</td><td>{fmt(calc.value)}</td></tr>
                <tr className="ps-receipt-row"><td>Variance</td><td style={{ color: (perspective === 'buying' ? calc.variance < 0 : calc.variance > 0) ? '#6EE7B7' : '#FDA4AF', fontWeight: 800 }}>{calc.variance > 0 ? '+' : ''}{pct(calc.variance, 1)}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. PROJECTIONS (compound interest)
   ═══════════════════════════════════════════════════════════ */
function ProjectionsCalc() {
  const [starting, setStarting] = useState(0);
  const [monthlyContri, setMonthlyContri] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(20);
  const [inflation, setInflation] = useState(2.5);
  const [compounding, setCompounding] = useState('monthly');

  const calc = useMemo(() => {
    const n = compounding === 'daily' ? 365 : compounding === 'yearly' ? 1 : 12;
    const r = annualReturn / 100;
    const t = years;
    const periodicRate = r / n;
    const periods = n * t;

    const fvLump = starting * Math.pow(1 + periodicRate, periods);
    const monthlyContriPerPeriod = monthlyContri * (12 / n);
    const fvContributions = monthlyContriPerPeriod > 0
      ? monthlyContriPerPeriod * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate)
      : 0;
    const finalValue = fvLump + fvContributions;
    const totalContributed = monthlyContri * 12 * t;
    const growth = finalValue - starting - totalContributed;
    const realValue = finalValue / Math.pow(1 + inflation / 100, t);

    // Yearly series for AreaChart
    const series = [];
    for (let y = 0; y <= t; y++) {
      const p = n * y;
      const lump = starting * Math.pow(1 + periodicRate, p);
      const contrib = monthlyContriPerPeriod > 0 && periodicRate > 0
        ? monthlyContriPerPeriod * ((Math.pow(1 + periodicRate, p) - 1) / periodicRate)
        : monthlyContriPerPeriod * p;
      series.push({ label: `Yr ${y}`, value: lump + contrib });
    }

    return { finalValue, totalContributed, growth, realValue, series };
  }, [starting, monthlyContri, annualReturn, years, inflation, compounding]);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Projected Value</span>
          <div className="ps-hero-value" style={{ color: '#8B5CF6' }}>{fmt(calc.finalValue)}</div>
          <div className="ps-hero-sub">In {years} years</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Real Purchasing Power</span><div className="ps-stat-value">{fmt(calc.realValue)}</div><div className="ps-stat-sub">adj. for {inflation}% inflation</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Total Contributions</span><div className="ps-stat-value">{fmt(calc.totalContributed)}</div><div className="ps-stat-sub">{pct(calc.totalContributed / calc.finalValue * 100 || 0, 1)} of total</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Compound Growth</span><div className="ps-stat-value" style={{ color: '#10B981' }}>{fmt(calc.growth)}</div><div className="ps-stat-sub">{pct(calc.growth / calc.finalValue * 100 || 0, 1)} of total</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Assumptions</span></div>
            <DualField label="Starting Balance" hint={fmt(starting)} value={starting} onChange={setStarting} min={0} max={5000000} step={1000} />
            <DualField label="Monthly Contribution" hint={fmt(monthlyContri)} value={monthlyContri} onChange={setMonthlyContri} min={0} max={20000} step={50} />
            <DualField label="Annual Return (%)" hint={pct(annualReturn, 1)} value={annualReturn} onChange={setAnnualReturn} min={-5} max={20} step={0.1} suffix="%" />
            <DualField label="Time Span (years)" hint={`${years} yrs`} value={years} onChange={setYears} min={1} max={50} step={1} suffix="y" />
            <DualField label="Inflation (%)" hint={pct(inflation, 1)} value={inflation} onChange={setInflation} min={0} max={10} step={0.1} suffix="%" />
            <div className="ps-field">
              <label className="ps-field-label"><span>Compounding Frequency</span></label>
              <Seg value={compounding} onChange={setCompounding} options={[
                { value: 'daily', label: 'Daily' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }
              ]} />
            </div>
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Growth Trajectory</div><div className="ps-receipt-title">Compound Horizon Chart</div></div>
              <span className="ps-receipt-badge">{annualReturn}% return · {years}y</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1.25rem' }}>
              <AreaChart data={calc.series} height={300} color="#8B5CF6" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. FIRE
   ═══════════════════════════════════════════════════════════ */
function FireCalc() {
  const [annualExp, setAnnualExp] = useState(80000);
  const [withdrawal, setWithdrawal] = useState(4);
  const [currentAssets, setCurrentAssets] = useState(0);

  const calc = useMemo(() => {
    const target = annualExp / (withdrawal / 100);
    const progress = target > 0 ? Math.min(100, (currentAssets / target) * 100) : 0;
    return { target, progress };
  }, [annualExp, withdrawal, currentAssets]);

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Target FIRE Corpus</span>
          <div className="ps-hero-value" style={{ color: '#EC4899' }}>{fmt(calc.target)}</div>
          <div className="ps-hero-sub">Based on {withdrawal}% SWR</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Current Progress</span><div className="ps-stat-value">{pct(calc.progress, 1)}</div><div className="ps-stat-sub">funded</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Current Assets</span><div className="ps-stat-value">{fmt(currentAssets)}</div><div className="ps-stat-sub">saved</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Remaining</span><div className="ps-stat-value">{fmt(Math.max(0, calc.target - currentAssets))}</div><div className="ps-stat-sub">to financial independence</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Assumptions</span></div>
            <DualField label="Annual Expenses" hint={fmt(annualExp)} value={annualExp} onChange={setAnnualExp} min={0} max={500000} step={1000} />
            <DualField label="Withdrawal Rate (%)" hint={pct(withdrawal, 1)} value={withdrawal} onChange={setWithdrawal} min={1} max={10} step={0.1} suffix="%" />
            <DualField label="Current Assets" hint={fmt(currentAssets)} value={currentAssets} onChange={setCurrentAssets} min={0} max={10000000} step={5000} />
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">FIRE Milestones</div><div className="ps-receipt-title">Progress &amp; Corpus Breakdown</div></div>
              <span className="ps-receipt-badge">{withdrawal}% rule</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1.35rem' }}>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[var(--text-2)]">Progress to Financial Independence</span>
                    <span className="text-pink-400">{pct(calc.progress, 1)}</span>
                  </div>
                  <div className="w-full bg-[var(--surface-3)] h-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500" style={{ width: calc.progress + '%' }} />
                  </div>
                </div>
                <table className="ps-receipt-table"><tbody>
                  <tr className="ps-receipt-row"><td>Annual Expenses</td><td>{fmt(annualExp)}</td></tr>
                  <tr className="ps-receipt-row"><td>Safe Withdrawal Rate</td><td>{pct(withdrawal, 1)}</td></tr>
                  <tr className="ps-receipt-row"><td>Target FIRE Corpus</td><td>{fmt(calc.target)}</td></tr>
                  <tr className="ps-receipt-row"><td>Current Assets</td><td>{fmt(currentAssets)}</td></tr>
                  <tr className="ps-receipt-net"><td>Remaining Gap</td><td>{fmt(Math.max(0, calc.target - currentAssets))}</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. EMERGENCY FUND
   ═══════════════════════════════════════════════════════════ */
function EmergencyCalc() {
  const [monthly, setMonthly] = useState(5000);
  const [months, setMonths] = useState(6);
  const target = monthly * months;

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Target Reserve</span>
          <div className="ps-hero-value" style={{ color: '#10B981' }}>{fmt(target)}</div>
          <div className="ps-hero-sub">{months}-month safety runway</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Monthly Expenses</span><div className="ps-stat-value">{fmt(monthly)}</div><div className="ps-stat-sub">baseline</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Runway</span><div className="ps-stat-value">{months} mos</div><div className="ps-stat-sub">recommended 3-6m</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Daily Burn</span><div className="ps-stat-value">{fmt(monthly / 30, 2)}</div><div className="ps-stat-sub">per day</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Emergency Fund Inputs</span></div>
            <DualField label="Monthly Expenses" hint={fmt(monthly)} value={monthly} onChange={setMonthly} min={0} max={50000} step={100} />
            <div className="ps-field">
              <label className="ps-field-label"><span>Runway Target (Months)</span></label>
              <Seg value={months} onChange={setMonths} options={[
                { value: 3, label: '3 mo' }, { value: 6, label: '6 mo' }, { value: 9, label: '9 mo' }, { value: 12, label: '12 mo' }
              ]} />
            </div>
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Safety Analysis</div><div className="ps-receipt-title">Liquidity Breakdown</div></div>
              <span className="ps-receipt-badge">SECURE</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1.35rem' }}>
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-row"><td>Monthly Burn</td><td>{fmt(monthly)}</td></tr>
                <tr className="ps-receipt-row"><td>Runway Length</td><td>{months} months</td></tr>
                <tr className="ps-receipt-row"><td>Quarterly Equivalent</td><td>{fmt(monthly * 3)}</td></tr>
                <tr className="ps-receipt-row"><td>Annual Equivalent</td><td>{fmt(monthly * 12)}</td></tr>
                <tr className="ps-receipt-net"><td>Target Reserve</td><td>{fmt(target)}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. INFLATION
   ═══════════════════════════════════════════════════════════ */
function InflationCalc() {
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(20);
  const [amount, setAmount] = useState(100000);

  const realValue = amount / Math.pow(1 + rate / 100, years);
  const checkpoints = [5, 10, 20, 30].map((y) => ({
    years: y,
    value: amount / Math.pow(1 + rate / 100, y),
  }));

  return (
    <>
      <div className="ps-hero">
        <div className="ps-hero-main">
          <span className="ps-hero-label">Real Purchasing Power</span>
          <div className="ps-hero-value" style={{ color: '#F59E0B' }}>{fmt(realValue)}</div>
          <div className="ps-hero-sub">After {years} years at {rate}% inflation</div>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-stat"><span className="ps-stat-label">Initial Amount</span><div className="ps-stat-value">{fmt(amount)}</div><div className="ps-stat-sub">today</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Loss of Value</span><div className="ps-stat-value" style={{ color: '#EF4444' }}>{pct((amount - realValue) / amount * 100, 1)}</div><div className="ps-stat-sub">eroded</div></div>
          <div className="ps-stat"><span className="ps-stat-label">Horizon</span><div className="ps-stat-value">{years} yrs</div><div className="ps-stat-sub">compounded</div></div>
        </div>
      </div>

      <div className="ps-layout">
        <div className="ps-controls">
          <div className="ps-block">
            <div className="ps-block-head"><span className="ps-block-label">Assumptions</span></div>
            <DualField label="Starting Amount" hint={fmt(amount)} value={amount} onChange={setAmount} min={0} max={2000000} step={1000} />
            <DualField label="Inflation Rate (%)" hint={pct(rate, 1)} value={rate} onChange={setRate} min={0.5} max={10} step={0.1} suffix="%" />
            <DualField label="Time Horizon (years)" hint={`${years} yrs`} value={years} onChange={setYears} min={1} max={50} step={1} suffix="y" />
          </div>
        </div>

        <div className="ps-receipt-wrap">
          <div className="ps-receipt">
            <div className="ps-receipt-head">
              <div><div className="ps-receipt-eyebrow">Inflation Timeline</div><div className="ps-receipt-title">Checkpoint Breakdown</div></div>
              <span className="ps-receipt-badge">{rate}% inflation</span>
            </div>
            <div className="ps-receipt-body" style={{ padding: '1.35rem' }}>
              <table className="ps-receipt-table"><tbody>
                <tr className="ps-receipt-section"><td colSpan={2}>Checkpoints</td></tr>
                {checkpoints.map((c) => (
                  <tr key={c.years} className="ps-receipt-row"><td>At {c.years} years</td><td>{fmt(c.value)}</td></tr>
                ))}
                <tr className="ps-receipt-net"><td>Final Real Value</td><td>{fmt(realValue)}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   9. INSIGHTS (placeholder)
   ═══════════════════════════════════════════════════════════ */
function InsightsCalc() {
  return (
    <div className="surface p-5 lg:p-6">
      <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '2rem' }}>
        ⚠️ The <b>Texas Accelerator</b> and <b>Macro Matrix</b> containers are populated by JS in your main app.<br />
        Paste the corresponding JS module and I'll wire it into this component.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN BLUEPRINT TAB
   ═══════════════════════════════════════════════════════════ */
const PANES = {
  paycheck: PaycheckCalc,
  rule72: Rule72Calc,
  mortgage: MortgageCalc,
  vehicle: VehicleCalc,
  projections: ProjectionsCalc,
  fire: FireCalc,
  emergency: EmergencyCalc,
  inflation: InflationCalc,
  insights: InsightsCalc,
};

export function BlueprintTab() {
  const [active, setActive] = useState(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    if (parts[1] === 'blueprint' && parts[2] && PANES[parts[2]]) {
      return parts[2];
    }
    return localStorage.getItem('ew_active_blueprint_subtab') || 'paycheck';
  });
  const ActivePane = PANES[active];
  const tabsRef = useRef(null);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(true);

  const handleSetActive = (key) => {
    setActive(key);
    try {
      localStorage.setItem('ew_active_blueprint_subtab', key);
      window.history.pushState({ subtab: key }, '', `/blueprint/${key}`);
    } catch (e) {}
  };

  useEffect(() => {
    const handlePop = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      if (parts[1] === 'blueprint' && parts[2] && PANES[parts[2]]) {
        setActive(parts[2]);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftChevron(scrollLeft > 6);
      setShowRightChevron(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  };

  return (
    <div id="tab-blueprint" className="main-tab-content space-y-6">
      <div className="main-content-blur space-y-6">
        {/* Section Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              FINANCIAL BLUEPRINT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-1)] mt-1.5">
              Advanced Calculators & Simulators
            </h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Model paychecks, compound growth, mortgages, FIRE targets, and tax impact with institutional precision.
            </p>
          </div>
        </div>

        <div className="relative flex items-center">
          {/* Left Scroll Button */}
          <button
            onClick={() => scrollTabs('left')}
            className={`absolute left-1 z-10 p-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] shadow-md flex items-center justify-center cursor-pointer backdrop-blur-md transition-opacity duration-200 ${
              showLeftChevron ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabsRef}
            onScroll={checkScroll}
            className="wb-tabs flex-1 overflow-x-auto scroll-smooth flex items-center gap-1.5 px-8 sm:px-10"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`wb-tab${active === t.key ? ' active' : ''}`}
                onClick={() => handleSetActive(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scrollTabs('right')}
            className={`absolute right-1 z-10 p-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] shadow-md flex items-center justify-center cursor-pointer backdrop-blur-md transition-opacity duration-200 ${
              showRightChevron ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="wb-content mt-6">
          <div className="wb-pane active">
            <ActivePane />
          </div>
        </div>
      </div>
    </div>
  );
}