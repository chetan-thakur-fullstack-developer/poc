import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { GettingStartedChecklist } from '../GettingStartedChecklist.jsx';
import { SlidersHorizontal, RotateCcw, Check, EyeOff, Eye, ArrowUp, ArrowDown } from 'lucide-react';

export const DashboardTab = () => {
  const {
    formatMoney,
    portfolioData,
    accountsData,
    expensesData,
    transactions,
    setCurrentTab,
    openModal,
    syncToCloud,
    isSyncing
  } = useApp();

  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || (user?.email?.split('@')[0]) || 'Demo Investor';

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [widgetOrder, setWidgetOrder] = useState(['checklist', 'kpis', 'charts', 'accounts', 'scorecard', 'recent']);

  // Calculate Net Worth from accounts and latest portfolio year
  const accounts = accountsData?.linked || [];
  const latestYear = portfolioData?.defaultAccountData?.[portfolioData.defaultAccountData.length - 1];

  const totalAssets = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalDebts = accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const netWorth = totalAssets - totalDebts;

  // Monthly Budget & Spend
  const monthlyBudget = expensesData?.monthlyBudget || 3000;
  const currentMonthSpent = (transactions || []).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const remainingBudget = Math.max(0, monthlyBudget - currentMonthSpent);
  const budgetPacePct = Math.min(100, Math.round((currentMonthSpent / monthlyBudget) * 100));

  const toggleHideWidget = (key) => {
    setHiddenWidgets(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const moveWidget = (index, direction) => {
    const newOrder = [...widgetOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setWidgetOrder(newOrder);
  };

  const widgetMeta = {
    checklist: 'Getting Started Checklist',
    kpis: 'Net Worth & KPI Cards',
    charts: 'Interactive Growth & Allocation Charts',
    accounts: 'Linked Accounts & Portfolio Mix',
    scorecard: 'Financial Health Scorecard',
    recent: 'Recent Transactions Activity'
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Welcome & Customizer Toolbar */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-xl">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            HOUSEHOLD DASHBOARD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-1)] tracking-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">
            Your net worth is up <strong className="text-emerald-400 font-bold">14.8% YTD</strong>. You are on track to hit your FIRE milestone by <strong className="text-purple-400 font-bold">2038</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`btn-secondary text-xs px-3.5 py-2.5 cursor-pointer flex items-center gap-1.5 shadow-sm ${isCustomizing ? '!bg-emerald-500 !text-white' : ''}`}
          >
            {isCustomizing ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span>{isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}</span>
          </button>
          <button
            onClick={syncToCloud}
            disabled={isSyncing}
            className="btn-secondary text-xs px-3.5 py-2.5 cursor-pointer shadow-sm"
          >
            {isSyncing ? 'Syncing...' : '🔄 Cloud Sync'}
          </button>
          <button
            onClick={() => openModal('quickAdd')}
            className="btn-primary text-xs px-4 py-2.5 cursor-pointer shadow-md"
          >
            + Quick Entry
          </button>
        </div>
      </div>

      {/* Customize Panel Drawer */}
      {isCustomizing && (
        <div className="card p-5 space-y-3 bg-[var(--app-bg-2)] border border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Dashboard Layout Manager</span>
            </h3>
            <span className="text-[10px] text-[var(--text-3)] font-mono">Reorder or toggle visibility of widgets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
            {widgetOrder.map((key, idx) => {
              const isHidden = hiddenWidgets.includes(key);
              return (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-[var(--text-4)]">{idx + 1}.</span>
                    <span className={`font-semibold truncate ${isHidden ? 'line-through opacity-50' : 'text-[var(--text-1)]'}`}>
                      {widgetMeta[key]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveWidget(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30 cursor-pointer">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveWidget(idx, 1)} disabled={idx === widgetOrder.length - 1} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30 cursor-pointer">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleHideWidget(key)} className={`p-1 rounded hover:bg-[var(--surface-2)] cursor-pointer ${isHidden ? 'text-emerald-400' : 'text-[var(--text-3)]'}`} title={isHidden ? 'Show widget' : 'Hide widget'}>
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Widgets Dynamically according to widgetOrder */}
      {widgetOrder.map(key => {
        if (hiddenWidgets.includes(key)) return null;

        if (key === 'checklist') {
          return <GettingStartedChecklist key="checklist" />;
        }

        if (key === 'kpis') {
          return (
            <div key="kpis" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Total Net Worth */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[var(--text-2)]">Total Net Worth</span>
                  <span className="text-emerald-400 font-bold text-sm">▲ 14.8% YTD</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={netWorth > 0 ? netWorth : 421868} />
                </div>
                <p className="text-xs text-[var(--text-2)] mt-2">
                  Aggregated across {accounts.length} linked accounts & assets
                </p>
              </div>

              {/* Invested Retirement */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[var(--text-2)]">Invested Portfolio</span>
                  <span className="text-purple-400 font-bold">401k · IRA · HSA</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={
                    latestYear?.balances
                      ? Object.values(latestYear.balances).reduce((a, b) => a + Number(b), 0)
                      : 206000
                  } />
                </div>
                <p className="text-xs text-[var(--text-2)] mt-2">
                  Target retirement horizon: 2038
                </p>
              </div>

              {/* Monthly Budget Pace */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[var(--text-2)]">Monthly Spend</span>
                  <span className={`font-bold ${budgetPacePct >= 90 ? 'text-rose-400' : budgetPacePct >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {budgetPacePct}% of budget
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={currentMonthSpent} />
                </div>
                <div className="w-full bg-[var(--surface-3)] h-3 rounded-full mt-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPacePct >= 90 ? 'bg-rose-500' : budgetPacePct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetPacePct)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-2)] mt-2.5 font-medium">
                  {budgetPacePct}% of {formatMoney(monthlyBudget)} budget used ({formatMoney(remainingBudget)} left).
                </p>
              </div>

              {/* Credit & Liabilities */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[var(--text-2)]">Total Liabilities</span>
                  <span className="text-emerald-400 font-bold text-sm">▼ 2.4% YTD</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={totalDebts > 0 ? totalDebts : 2384} />
                </div>
                <p className="text-xs text-[var(--text-2)] mt-2.5 font-medium flex items-center justify-between">
                  <span>Credit Score: <strong className="text-emerald-400">782</strong></span>
                  <span className="text-[var(--text-3)]">Excellent</span>
                </p>
              </div>
            </div>
          );
        }

        if (key === 'charts') {
          return (
            <div key="charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AreaChart
                  title="Multi-Year Net Worth Growth Trajectory"
                  color="#10B981"
                  height={260}
                  data={(portfolioData?.defaultAccountData || []).map(y => ({
                    label: y.year,
                    value: Object.values(y.balances || {}).reduce((a, b) => a + Number(b), 0)
                  }))}
                />
              </div>
              <div>
                <DonutChart
                  title="Asset Allocation Mix"
                  data={(portfolioData?.categories || []).map(cat => ({
                    label: cat.label,
                    value: latestYear?.balances?.[cat.key] || 0,
                    color: cat.color
                  }))}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
