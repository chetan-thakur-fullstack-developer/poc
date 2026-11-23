import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const BlueprintTab = () => {
  const { formatMoney } = useApp();
  const [activeTool, setActiveTool] = useState('paycheck');

  // Tools Navigation Catalog
  const tools = [
    { id: 'paycheck', label: 'Paycheck', icon: '💵', desc: 'Take-home pay & tax withholdings' },
    { id: 'fire', label: 'Freedom (FIRE)', icon: '🔥', desc: '4% rule & retirement runway' },
    { id: 'mortgage', label: 'Mortgage', icon: '🏠', desc: 'Accelerated payoff & interest saved' },
    { id: 'rule72', label: 'Rule of 72', icon: '📐', desc: 'Doubling time & required return' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚗', desc: 'Lease vs buy 3-year analysis' },
    { id: 'emergency', label: 'Emergency', icon: '🛡️', desc: 'Liquidity runway & safety buffer' },
    { id: 'inflation', label: 'Inflation', icon: '📉', desc: 'Purchasing power erosion' },
    { id: 'projections', label: 'Growth', icon: '🚀', desc: 'Compound interest milestones' },
    { id: 'insights', label: 'Health Ratios', icon: '💡', desc: 'DTI, savings & liquidity health' }
  ];

  // 1. Paycheck State
  const [salary, setSalary] = useState(150000);
  const [payFreq, setPayFreq] = useState(26); // 26 bi-weekly, 12 monthly, 24 semi-monthly, 52 weekly
  const [filingStatus, setFilingStatus] = useState('mfj'); // 'single', 'mfj'
  const [k401Pct, setK401Pct] = useState(8);
  const [stateTaxPct, setStateTaxPct] = useState(4.5);

  const grossPerCheck = salary / payFreq;
  const k401PerCheck = grossPerCheck * (k401Pct / 100);
  const taxableFedCheck = Math.max(0, grossPerCheck - k401PerCheck);
  const fedTaxRate = filingStatus === 'mfj' ? 0.12 : 0.18;
  const fedTaxCheck = taxableFedCheck * fedTaxRate;
  const ssCheck = Math.min(grossPerCheck, 168600 / payFreq) * 0.062;
  const medCheck = grossPerCheck * 0.0145;
  const stateTaxCheck = taxableFedCheck * (stateTaxPct / 100);
  const totalDeductionsCheck = k401PerCheck + fedTaxCheck + ssCheck + medCheck + stateTaxCheck;
  const netTakeHomeCheck = Math.max(0, grossPerCheck - totalDeductionsCheck);
  const annualNet = netTakeHomeCheck * payFreq;
  const effectiveTaxRate = Math.round(((fedTaxCheck + ssCheck + medCheck + stateTaxCheck) / grossPerCheck) * 100);

  // 2. FIRE State
  const [fireAnnualSpend, setFireAnnualSpend] = useState(85000);
  const [swr, setSwr] = useState(4.0);
  const [currentNestEgg, setCurrentNestEgg] = useState(420000);
  const [fireMonthlySavings, setFireMonthlySavings] = useState(3800);
  const [fireReturnRate, setFireReturnRate] = useState(8.0);

  const fireTarget = fireAnnualSpend / (swr / 100);
  const fireProgressPct = Math.min(100, Math.round((currentNestEgg / fireTarget) * 100));
  const fireGap = Math.max(0, fireTarget - currentNestEgg);

  let yearsToFire = 12;
  try {
    const r = fireReturnRate / 100 / 12;
    const pmt = fireMonthlySavings;
    if (r > 0 && pmt > 0 && fireTarget > currentNestEgg) {
      const nMonths = Math.log((fireTarget * r + pmt) / (currentNestEgg * r + pmt)) / Math.log(1 + r);
      yearsToFire = Math.max(1, (nMonths / 12).toFixed(1));
    }
  } catch (_) {
    yearsToFire = 12;
  }

  // 3. Mortgage State
  const [homePrice, setHomePrice] = useState(650000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(30);
  const [extraMonthlyPrincipal, setExtraMonthlyPrincipal] = useState(400);

  const loanAmount = homePrice * (1 - downPaymentPct / 100);
  const monthlyMortgageRate = mortgageRate / 100 / 12;
  const totalMortgageMonths = loanYears * 12;
  const standardMonthlyPI = monthlyMortgageRate > 0
    ? (loanAmount * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalMortgageMonths))) /
      (Math.pow(1 + monthlyMortgageRate, totalMortgageMonths) - 1)
    : loanAmount / totalMortgageMonths;

  // Accelerated payoff estimation
  let totalInterestStandard = standardMonthlyPI * totalMortgageMonths - loanAmount;
  let acceleratedMonths = totalMortgageMonths;
  let totalInterestAccelerated = totalInterestStandard;

  if (extraMonthlyPrincipal > 0 && monthlyMortgageRate > 0) {
    let bal = loanAmount;
    let mCount = 0;
    let intSum = 0;
    while (bal > 0 && mCount < 600) {
      const intMonth = bal * monthlyMortgageRate;
      intSum += intMonth;
      const principalPayment = Math.min(bal, (standardMonthlyPI - intMonth) + extraMonthlyPrincipal);
      bal -= principalPayment;
      mCount++;
    }
    acceleratedMonths = mCount;
    totalInterestAccelerated = intSum;
  }
  const interestSaved = Math.max(0, totalInterestStandard - totalInterestAccelerated);
  const yearsSaved = ((totalMortgageMonths - acceleratedMonths) / 12).toFixed(1);

  // 4. Rule of 72 State
  const [rule72Rate, setRule72Rate] = useState(7.5);
  const [rule72Principal, setRule72Principal] = useState(100000);
  const yearsToDouble = (72 / Math.max(0.5, rule72Rate)).toFixed(1);

  // 5. Vehicle State
  const [vehiclePrice, setVehiclePrice] = useState(48000);
  const [vehicleDown, setVehicleDown] = useState(5000);
  const [monthlyLease, setMonthlyLease] = useState(550);
  const [financeMonths, setFinanceMonths] = useState(60);
  const [financeRate, setFinanceRate] = useState(6.0);

  const financeLoan = vehiclePrice - vehicleDown;
  const finMonthlyRate = financeRate / 100 / 12;
  const financeMonthlyPayment = finMonthlyRate > 0
    ? (financeLoan * (finMonthlyRate * Math.pow(1 + finMonthlyRate, financeMonths))) / (Math.pow(1 + finMonthlyRate, financeMonths) - 1)
    : financeLoan / financeMonths;
  const lease3YrTotal = vehicleDown + monthlyLease * 36;
  const buy3YrTotal = vehicleDown + financeMonthlyPayment * 36;
  const estimated3YrResaleValue = vehiclePrice * 0.58; // 58% retained value
  const remainingLoan3Yr = financeLoan * 0.44;
  const equityAt3Yrs = Math.max(0, estimated3YrResaleValue - remainingLoan3Yr);
  const netBuyCost3Yr = buy3YrTotal - equityAt3Yrs;

  // 6. Emergency Fund State
  const [liquidCash, setLiquidCash] = useState(38000);
  const [essentialExpenses, setEssentialExpenses] = useState(5200);
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState(2400);

  const runwayStrictMonths = (liquidCash / Math.max(1, essentialExpenses)).toFixed(1);
  const runwayStandardMonths = (liquidCash / Math.max(1, essentialExpenses + discretionaryExpenses)).toFixed(1);
  const targetEmergencyFund = essentialExpenses * 6;
  const emergencySurplusGap = liquidCash - targetEmergencyFund;

  // 7. Inflation State
  const [inflationCash, setInflationCash] = useState(100000);
  const [inflationRate, setInflationRate] = useState(3.5);

  const inflationPowerAt = (yrs) => {
    return Math.round(inflationCash / Math.pow(1 + inflationRate / 100, yrs));
  };

  // 8. Projections State
  const [projInitial, setProjInitial] = useState(50000);
  const [projMonthly, setProjMonthly] = useState(1500);
  const [projRate, setProjRate] = useState(8.5);

  const calculateFutureValue = (years) => {
    const r = projRate / 100 / 12;
    const n = years * 12;
    const fvInitial = projInitial * Math.pow(1 + r, n);
    const fvAnnuity = r > 0 ? projMonthly * ((Math.pow(1 + r, n) - 1) / r) : projMonthly * n;
    return Math.round(fvInitial + fvAnnuity);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">
          Financial Blueprint & Calculators
        </h2>
        <p className="text-xs text-[var(--text-3)]">
          Executive modeling suite: paycheck withholding, FIRE runway, accelerated mortgages, Rule of 72, and inflation simulators.
        </p>
      </div>

      {/* Sub-tool Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] border border-[var(--border)]'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. PAYCHECK CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'paycheck' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Highlight Summary Card */}
          <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Net Pay Per Check</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(netTakeHomeCheck, 2)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Direct deposit take-home</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Annual Take-Home</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatMoney(annualNet, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">After taxes & 401(k)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">401(k) / Paycheck</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {formatMoney(k401PerCheck, 2)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">{k401Pct}% pre-tax savings</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Effective Tax Rate</span>
                <div className="text-2xl font-black font-mono text-blue-400 mt-1">
                  {effectiveTaxRate}%
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Fed + FICA + State</p>
              </div>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Salary & Frequency</h3>
              <div>
                <label className="field-label">Annual Gross Salary: {formatMoney(salary)}</label>
                <input
                  type="range"
                  min="40000"
                  max="400000"
                  step="5000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Pay Frequency</label>
                  <select
                    value={payFreq}
                    onChange={(e) => setPayFreq(Number(e.target.value))}
                    className="input"
                  >
                    <option value={26}>Bi-Weekly (26/yr)</option>
                    <option value={24}>Semi-Monthly (24/yr)</option>
                    <option value={12}>Monthly (12/yr)</option>
                    <option value={52}>Weekly (52/yr)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Filing Status</label>
                  <select
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value)}
                    className="input"
                  >
                    <option value="mfj">Married Filing Jointly</option>
                    <option value="single">Single</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Pre-Tax Deductions & State Tax</h3>
              <div>
                <label className="field-label">401(k) Pre-Tax Contribution: {k401Pct}%</label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={k401Pct}
                  onChange={(e) => setK401Pct(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="field-label">State Income Tax Rate: {stateTaxPct}%</label>
                <input
                  type="range"
                  min="0"
                  max="13"
                  step="0.5"
                  value={stateTaxPct}
                  onChange={(e) => setStateTaxPct(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              {/* Paycheck breakdown items */}
              <div className="pt-2 border-t border-[var(--border)] text-xs space-y-1.5 text-[var(--text-2)]">
                <div className="flex justify-between">
                  <span>Gross Paycheck:</span>
                  <span className="font-mono font-bold text-[var(--text-1)]">{formatMoney(grossPerCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>- 401(k) Retirement:</span>
                  <span className="font-mono">-{formatMoney(k401PerCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- Federal Withholding:</span>
                  <span className="font-mono">-{formatMoney(fedTaxCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- FICA (Social Security & Medicare):</span>
                  <span className="font-mono">-{formatMoney(ssCheck + medCheck, 2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- State Tax:</span>
                  <span className="font-mono">-{formatMoney(stateTaxCheck, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FREEDOM / FIRE CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'fire' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-purple-500/15 via-[var(--surface)] to-[var(--surface)] border-purple-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Target FIRE Number</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(fireTarget, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Supports {formatMoney(fireAnnualSpend)}/year living expenses perpetual cashflow at {swr}% SWR.
                </p>
              </div>
              <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-3 sm:pt-0 sm:pl-6">
                <div>
                  <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Current Progress</span>
                  <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">{fireProgressPct}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Years to Freedom</span>
                  <p className="text-xl font-black font-mono text-purple-400 mt-0.5">{yearsToFire} Yrs</p>
                </div>
              </div>
            </div>

            <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden mt-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${fireProgressPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Expenses & Withdrawal</h3>
              <div>
                <label className="field-label">Target Annual Spend in Retirement: {formatMoney(fireAnnualSpend)}</label>
                <input
                  type="range"
                  min="40000"
                  max="200000"
                  step="5000"
                  value={fireAnnualSpend}
                  onChange={(e) => setFireAnnualSpend(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="field-label">Safe Withdrawal Rate (SWR): {swr}%</label>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={swr}
                  onChange={(e) => setSwr(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-[11px] text-[var(--text-3)]">The classic Trinity 4% rule provides 30+ year safety.</span>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Current Portfolio & Savings</h3>
              <div>
                <label className="field-label">Current Invested Assets: {formatMoney(currentNestEgg)}</label>
                <input
                  type="range"
                  min="10000"
                  max="1500000"
                  step="25000"
                  value={currentNestEgg}
                  onChange={(e) => setCurrentNestEgg(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="field-label">Monthly Savings & Investments: {formatMoney(fireMonthlySavings)}/mo</label>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={fireMonthlySavings}
                  onChange={(e) => setFireMonthlySavings(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text-2)] flex justify-between">
                <span>Remaining Gap to Target:</span>
                <span className="font-mono font-bold text-purple-400">{formatMoney(fireGap)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ACCELERATED MORTGAGE CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'mortgage' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-blue-500/15 via-[var(--surface)] to-[var(--surface)] border-blue-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Monthly P&I Payment</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(standardMonthlyPI + extraMonthlyPrincipal, 2)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Includes +{formatMoney(extraMonthlyPrincipal)} extra principal</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Interest Saved</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatMoney(interestSaved, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Kept in your pocket</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Time Saved Off Loan</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {yearsSaved} Years
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Accelerated freedom date</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Loan Amount</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(loanAmount, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">{downPaymentPct}% down payment</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Property & Loan Details</h3>
              <div>
                <label className="field-label">Home Purchase Price: {formatMoney(homePrice)}</label>
                <input
                  type="range"
                  min="200000"
                  max="1500000"
                  step="25000"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Down Payment: {downPaymentPct}%</label>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="field-label">Interest Rate: {mortgageRate}%</label>
                  <input
                    type="range"
                    min="3.0"
                    max="9.0"
                    step="0.1"
                    value={mortgageRate}
                    onChange={(e) => setMortgageRate(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Accelerated Extra Principal Payoff</h3>
              <div>
                <label className="field-label">Extra Monthly Principal: {formatMoney(extraMonthlyPrincipal)}/mo</label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={extraMonthlyPrincipal}
                  onChange={(e) => setExtraMonthlyPrincipal(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)] text-xs space-y-2 text-[var(--text-2)]">
                <div className="flex justify-between">
                  <span>Standard Term:</span>
                  <span className="font-mono text-[var(--text-1)]">{loanYears} Years (360 months)</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Accelerated Payoff:</span>
                  <span className="font-mono">{(acceleratedMonths / 12).toFixed(1)} Years ({acceleratedMonths} months)</span>
                </div>
                <div className="flex justify-between text-purple-400 font-bold">
                  <span>Total Interest Saved:</span>
                  <span className="font-mono">{formatMoney(interestSaved)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. RULE OF 72 CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'rule72' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-amber-500/15 via-[var(--surface)] to-[var(--surface)] border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Rule of 72 Doubling Time</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
                  {yearsToDouble} Years
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  At a {rule72Rate}% annual return, your money doubles every {yearsToDouble} years without adding a dime.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-right">
                <span className="text-[10px] font-bold text-[var(--text-3)] uppercase">4 Doublings Horizon</span>
                <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {formatMoney(rule72Principal * 16)}
                </p>
                <span className="text-[10px] text-[var(--text-3)]">in {(yearsToDouble * 4).toFixed(0)} years</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Parameters</h3>
              <div>
                <label className="field-label">Annual Expected Return Rate: {rule72Rate}%</label>
                <input
                  type="range"
                  min="2"
                  max="18"
                  step="0.5"
                  value={rule72Rate}
                  onChange={(e) => setRule72Rate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="field-label">Current Starting Sum: {formatMoney(rule72Principal)}</label>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={rule72Principal}
                  onChange={(e) => setRule72Principal(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Compound Doubling Timeline</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] flex justify-between items-center">
                  <span>Year 0 (Today):</span>
                  <span className="font-mono font-bold text-[var(--text-1)]">{formatMoney(rule72Principal)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] flex justify-between items-center text-emerald-400">
                  <span>Year {yearsToDouble} (1st Double):</span>
                  <span className="font-mono font-bold">{formatMoney(rule72Principal * 2)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] flex justify-between items-center text-emerald-400">
                  <span>Year {(yearsToDouble * 2).toFixed(1)} (2nd Double):</span>
                  <span className="font-mono font-bold">{formatMoney(rule72Principal * 4)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] flex justify-between items-center text-purple-400">
                  <span>Year {(yearsToDouble * 3).toFixed(1)} (3rd Double):</span>
                  <span className="font-mono font-bold">{formatMoney(rule72Principal * 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. VEHICLE LEASE VS BUY CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'vehicle' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-teal-500/15 via-[var(--surface)] to-[var(--surface)] border-teal-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">3-Year Lease Total Cost</span>
                <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                  {formatMoney(lease3YrTotal, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">$0 equity at end of lease</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">3-Year Buy Net Cost</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatMoney(netBuyCost3Yr, 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Factoring +{formatMoney(equityAt3Yrs)} equity built</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Financial Advantage</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {formatMoney(Math.abs(lease3YrTotal - netBuyCost3Yr), 0)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  {netBuyCost3Yr < lease3YrTotal ? 'Buying builds more wealth' : 'Leasing is more flexible'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Vehicle & Lease Options</h3>
              <div>
                <label className="field-label">Vehicle MSRP / Sale Price: {formatMoney(vehiclePrice)}</label>
                <input
                  type="range"
                  min="20000"
                  max="120000"
                  step="2500"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Down Payment</label>
                  <input
                    type="number"
                    value={vehicleDown}
                    onChange={(e) => setVehicleDown(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label">Monthly Lease Quote</label>
                  <input
                    type="number"
                    value={monthlyLease}
                    onChange={(e) => setMonthlyLease(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Loan Purchase Terms</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Loan Term (Months)</label>
                  <select
                    value={financeMonths}
                    onChange={(e) => setFinanceMonths(Number(e.target.value))}
                    className="input"
                  >
                    <option value={48}>48 Months</option>
                    <option value={60}>60 Months</option>
                    <option value={72}>72 Months</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Loan Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={financeRate}
                    onChange={(e) => setFinanceRate(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)] text-xs space-y-2 text-[var(--text-2)]">
                <div className="flex justify-between">
                  <span>Calculated Monthly Finance Payment:</span>
                  <span className="font-mono font-bold text-[var(--text-1)]">{formatMoney(financeMonthlyPayment, 2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Estimated Residual Value (Year 3):</span>
                  <span className="font-mono font-bold">{formatMoney(estimated3YrResaleValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. EMERGENCY FUND RUNWAY CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'emergency' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-indigo-500/15 via-[var(--surface)] to-[var(--surface)] border-indigo-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Strict Runway (Essentials)</span>
                <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
                  {runwayStrictMonths} Months
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Covers housing, food, utilities, health</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Standard Runway (Full Spend)</span>
                <div className="text-2xl font-black font-mono text-indigo-300 mt-1">
                  {runwayStandardMonths} Months
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Includes lifestyle & discretionary</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">6-Month Buffer Target</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatMoney(targetEmergencyFund)}
                </div>
                <p className="text-xs text-emerald-400 mt-1">
                  {emergencySurplusGap >= 0 ? `Surplus: +${formatMoney(emergencySurplusGap)}` : `Gap: -${formatMoney(Math.abs(emergencySurplusGap))}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Liquid Cash Reserves</h3>
              <div>
                <label className="field-label">Checking, Savings & Money Market: {formatMoney(liquidCash)}</label>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="2500"
                  value={liquidCash}
                  onChange={(e) => setLiquidCash(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Monthly Burn Rate</h3>
              <div>
                <label className="field-label">Essential Monthly Expenses: {formatMoney(essentialExpenses)}/mo</label>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="250"
                  value={essentialExpenses}
                  onChange={(e) => setEssentialExpenses(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <label className="field-label">Discretionary Monthly Expenses: {formatMoney(discretionaryExpenses)}/mo</label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={discretionaryExpenses}
                  onChange={(e) => setDiscretionaryExpenses(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. INFLATION CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'inflation' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-rose-500/15 via-[var(--surface)] to-[var(--surface)] border-rose-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Purchasing Power in 10 Yrs</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(inflationPowerAt(10))}
                </div>
                <p className="text-xs text-rose-400 mt-1">-{(100 - (inflationPowerAt(10) / inflationCash) * 100).toFixed(0)}% purchasing loss</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">In 20 Years</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(inflationPowerAt(20))}
                </div>
                <p className="text-xs text-rose-400 mt-1">-{(100 - (inflationPowerAt(20) / inflationCash) * 100).toFixed(0)}% purchasing loss</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">In 30 Years</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(inflationPowerAt(30))}
                </div>
                <p className="text-xs text-rose-400 mt-1">-{(100 - (inflationPowerAt(30) / inflationCash) * 100).toFixed(0)}% purchasing loss</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Inflation Rate</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                  {inflationRate}% / Year
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Compounding annual headwind</p>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Simulation Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Current Cash Amount: {formatMoney(inflationCash)}</label>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="25000"
                  value={inflationCash}
                  onChange={(e) => setInflationCash(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <label className="field-label">Annual Inflation Rate: {inflationRate}%</label>
                <input
                  type="range"
                  min="1.5"
                  max="8.0"
                  step="0.25"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. COMPOUND GROWTH PROJECTIONS
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'projections' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">10-Year Horizon</span>
                <div className="text-2xl font-black font-mono text-[var(--text-1)] mt-1">
                  {formatMoney(calculateFutureValue(10))}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Total projected wealth</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">20-Year Horizon</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatMoney(calculateFutureValue(20))}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Compound acceleration</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">30-Year Horizon</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {formatMoney(calculateFutureValue(30))}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">Long-term wealth creation</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Monthly Contribution</span>
                <div className="text-2xl font-black font-mono text-blue-400 mt-1">
                  {formatMoney(projMonthly)}
                </div>
                <p className="text-xs text-[var(--text-3)] mt-1">@ {projRate}% annualized</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Starting Principal & Monthly Savings</h3>
              <div>
                <label className="field-label">Initial Balance: {formatMoney(projInitial)}</label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  value={projInitial}
                  onChange={(e) => setProjInitial(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="field-label">Monthly Investment: {formatMoney(projMonthly)}/mo</label>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="200"
                  value={projMonthly}
                  onChange={(e) => setProjMonthly(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-1)]">Expected Return Rate</h3>
              <div>
                <label className="field-label">Annualized Return: {projRate}%</label>
                <input
                  type="range"
                  min="4.0"
                  max="14.0"
                  step="0.5"
                  value={projRate}
                  onChange={(e) => setProjRate(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text-2)] space-y-1">
                <p>• Historical S&P 500 average return has been ~10% before inflation.</p>
                <p>• Diversified index portfolios typically model 7% to 9%.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. FINANCIAL HEALTH RATIOS & DIAGNOSTICS
          ───────────────────────────────────────────────────────────── */}
      {activeTool === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Savings Rate</span>
              <span className="badge badge-emerald">Excellent</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">32.4%</div>
            <p className="text-xs text-[var(--text-3)]">
              Percentage of gross income saved & invested. Aim for &gt;20% for rapid wealth accumulation.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Housing Cost Ratio</span>
              <span className="badge badge-blue">Optimal</span>
            </div>
            <div className="text-2xl font-black font-mono text-blue-400">22.8%</div>
            <p className="text-xs text-[var(--text-3)]">
              Housing cost vs gross income. Below the traditional 28% front-end debt limit.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Debt-to-Income (DTI)</span>
              <span className="badge badge-emerald">Healthy</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">26.1%</div>
            <p className="text-xs text-[var(--text-3)]">
              Total monthly debt payments vs gross income. Healthy benchmark is &lt;36%.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Liquidity Ratio</span>
              <span className="badge badge-purple">Fortified</span>
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">7.3 Months</div>
            <p className="text-xs text-[var(--text-3)]">
              Cash reserves divided by monthly essential burn rate. 6+ months is fortified.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Net Worth Velocity</span>
              <span className="badge badge-emerald">+14.8% YoY</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">+$62,400</div>
            <p className="text-xs text-[var(--text-3)]">
              Net balance appreciation and new capital injected over the trailing 12 months.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-2)]">Investment Allocation</span>
              <span className="badge badge-blue">Growth 85/15</span>
            </div>
            <div className="text-2xl font-black font-mono text-[var(--text-1)]">85% Equities</div>
            <p className="text-xs text-[var(--text-3)]">
              Equities vs fixed income ratio aligned with prime wealth accumulation phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
