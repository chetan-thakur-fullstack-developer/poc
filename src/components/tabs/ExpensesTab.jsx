import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { SubscriptionRadar } from '../SubscriptionRadar.jsx';
import { Pencil, Check, X, Target } from 'lucide-react';

export const ExpensesTab = () => {
  const { expensesData, setExpensesData, transactions, formatMoney, syncToCloud, showToast } = useApp();

  const monthlyBudget = expensesData?.monthlyBudget || 0;
  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  const [initialBudget, setInitialBudget] = useState(monthlyBudget);
  const [hasChanged, setHasChanged] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetInput, setEditBudgetInput] = useState(monthlyBudget);

  useEffect(() => {
    if (expensesData?.monthlyBudget !== undefined && !hasChanged) {
      setInitialBudget(expensesData.monthlyBudget);
    }
  }, [expensesData?.monthlyBudget]);

  useEffect(() => {
    if (!isEditingBudget) {
      setEditBudgetInput(monthlyBudget);
    }
  }, [monthlyBudget, isEditingBudget]);

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

  const handleSaveBudget = async () => {
    const num = Number(editBudgetInput) || 0;
    updateBudget(num);
    await syncToCloud();
    setInitialBudget(num);
    setHasChanged(false);
    setIsEditingBudget(false);
    showToast('Monthly spending target saved to Supabase successfully!', 'success');
  };

  const handleCancelBudget = () => {
    setEditBudgetInput(monthlyBudget);
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Main Budget Pace Card (Ultra-Compact & Space-Saving) */}
      <div className="card p-4 sm:p-5 space-y-2.5 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-emerald-500/10 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        {/* Header Row: Title & Target Edit Inline */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--text-1)]">
                Monthly Budget Overview
              </h3>
              <p className="hidden sm:block text-[10px] text-[var(--text-3)]">
                Tracking household spending pace &amp; allowance
              </p>
            </div>
          </div>

          {/* Target Display & Inline Edit */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-2)] px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-3)] font-bold">Target:</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-[var(--text-1)]">$</span>
                <input
                  type="number"
                  value={editBudgetInput}
                  onChange={(e) => setEditBudgetInput(e.target.value)}
                  className="w-20 px-2 py-0.5 text-xs font-bold font-mono rounded-lg bg-[var(--surface)] border border-emerald-500 text-[var(--text-1)] outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveBudget}
                  className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Save target"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelBudget}
                  className="p-1 rounded-md bg-[var(--surface-3)] hover:bg-rose-500/20 text-[var(--text-2)] hover:text-rose-400 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-black font-mono text-[var(--text-1)]">
                  {formatMoney(monthlyBudget)}
                </span>
                <button
                  onClick={() => { setIsEditingBudget(true); setEditBudgetInput(monthlyBudget); }}
                  className="p-1 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-all cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center"
                  title="Edit monthly target"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Main Numbers (Remaining & Spent Side-by-Side) */}
        <div className="flex items-end justify-between border-t border-[var(--border)] pt-2 pb-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              Remaining Allowance
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
              <AnimatedNumber value={remainingBudget} decimals={2} />
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              Total Spent
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[var(--text-1)] tracking-tight">
              <AnimatedNumber value={totalSpent} decimals={2} />
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1 pt-0">
          <div className="flex justify-between text-[11px] font-bold font-mono">
            <span className="text-[var(--text-3)]">0%</span>
            <span className={budgetPace > 90 ? 'text-rose-400' : budgetPace > 75 ? 'text-amber-400' : 'text-emerald-400'}>
              {budgetPace}% Used ({100 - budgetPace}% left)
            </span>
            <span className="text-[var(--text-3)]">100%</span>
          </div>
          <div className="w-full bg-[var(--surface-3)] h-3 rounded-full overflow-hidden shadow-inner p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                budgetPace > 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : budgetPace > 75 ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, budgetPace)}%` }}
            />
          </div>
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
