import React from 'react';
import { Target, TrendingDown, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { Amount } from './Amount.jsx';

export const SummaryIndicators = ({ metrics, cappedCount = 0, onManageClick }) => {
  const isZeroBudget = metrics.budget === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Monthly Budget Card */}
      <div className="card p-4 sm:p-5 space-y-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Monthly Budget
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-1)] tracking-tight">
            <Amount value={metrics.budget} decimals={0} />
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            {cappedCount} capped categories active
          </p>
        </div>
        {isZeroBudget && (
          <button
            onClick={onManageClick}
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Set up budget caps →</span>
          </button>
        )}
      </div>

      {/* 2. Spent Card */}
      <div className="card p-4 sm:p-5 space-y-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Total Spent
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-1)] tracking-tight">
            <Amount value={metrics.spent} decimals={2} />
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            {metrics.pctSpent}% of monthly budget
          </p>
        </div>
      </div>

      {/* 3. Remaining Card */}
      <div className="card p-4 sm:p-5 space-y-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Remaining Allowance
          </span>
          <div className={`p-2 rounded-xl border ${metrics.remaining >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${metrics.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <Amount value={metrics.remaining} decimals={2} />
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            {metrics.remaining >= 0 ? `${metrics.daysLeft} days remaining in period` : 'Over budget limit'}
          </p>
        </div>
      </div>

      {/* 4. Safe-to-Spend Card */}
      <div className="card p-4 sm:p-5 space-y-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Safe-to-Spend / Day
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400 tracking-tight">
            <Amount value={metrics.safeToSpend} decimals={2} />
            <span className="text-xs font-normal text-[var(--text-3)]">/day</span>
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            Across {metrics.daysLeft} active days left
          </p>
        </div>
      </div>
    </div>
  );
};
