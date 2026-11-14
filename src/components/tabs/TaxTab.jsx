import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const TaxTab = () => {
  const { formatMoney } = useApp();

  const [salary, setSalary] = useState(195000);
  const [taxBracket, setTaxBracket] = useState(24);
  const [stateTax, setStateTax] = useState(5);
  const [k401Contrib, setK401Contrib] = useState(24500);
  const [hsaContrib, setHsaContrib] = useState(4400);

  const combinedTaxRate = (taxBracket + stateTax) / 100;
  const k401TaxSavings = k401Contrib * combinedTaxRate;
  const hsaTaxSavings = hsaContrib * (combinedTaxRate + 0.0765); // Includes FICA savings
  const totalTaxSavings = k401TaxSavings + hsaTaxSavings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">Tax Planning & Optimization</h2>
        <p className="text-xs text-[var(--text-3)]">
          Maximize pre-tax 401(k), HSA triple-tax advantages, and minimize federal/state liabilities.
        </p>
      </div>

      {/* Tax Savings Summary Card */}
      <div className="card p-6 bg-gradient-to-br from-emerald-500/15 via-[var(--surface)] to-[var(--surface)] border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Annual Tax Shield
            </span>
            <div className="text-3xl font-black font-mono text-[var(--text-1)] mt-1">
              {formatMoney(totalTaxSavings, 2)}
            </div>
            <p className="text-xs text-[var(--text-3)] mt-1">
              Immediate money kept in your pocket this tax year from pre-tax contributions.
            </p>
          </div>

          <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-3 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">401(k) Savings</span>
              <p className="text-base font-black font-mono text-emerald-400 mt-0.5">
                {formatMoney(k401TaxSavings, 0)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">HSA + FICA Savings</span>
              <p className="text-base font-black font-mono text-teal-400 mt-0.5">
                {formatMoney(hsaTaxSavings, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tax Calculator */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          Interactive Tax Shield Simulator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Annual Salary ($)
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Federal Marginal Bracket (%)
            </label>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value))}
              className="input-field text-xs font-semibold"
            >
              <option value="12">12% Federal</option>
              <option value="22">22% Federal</option>
              <option value="24">24% Federal (Executive Tier)</option>
              <option value="32">32% Federal</option>
              <option value="35">35% Federal</option>
              <option value="37">37% Federal</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              State Tax Rate (%)
            </label>
            <input
              type="number"
              value={stateTax}
              onChange={(e) => setStateTax(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              401(k) Pre-tax Contribution ($)
            </label>
            <input
              type="number"
              value={k401Contrib}
              onChange={(e) => setK401Contrib(Number(e.target.value) || 0)}
              className="input-field text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Account Type Tax Advantaged Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-inner p-4 space-y-2">
          <span className="text-xs font-bold text-purple-400">401(k) & Traditional IRA</span>
          <p className="text-xs text-[var(--text-2)]">
            Tax-deferred growth. Lowers your current adjusted gross income (AGI) immediately.
          </p>
        </div>
        <div className="card-inner p-4 space-y-2">
          <span className="text-xs font-bold text-pink-400">Roth IRA & Roth 401(k)</span>
          <p className="text-xs text-[var(--text-2)]">
            Funded with after-tax dollars. All compounding growth and withdrawals in retirement are 100% tax-free.
          </p>
        </div>
        <div className="card-inner p-4 space-y-2">
          <span className="text-xs font-bold text-blue-400">Health Savings Account (HSA)</span>
          <p className="text-xs text-[var(--text-2)]">
            Triple tax advantage: tax-deductible contributions, tax-free investment growth, and tax-free medical withdrawals.
          </p>
        </div>
      </div>
    </div>
  );
};
