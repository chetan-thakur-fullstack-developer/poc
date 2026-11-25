import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { CheckCircle2, Circle, Sparkles, Clock } from 'lucide-react';

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

  // Pro UX Title based on progress
  const titleText = allDone
    ? "You're all set!"
    : doneCount === steps.length - 1
    ? "You're almost there! One step left."
    : 'Get started with LedgerJourney';

  return (
    <div className="card p-6 space-y-4 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface-2)] to-emerald-500/10 border border-emerald-500/30 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[var(--text-1)]">
                {titleText}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
                {doneCount} / {steps.length}
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              {allDone ? 'Every setup step is complete.' : 'Complete the remaining task below to unlock the full power of your workspace.'}
            </p>
          </div>
        </div>

        {/* Remind me later link instead of aggressive Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="text-xs font-semibold text-[var(--text-3)] hover:text-emerald-400 hover:underline transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" /> Remind me later
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist Grid with visual pop for incomplete step */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {steps.map((step, idx) => {
          const isIncomplete = !step.done;
          return (
            <div
              key={idx}
              onClick={() => setCurrentTab(step.tab)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                step.done
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-[var(--text-2)] opacity-80'
                  : 'bg-gradient-to-r from-emerald-500/15 via-[var(--surface-2)] to-[var(--surface)] border-emerald-500/50 text-[var(--text-1)] shadow-md hover:border-emerald-400 ring-1 ring-emerald-500/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-emerald-400 fill-emerald-500/20 shrink-0 animate-pulse" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${step.done ? 'line-through opacity-75' : 'text-emerald-300 font-extrabold'}`}>
                    {step.title} {isIncomplete && '✨'}
                  </p>
                  <p className="text-[10px] text-[var(--text-3)] truncate">{step.desc}</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold shrink-0 ml-2">→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
