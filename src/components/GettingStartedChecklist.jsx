import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { CheckCircle2, Circle, Sparkles, Clock, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export const GettingStartedChecklist = () => {
  const { setCurrentTab, accountsData, expensesData } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

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

  const titleText = allDone
    ? "You're all set! Workspace fully optimized."
    : doneCount === 3
    ? "🎉 75% Complete — Just one step to unlock full power!"
    : 'Get started with LedgerJourney';

  return (
    <div className="card p-5 sm:p-7 space-y-4 relative overflow-hidden bg-gradient-to-br from-emerald-950/30 via-[var(--surface)] to-[var(--surface-2)] border-2 border-emerald-500/40 shadow-2xl ring-4 ring-emerald-500/10 select-none">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xs sm:text-base font-black text-[var(--text-1)] tracking-tight">
                {titleText}
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 font-mono shadow-sm">
                {doneCount} / {steps.length} ({pct}%)
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--text-2)] mt-1 font-medium leading-relaxed">
              {allDone ? 'Every setup step is complete. Enjoy your financial command center.' : 'Complete the final pending task below to reach 100% financial readiness.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Accordion Toggle Button for Mobile */}
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-pointer min-h-[44px]"
          >
            <span>{isAccordionOpen ? 'Hide Steps' : 'View Checklist'}</span>
            {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-xs font-semibold text-[var(--text-3)] hover:text-emerald-400 hover:underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" /> Dismiss
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden relative z-10 shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700 shadow-md shadow-emerald-500/50"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist Items: Always visible on desktop (lg:block), inside accordion on mobile */}
      <div className={`space-y-3 pt-1 relative z-10 ${isAccordionOpen ? 'block' : 'hidden lg:grid lg:grid-cols-2 lg:gap-3.5 lg:space-y-0'}`}>
        {steps.map((step, idx) => {
          const isIncomplete = !step.done;
          return (
            <div
              key={idx}
              onClick={() => setCurrentTab(step.tab)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${
                step.done
                  ? 'bg-emerald-500/5 border-emerald-500/25 text-[var(--text-2)] opacity-80'
                  : 'bg-gradient-to-r from-emerald-500/20 via-[var(--surface)] to-[var(--surface-2)] border-emerald-400 text-[var(--text-1)] shadow-xl hover:border-emerald-300 ring-2 ring-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-emerald-400 fill-emerald-500/35 shrink-0 animate-bounce" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold truncate ${step.done ? 'line-through opacity-75' : 'text-emerald-300 text-xs sm:text-sm font-black'}`}>
                    {step.title} {isIncomplete && '⚡'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[var(--text-3)] truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-black px-2 py-1 rounded-lg bg-emerald-500/10 shrink-0 ml-2">
                {step.done ? 'Done' : 'Complete →'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
