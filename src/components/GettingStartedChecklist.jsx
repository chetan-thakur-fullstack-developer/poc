import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { User, Wallet, Landmark, PieChart, Flag, Calculator, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';

export const GettingStartedChecklist = () => {
  const { setCurrentTab, accountsData, goals, expensesData, portfolioData } = useApp();

  const [isVisible, setIsVisible] = useState(() => {
    try { return localStorage.getItem('ew_checklist_dismissed') !== 'true'; } catch { return true; }
  });

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('ew_checklist_completed');
      if (saved) return JSON.parse(saved);
      return { 1: true }; // Profile complete by default
    } catch {
      return { 1: true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ew_checklist_completed', JSON.stringify(completedTasks));
    } catch {}
  }, [completedTasks]);

  if (!isVisible) return null;

  const hasAccounts = (accountsData?.linked || []).length > 0;
  const hasGoals = (goals || []).length > 0;
  const hasBudget = (expensesData?.monthlyBudget || 0) > 0;

  const savedSalary = Number(localStorage.getItem('ew_annual_salary') || 0);
  const latestYear = portfolioData?.defaultAccountData?.[portfolioData.defaultAccountData.length - 1];
  const hasSalary = savedSalary > 0 || Number(latestYear?.salary || 0) > 0;

  const checklistData = [
    {
      id: 1,
      title: 'Complete your profile',
      desc: 'Name, avatar & basic details',
      iconName: 'User',
      route: 'tab-settings',
      isDone: completedTasks[1] !== undefined ? completedTasks[1] : true
    },
    {
      id: 2,
      title: 'Set your income',
      desc: 'Powers paycheck, tax & projection tools',
      iconName: 'Wallet',
      route: 'tab-settings',
      subSection: 'salary',
      isDone: hasSalary || completedTasks[2] || false
    },
    {
      id: 3,
      title: 'Link or add an account',
      desc: 'Track net worth across banks & investments',
      iconName: 'Landmark',
      route: 'tab-accounts',
      isDone: hasAccounts || completedTasks[3] || false
    },
    {
      id: 4,
      title: 'Set a monthly budget',
      desc: 'Cap your spending and track pace',
      iconName: 'PieChart',
      route: 'tab-expenses',
      isDone: hasBudget || completedTasks[4] || false
    },
    {
      id: 5,
      title: 'Create a savings goal',
      desc: 'Give your savings a name and a deadline',
      iconName: 'Flag',
      route: 'tab-goals',
      isDone: hasGoals || completedTasks[5] || false
    },
    {
      id: 6,
      title: 'Explore FIRE & Calculators',
      desc: 'Simulate debt payoff and retirement',
      iconName: 'Calculator',
      route: 'tab-blueprint',
      isDone: completedTasks[6] || false
    }
  ];

  const totalItems = checklistData.length;
  const completedCount = checklistData.filter(item => item.isDone).length;
  const allDone = completedCount === totalItems;
  const percentage = Math.round((completedCount / totalItems) * 100);

  if (!isVisible || allDone) return null;

  const handleItemClick = (item) => {
    const updated = { ...completedTasks, [item.id]: true };
    setCompletedTasks(updated);
    try {
      localStorage.setItem('ew_checklist_completed', JSON.stringify(updated));
    } catch (e) {}

    if (item.subSection === 'salary') {
      try {
        localStorage.setItem('ew_active_settings_section', 'salary');
        window.location.hash = '#/settings/salary';
      } catch (e) {}
      setCurrentTab('tab-settings');
    } else {
      setCurrentTab(item.route);
    }
  };

  const toggleTask = (e, id) => {
    e.stopPropagation();
    setCompletedTasks(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('ew_checklist_completed', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const getIcon = (iconName, isDone) => {
    if (isDone) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    switch (iconName) {
      case 'User': return <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'Wallet': return <Wallet className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'PieChart': return <PieChart className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'Flag': return <Flag className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="card p-5 sm:p-7 space-y-5 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] shadow-xl relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-1)] tracking-tight">
              Get started with LedgerJourney
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              {completedCount} / {totalItems}
            </span>
          </div>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            A quick checklist to unlock the full power of your financial OS.
          </p>
        </div>

        {/* Hide (X) Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            try { localStorage.setItem('ew_checklist_dismissed', 'true'); } catch {}
          }}
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-3)] hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          title="Dismiss Checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 transition-all duration-700 shadow-md shadow-emerald-500/30"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[var(--text-3)] font-mono font-bold">
          <span>{percentage}% completed</span>
          <span>{totalItems - completedCount} tasks remaining</span>
        </div>
      </div>

      {/* Two-Column Grid (Desktop) / Single Column (Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {checklistData.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between min-h-[56px] group ${
                item.isDone
                  ? 'bg-[var(--surface-2)]/40 border-[var(--border)] opacity-75 cursor-default'
                  : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-emerald-500/40 hover:bg-[var(--surface-3)] cursor-pointer shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Icon Container */}
                <div
                  onClick={(e) => toggleTask(e, item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 cursor-pointer ${
                    item.isDone
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                  title={item.isDone ? 'Click to mark incomplete' : 'Click to mark complete'}
                >
                  {getIcon(item.iconName, item.isDone)}
                </div>

                <div className="min-w-0">
                  <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    item.isDone ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                  }`}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[var(--text-3)] truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Right Arrow Indicator or Check */}
              {!item.isDone && (
                <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/30 shrink-0 ml-3 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
