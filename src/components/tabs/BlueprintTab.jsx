import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const BlueprintTab = () => {
  const { formatMoney } = useApp();

  // FIRE Calculator State
  const [annualSpend, setAnnualSpend] = useState(80000);
  const [swr, setSwr] = useState(4.0); // Safe withdrawal rate (%)
  const [currentNestEgg, setCurrentNestEgg] = useState(421868);
  const [monthlySavings, setMonthlySavings] = useState(3500);
  const [expectedReturn, setExpectedReturn] = useState(8.0); // % annual growth

  const targetFireNumber = annualSpend / (swr / 100);
  const fireGap = Math.max(0, targetFireNumber - currentNestEgg);
  const progressPct = Math.min(100, Math.round((currentNestEgg / targetFireNumber) * 100));

  // Estimate years to FIRE using logarithmic compound formula
  const r = expectedReturn / 100 / 12;
  const pmt = monthlySavings;
  const pv = currentNestEgg;
  const fv = targetFireNumber;
  let yearsToFire = 12;

  try {
    if (r > 0 && pmt > 0 && fv > pv) {
      const nMonths = Math.log((fv * r + pmt) / (pv * r + pmt)) / Math.log(1 + r);
      yearsToFire = Math.max(1, Math.round(nMonths / 12));
    }
  } catch (e) {
    yearsToFire = 12;
  }

  // Mortgage Calculator State
  const [homePrice, setHomePrice] = useState(650000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const loanAmount = homePrice * (1 - downPaymentPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const monthlyPAndI =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">
          Financial Blueprint & Calculators
        </h2>
        <p className="text-xs text-[var(--text-3)]">
          FIRE projection models, compound interest simulators, and mortgage amortization tools.
        </p>
      </div>

      {/* FIRE Top Target Card */}
      <div className="card p-6 bg-gradient-to-br from-purple-500/15 via-[var(--surface)] to-[var(--surface)] border-purple-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              FIRE Number (4% Rule)
            </span>
            <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
              {formatMoney(targetFireNumber, 0)}
            </div>
            <p className="text-xs text-[var(--text-3)] mt-1">
              Provides {formatMoney(annualSpend)}/year in passive perpetual retirement cashflow.
            </p>
          </div>

          <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-3 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Current Progress</span>
              <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">{progressPct}%</p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Est. Years to Freedom</span>
              <p className="text-xl font-black font-mono text-purple-400 mt-0.5">{yearsToFire} Yrs</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* FIRE Parameters Input Grid */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          FIRE Model Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Desired Annual Spend in Retirement ($)
            </label>
            <input
              type="number"
              value={annualSpend}
              onChange={(e) => setAnnualSpend(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Safe Withdrawal Rate (SWR %)
            </label>
            <input
              type="number"
              step="0.1"
              value={swr}
              onChange={(e) => setSwr(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Monthly Portfolio Addition ($)
            </label>
            <input
              type="number"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Expected Annual Return (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Mortgage Amortization Calculator */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">
              Fixed-Rate Mortgage Amortization
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              Calculate principal & interest obligations for luxury primary or investment properties.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">Monthly P&I Payment</span>
            <p className="text-xl font-black font-mono text-emerald-400">
              {formatMoney(monthlyPAndI, 2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Purchase Price ($)
            </label>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Down Payment (%)
            </label>
            <input
              type="number"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Mortgage Rate (%)
            </label>
            <input
              type="number"
              step="0.125"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Loan Term (Years)
            </label>
            <select
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
              className="input-field text-xs"
            >
              <option value="15">15-Year Fixed</option>
              <option value="30">30-Year Fixed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
