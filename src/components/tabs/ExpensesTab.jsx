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
    <div className="space-y-6 pb-36 select-none">
      {/* Main Budget Pace Card (Prominent at top) */}
      <div className="card p-6 space-y-4 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-emerald-500/10 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-3)]">
              Monthly Spending Target
            </span>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <span className="text-2xl sm:text-4xl font-black text-[var(--text-1)] font-mono">
                <AnimatedNumber value={totalSpent} decimals={2} />
              </span>
              <span className="text-xs text-[var(--text-3)] font-semibold">of</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-2)]">$</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => updateBudget(e.target.value)}
                  className="w-28 px-3 py-2 text-sm font-bold font-mono rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] outline-none"
                />
              </div>

              {/* Save to Supabase Button */}
              <button
                onClick={handleSaveToSupabase}
                disabled={!hasChanged}
                className={`btn-primary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-1.5 font-bold shadow-sm transition-all min-h-[44px] ${
                  !hasChanged ? 'opacity-40 cursor-not-allowed bg-gray-500 hover:bg-gray-500 border-none' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
                title={!hasChanged ? 'Modify monthly budget amount above to enable saving' : 'Save updated target to Supabase'}
              >
                <span>Save Target</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 font-mono text-base">
              <AnimatedNumber value={remainingBudget} decimals={2} />
            </span>
            <p className="text-[10px] text-[var(--text-3)]">Remaining allowance</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--surface-3)] h-3 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all ${budgetPace > 90 ? 'bg-rose-500' : budgetPace > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${budgetPace}%` }}
          />
        </div>
      </div>

      {/* Category Limits: Stacked vertically and full width */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          Category Limits &amp; Current Burn ({categories.length})
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {categories.map(cat => {
            const spent = spentPerCat[cat.id] || 0;
            const limit = cat.limit || 500;
            const pct = Math.min(100, Math.round((spent / (limit || 1)) * 100));
            const statusColor = pct > 100 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500';

            return (
              <div key={cat.id} className="card-inner p-4 space-y-2.5 w-full">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-1)] flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <span className="font-mono text-[var(--text-2)] shrink-0">
                    <strong className="text-[var(--text-1)]">{formatMoney(spent)}</strong> / {formatMoney(limit)}
                  </span>
                </div>

                <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden shadow-inner">
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

      {/* Credit Cards: Horizontal snap-to-scroll carousel on mobile (Apple Wallet style) */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--text-1)]">
            Household Credit Cards ({cards.length})
          </h3>
          <span className="text-[10px] text-[var(--text-3)] font-mono">Swipe right →</span>
        </div>

        {cards.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-3)]">
            <div className="max-w-xs mx-auto space-y-1">
              <p className="font-bold text-[var(--text-1)] text-sm">No credit cards added</p>
              <p className="text-xs text-[var(--text-3)] leading-relaxed">
                Add household credit cards and credit lines to track credit utilization rates, spending limits, and payment pacing.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 scrollbar-none">
            {cards.map(card => {
              const spent = spentPerCard[card.id] || (card.balance || Math.round((card.limit || 10000) * 0.18));
              const limit = Number(card.limit) || 10000;
              const utilPct = Math.min(100, Math.round((spent / limit) * 100));

              return (
                <div
                  key={card.id}
                  className={`snap-start shrink-0 w-72 sm:w-80 p-5 rounded-2xl border border-[var(--border)] bg-gradient-to-br ${card.gradient || 'from-indigo-600 to-slate-900'} text-white shadow-xl space-y-4`}
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
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden shadow-inner">
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
        )}
      </div>
    </div>
  );
};
