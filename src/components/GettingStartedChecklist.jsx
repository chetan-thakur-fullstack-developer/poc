import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react';

export const GettingStartedChecklist = () => {
  const { setCurrentTab, accountsData, expensesData } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const hasAccounts = (accountsData?.linked || []).length > 0;
  const hasBudget = (expensesData?.monthlyBudget || 0) > 0;

  const steps = [
    { title: 'Link your first account', desc: 'Sync bank or investment accounts', done: hasAccounts, tab: 'tab-accounts' },
    { title: 'Review portfolio allocation', desc: 'Check retirement & savings balances', done: true, tab: 'tab-overview' },
    { title: 'Set monthly budget target', desc: 'Define household spending limits', done: hasBudget, tab: 'tab-expenses' },
    { title: 'Explore FIRE & calculators', desc: 'Simulate debt payoff and retirement', done: false, tab: 'tab-blueprint' }
  ];

  const doneCount = steps.filter(s => s.done).length;
  const allDone = doneCount === steps.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="card p-6 space-y-4 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface-2)] to-emerald-500/5 border border-emerald-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[var(--text-1)]">
                {allDone ? "You're all set!" : 'Get started with Executive Wealth'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
                {doneCount} / {steps.length}
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              {allDone ? 'Every setup step is complete. Dismiss this card anytime.' : 'A quick checklist to unlock the full power of your workspace.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="btn-secondary text-xs !py-1.5 !px-3 self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
          title="Dismiss checklist"
        >
          <X className="w-3.5 h-3.5" /> Dismiss
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentTab(step.tab)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              step.done
                ? 'bg-emerald-500/5 border-emerald-500/20 text-[var(--text-2)]'
                : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-emerald-500/40 text-[var(--text-1)]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[var(--text-4)] shrink-0" />
              )}
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${step.done ? 'line-through opacity-80' : ''}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-[var(--text-3)] truncate">{step.desc}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold shrink-0 ml-2">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};
