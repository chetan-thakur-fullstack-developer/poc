import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { SubscriptionRadar } from '../SubscriptionRadar.jsx';

export const ExpensesTab = () => {
  const { expensesData, setExpensesData, transactions, formatMoney, syncToCloud, showToast } = useApp();

  const monthlyBudget = expensesData?.monthlyBudget || 3000;
  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  const [initialBudget, setInitialBudget] = useState(monthlyBudget);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (expensesData?.monthlyBudget !== undefined && !hasChanged) {
      setInitialBudget(expensesData.monthlyBudget);
    }
  }, [expensesData?.monthlyBudget]);

  // Calculate spent per category and per card (excluding excluded transactions)
  const spentPerCat = {};
  const spentPerCard = {};
  let totalSpent = 0;
  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (Number(tx.amount) >= 0);
    if (!isExp) return; // Only expenses count towards budget burn
    const amt = Number(tx.amount) || 0;
    totalSpent += amt;
    spentPerCat[tx.categoryId] = (spentPerCat[tx.categoryId] || 0) + amt;
    if (tx.cardId) {
      spentPerCard[tx.cardId] = (spentPerCard[tx.cardId] || 0) + amt;
    }
  });

  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const budgetPace = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  const updateBudget = (val) => {
    const num = Number(val) || 0;
    setExpensesData(prev => ({ ...prev, monthlyBudget: num }));
    setHasChanged(num !== initialBudget);
  };

  const handleSaveToSupabase = async () => {
    await syncToCloud();
    setInitialBudget(monthlyBudget);
    setHasChanged(false);
    showToast('Monthly spending target saved to Supabase successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Main Budget Pace Card */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              Monthly Spending Target
            </span>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                <AnimatedNumber value={totalSpent} decimals={2} />
              </span>
              <span className="text-xs text-[var(--text-3)] font-semibold">of</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-2)]">$</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => updateBudget(e.target.value)}
                  className="w-28 px-2.5 py-1.5 text-sm font-bold font-mono rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] outline-none"
                />
              </div>

              {/* Save to Supabase Button (Disabled until budget amount is modified) */}
              <button
                onClick={handleSaveToSupabase}
                disabled={!hasChanged}
                className={`btn-primary text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5 font-bold shadow-sm transition-all ${
                  !hasChanged ? 'opacity-40 cursor-not-allowed bg-gray-500 hover:bg-gray-500 border-none' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
                title={!hasChanged ? 'Modify monthly budget amount above to enable saving' : 'Save updated target to Supabase'}
              >
                <span>Save to Supabase</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">
              <AnimatedNumber value={remainingBudget} decimals={2} />
            </span>
            <p className="text-[10px] text-[var(--text-3)]">Remaining allowance</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${budgetPace > 90 ? 'bg-rose-500' : budgetPace > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${budgetPace}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          Category Limits & Current Burn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const spent = spentPerCat[cat.id] || 0;
            const limit = cat.limit || 500;
            const pct = Math.min(100, Math.round((spent / (limit || 1)) * 100));
            const statusColor = pct > 100 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500';

            return (
              <div key={cat.id} className="card-inner p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-1)] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </span>
                  <span className="font-mono text-[var(--text-2)]">
                    <strong className="text-[var(--text-1)]">{formatMoney(spent)}</strong> / {formatMoney(limit)}
                  </span>
                </div>

                <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${statusColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Ghost Radar */}
      <SubscriptionRadar />

      {/* Credit Cards & Limits */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          Household Credit Cards ({cards.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => {
            const spent = spentPerCard[card.id] || (card.balance || Math.round((card.limit || 10000) * 0.18));
            const limit = Number(card.limit) || 10000;
            const utilPct = Math.min(100, Math.round((spent / limit) * 100));

            return (
              <div
                key={card.id}
                className={`p-4 rounded-xl border border-[var(--border)] bg-gradient-to-br ${card.gradient || 'from-indigo-600 to-slate-900'} text-white shadow-lg space-y-3.5`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                    {card.issuer}
                  </span>
                  <span className="text-xs">💳</span>
                </div>

                <div>
                  <p className="font-bold text-sm tracking-tight">{card.name}</p>
                  <p className="font-mono text-xs opacity-75 mt-0.5">•••• •••• •••• {card.masked}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase opacity-75 font-bold">Utilization ({utilPct}%)</span>
                    <span className="font-mono font-bold">{formatMoney(spent)} / {formatMoney(limit)}</span>
                  </div>
                  <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${utilPct > 85 ? 'bg-rose-400' : utilPct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
