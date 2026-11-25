import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { GettingStartedChecklist } from '../GettingStartedChecklist.jsx';
import { SlidersHorizontal, RotateCcw, Check, EyeOff, Eye, ArrowUp, ArrowDown, Calendar, Settings, ChevronDown } from 'lucide-react';

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

  // Global Time Frame Filter State
  const [timeFrame, setTimeFrame] = useState('ytd');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Calculate Net Worth from accounts and latest portfolio year
  const accounts = (accountsData?.linked || []).filter(a => !a.isExcluded);
  const latestYear = portfolioData?.defaultAccountData?.[portfolioData.defaultAccountData.length - 1];

  const totalAssets = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalDebts = accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const netWorth = totalAssets - totalDebts;

  // Monthly Budget & Spend (excluding excluded transactions)
  const monthlyBudget = expensesData?.monthlyBudget || 3000;
  const activeTxs = (transactions || []).filter(t => !t.isExcluded);
  const currentMonthSpent = activeTxs.reduce((sum, t) => {
    const isExp = t.isExpense !== undefined ? t.isExpense : (Number(t.amount) >= 0);
    return isExp ? sum + (Number(t.amount) || 0) : sum;
  }, 0);
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
    <div className="space-y-6 pb-32">
      {/* Top Banner / Welcome & Clean Action Toolbar */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-xl">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            HOUSEHOLD DASHBOARD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-1)] tracking-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">
            Your net worth is up <strong className="text-emerald-400 font-bold">14.8% ({timeFrame.toUpperCase()})</strong>. You are on track to hit your FIRE milestone by <strong className="text-purple-400 font-bold">2038</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {/* Global Time Filter Dropdown */}
          <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3.5 py-2 rounded-xl border border-[var(--border)] shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="bg-transparent text-xs font-bold text-[var(--text-1)] outline-none cursor-pointer"
            >
              <option value="month">This Month ▾</option>
              <option value="30days">Last 30 Days</option>
              <option value="ytd">Year to Date (YTD)</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Secondary Actions Dropdown Menu */}
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="btn-secondary text-xs px-3.5 py-2.5 cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Dashboard Options"
            >
              <Settings className="w-4 h-4 text-[var(--text-3)]" />
              <span>Options</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { setIsCustomizing(!isCustomizing); setShowActionMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-2)] flex items-center gap-2.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>{isCustomizing ? 'Done Customizing' : 'Customize Layout'}</span>
                </button>
                <button
                  onClick={() => { syncToCloud(); setShowActionMenu(false); }}
                  disabled={isSyncing}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-2)] flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="text-base">🔄</span>
                  <span>{isSyncing ? 'Syncing...' : 'Cloud Sync'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary High-Contrast CTA */}
          <button
            onClick={() => openModal('quickAdd')}
            className="btn-primary text-xs px-5 py-2.5 cursor-pointer shadow-md"
            style={{ backgroundColor: '#1D4ED8' }}
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
                  <span className="text-emerald-400 font-bold text-sm">▲ 14.8% ({timeFrame.toUpperCase()})</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={netWorth} />
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
                      : 0
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
                  <span className="text-emerald-400 font-bold text-sm">▼ 2.4% ({timeFrame.toUpperCase()})</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={totalDebts} />
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

        if (key === 'recent') {
          return (
            <div key="recent" className="card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
                  <span>Recent Activity &amp; Live Insights</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">Live Feed</span>
                </h3>
                <button
                  onClick={() => setCurrentTab('tab-transactions')}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  View All Ledger →
                </button>
              </div>

              <div className="space-y-2.5">
                {(transactions || []).length === 0 ? (
                  <div className="py-10 text-center text-xs text-[var(--text-3)]">
                    <p className="font-bold text-[var(--text-1)] text-sm">No recent activity recorded</p>
                    <p className="text-xs text-[var(--text-3)] mt-1 max-w-sm mx-auto leading-relaxed">
                      Your recent transactions feed will appear here as soon as you record or sync transactions in the ledger.
                    </p>
                  </div>
                ) : (
                  (transactions || []).slice(0, 4).map((tx, idx) => {
                    const isPositive = Number(tx.amount) > 0 && (tx.description?.toLowerCase().includes('refund') || tx.description?.toLowerCase().includes('deposit'));
                    return (
                      <div key={tx.id || idx} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs hover:border-[var(--border-hover)] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {tx.description?.[0] || 'M'}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-1)]">{tx.description}</p>
                            <p className="text-[10px] text-[var(--text-3)]">{tx.date} • {isPositive ? 'Income / Deposit' : 'Expense / Purchase'}</p>
                          </div>
                        </div>
                        <div className={`font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+${formatMoney(Math.abs(tx.amount), 2)}` : formatMoney(tx.amount, 2)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
