import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const CreditTab = () => {
  const { expensesData, formatMoney } = useApp();
  const [score] = useState(782);
  const [extraPayment, setExtraPayment] = useState(500);

  const cards = expensesData?.cards || [];
  const totalLimit = cards.reduce((sum, c) => sum + (Number(c.limit) || 0), 0);
  const totalBalance = 2384; // Demo credit balance
  const utilizationPct = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 3;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">

      {/* Credit Score Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credit Score Card */}
        <div className="card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-3)]">
            <span className="font-semibold uppercase tracking-wider">VantageScore 3.0</span>
            <span className="text-emerald-400 font-bold">Excellent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-400 font-mono">{score}</span>
            <span className="text-xs text-[var(--text-3)]">/ 850</span>
          </div>
          <p className="text-[11px] text-[var(--text-3)]">
            Updated today from TransUnion & Equifax bureaus
          </p>
        </div>

        {/* Utilization Ratio Card */}
        <div className="card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-3)]">
            <span className="font-semibold uppercase tracking-wider">Credit Utilization</span>
            <span className="text-emerald-400 font-bold">Optimal (&lt; 10%)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--text-1)] font-mono">{utilizationPct}%</span>
          </div>
          <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${utilizationPct}%` }} />
          </div>
          <p className="text-[11px] text-[var(--text-3)]">
            {formatMoney(totalBalance)} used of {formatMoney(totalLimit)} total limits
          </p>
        </div>

        {/* On-Time Payment History */}
        <div className="card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-3)]">
            <span className="font-semibold uppercase tracking-wider">Payment History</span>
            <span className="text-emerald-400 font-bold">Flawless</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--text-1)] font-mono">100%</span>
          </div>
          <p className="text-[11px] text-[var(--text-3)]">
            48 consecutive on-time payments across all accounts
          </p>
        </div>
      </div>

      {/* Credit Factors Breakdown */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          Credit Rating Factor Analysis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-inner p-4 space-y-1">
            <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Credit Age</span>
            <p className="text-base font-bold text-[var(--text-1)]">6.4 Years</p>
            <span className="text-[10px] text-emerald-400 font-medium">Good History</span>
          </div>
          <div className="card-inner p-4 space-y-1">
            <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Hard Inquiries</span>
            <p className="text-base font-bold text-[var(--text-1)]">1 (Last 12 mos)</p>
            <span className="text-[10px] text-emerald-400 font-medium">Low Impact</span>
          </div>
          <div className="card-inner p-4 space-y-1">
            <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Total Open Accounts</span>
            <p className="text-base font-bold text-[var(--text-1)]">8 Accounts</p>
            <span className="text-[10px] text-emerald-400 font-medium">Healthy Mix</span>
          </div>
          <div className="card-inner p-4 space-y-1">
            <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Derogatory Marks</span>
            <p className="text-base font-bold text-[var(--text-1)]">0 Marks</p>
            <span className="text-[10px] text-emerald-400 font-medium">Clean Record</span>
          </div>
        </div>
      </div>

      {/* Debt Payoff Accelerator Simulator */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">
              Debt Avalanche Payoff Simulator
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              Simulate adding extra monthly payments to eliminate interest costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-2)] font-semibold">Extra Monthly:</span>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs font-mono font-bold rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] outline-none"
            />
          </div>
        </div>

        <div className="card-inner p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-[var(--text-2)]">
              With an extra <strong>{formatMoney(extraPayment)}/mo</strong>, your outstanding card balance of <strong>{formatMoney(totalBalance)}</strong> will be paid in full in:
            </p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {Math.max(1, Math.ceil(totalBalance / (extraPayment + 150)))} Months
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">Estimated Interest Saved</span>
            <p className="text-lg font-black text-emerald-400 font-mono">
              {formatMoney(extraPayment * 0.22 * 1.5, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
