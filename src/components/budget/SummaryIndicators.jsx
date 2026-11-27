import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, DollarSign, ShieldAlert, Sparkles, Pencil, Check, X } from 'lucide-react';
import { Amount } from './Amount.jsx';

export const SummaryIndicators = ({ metrics, cappedCount = 0, onManageClick, monthlyBudget = 0, setMonthlyBudget }) => {
  const isZeroBudget = metrics.budget === 0;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monthlyBudget);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(monthlyBudget);
    }
  }, [monthlyBudget, isEditing]);

  const handleSave = () => {
    const num = Number(editValue);
    if (!isNaN(num) && setMonthlyBudget) {
      setMonthlyBudget(num);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(monthlyBudget);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Monthly Budget Card */}
      <div className="card p-4 sm:p-5 space-y-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Monthly Budget
          </span>
          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <button
                onClick={() => { setIsEditing(true); setEditValue(monthlyBudget); }}
                className="p-1 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-all cursor-pointer"
                title="Edit Monthly Budget"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-1.5 my-1">
              <span className="font-mono font-bold text-sm text-[var(--text-1)]">$</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-28 px-2 py-1 text-sm font-bold font-mono rounded-lg bg-[var(--surface-2)] border border-emerald-500 text-[var(--text-1)] outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 rounded bg-[var(--surface-3)] hover:bg-rose-500/20 text-[var(--text-2)] hover:text-rose-400 cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-1)] tracking-tight">
              <Amount value={metrics.budget} decimals={0} />
            </div>
          )}
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            {cappedCount} capped categories active
          </p>
        </div>
        {isZeroBudget && !isEditing && (
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
