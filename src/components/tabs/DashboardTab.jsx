import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { GettingStartedChecklist } from '../GettingStartedChecklist.jsx';
import { SlidersHorizontal, RotateCcw, Check, EyeOff, Eye, ArrowUp, ArrowDown, Calendar, Settings, ChevronDown, Filter, X } from 'lucide-react';

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
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [showAllTxModal, setShowAllTxModal] = useState(false);
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
    <div className="space-y-6 pb-36 select-none">
      {/* Mobile Compact Welcome Banner */}
      <div className="card p-4 sm:p-8 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              DASHBOARD
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-1)] tracking-tight">
              Welcome, {userName}
            </h2>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Net worth up <strong className="text-emerald-400 font-bold">14.8% ({timeFrame.toUpperCase()})</strong>. FIRE milestone: <strong className="text-purple-400 font-bold">2038</strong>.
            </p>
          </div>

          {/* Mobile Filter Icon Button */}
          <button
            onClick={() => setShowMobileFilterModal(true)}
            className="lg:hidden min-w-[44px] min-h-[44px] p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-emerald-400 flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
            title="Filter & Options"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Controls (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
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

          <button
            onClick={() => openModal('quickAdd')}
            className="btn-primary text-xs px-5 py-2.5 cursor-pointer shadow-md"
            style={{ backgroundColor: '#1D4ED8' }}
          >
            + Quick Entry
          </button>
        </div>
      </div>

      {/* Mobile Filter & Options Popover Modal */}
      {showMobileFilterModal && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-black text-sm text-[var(--text-1)] flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>Filter &amp; Dashboard Options</span>
              </h3>
              <button
                onClick={() => setShowMobileFilterModal(false)}
                className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)] block mb-1.5">
                  Timeframe Filter
                </label>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] outline-none cursor-pointer"
                >
                  <option value="month">This Month</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="ytd">Year to Date (YTD)</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => { setIsCustomizing(!isCustomizing); setShowMobileFilterModal(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] cursor-pointer min-h-[44px]"
                >
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>{isCustomizing ? 'Done Customizing Layout' : 'Customize Dashboard Layout'}</span>
                </button>
                <button
                  onClick={() => { syncToCloud(); setShowMobileFilterModal(false); }}
                  disabled={isSyncing}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] cursor-pointer min-h-[44px]"
                >
                  <span className="text-base">🔄</span>
                  <span>{isSyncing ? 'Syncing...' : 'Synchronize to Cloud'}</span>
                </button>
                <button
                  onClick={() => { openModal('quickAdd'); setShowMobileFilterModal(false); }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer min-h-[44px]"
                >
                  <span>+ Quick Entry Wizard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Panel Drawer */}
      {isCustomizing && (
        <div className="card p-5 space-y-3 bg-[var(--app-bg-2)] border border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Dashboard Layout Manager</span>
            </h3>
            <span className="text-[10px] text-[var(--text-3)] font-mono">Reorder or toggle widgets</span>
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
                    <button onClick={() => moveWidget(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveWidget(idx, 1)} disabled={idx === widgetOrder.length - 1} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleHideWidget(key)} className={`p-1 rounded hover:bg-[var(--surface-2)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${isHidden ? 'text-emerald-400' : 'text-[var(--text-3)]'}`}>
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Widgets Dynamically */}
      {widgetOrder.map(key => {
        if (hiddenWidgets.includes(key)) return null;

        if (key === 'checklist') {
          return <GettingStartedChecklist key="checklist" />;
        }

        if (key === 'kpis') {
          return (
            <div key="kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Net Worth */}
              <div className="card p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] block truncate">
                    Total Net Worth
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-[var(--text-1)] font-mono mt-1">
                    <AnimatedNumber value={netWorth} />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-emerald-400 font-bold">▲ 14.8%</span>
                  <span className="text-[var(--text-3)]">{accounts.length} accounts</span>
                </div>
              </div>

              {/* Invested Portfolio */}
              <div className="card p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] block truncate">
                    Invested Portfolio
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-[var(--text-1)] font-mono mt-1">
                    <AnimatedNumber value={
                      latestYear?.balances
                        ? Object.values(latestYear.balances).reduce((a, b) => a + Number(b), 0)
                        : 0
                    } />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-purple-400 font-bold">Retirement</span>
                  <span className="text-[var(--text-3)]">FIRE 2038</span>
                </div>
              </div>

              {/* Monthly Budget Spend */}
              <div className="card p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] block truncate">
                    Monthly Spend
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-[var(--text-1)] font-mono mt-1">
                    <AnimatedNumber value={currentMonthSpent} />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-xs">
                  <span className={`font-bold ${budgetPacePct >= 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {budgetPacePct}% budget
                  </span>
                  <span className="text-[var(--text-3)]">{formatMoney(remainingBudget)} left</span>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="card p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] block truncate">
                    Liabilities
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-[var(--text-1)] font-mono mt-1">
                    <AnimatedNumber value={totalDebts} />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-emerald-400 font-bold">FICO 782</span>
                  <span className="text-[var(--text-3)]">Excellent</span>
                </div>
              </div>
            </div>
          );
        }

        if (key === 'charts') {
          return (
            <div key="charts" className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {/* Stack Net Worth Growth and Asset Allocation vertically on mobile */}
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
          const topTxs = (transactions || []).slice(0, 3);
          return (
            <div key="recent" className="card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
                  <span>Recent Activity</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">Top 3</span>
                </h3>
                <button
                  onClick={() => setShowAllTxModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer min-h-[44px] flex items-center"
                >
                  View All ({transactions.length}) →
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
                  topTxs.map((tx, idx) => {
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

      {/* Full-Screen Transactions List Modal (View All) */}
      {showAllTxModal && (
        <div className="fixed inset-0 z-50 bg-[var(--app-bg)] overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200 select-none">
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FULL LEDGER
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-1)] tracking-tight mt-1">
                  All Transactions ({transactions.length})
                </h2>
              </div>
              <button
                onClick={() => setShowAllTxModal(false)}
                className="min-w-[44px] min-h-[44px] p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-3)] cursor-pointer flex items-center justify-center shadow-sm"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(transactions || []).map((tx, idx) => {
                const isPositive = Number(tx.amount) > 0 && (tx.description?.toLowerCase().includes('refund') || tx.description?.toLowerCase().includes('deposit'));
                return (
                  <div key={tx.id || idx} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {tx.description?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-1)] text-sm">{tx.description}</p>
                        <p className="text-[11px] text-[var(--text-3)]">{tx.date} • {tx.source || 'Manual Entry'}</p>
                      </div>
                    </div>
                    <div className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? `+${formatMoney(Math.abs(tx.amount), 2)}` : formatMoney(tx.amount, 2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setShowAllTxModal(false)}
                className="btn-primary px-6 py-3 text-xs font-bold cursor-pointer"
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
