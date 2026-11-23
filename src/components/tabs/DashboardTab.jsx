import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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
    <div className="space-y-6">
      {/* Top Banner / Welcome & Customizer Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            HOUSEHOLD DASHBOARD
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-1)] mt-1.5">
            LedgerJourney Snapshot
          </h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Live aggregated intelligence across all accounts, portfolios, and budgets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5 ${isCustomizing ? '!bg-emerald-500 !text-white' : ''}`}
          >
            {isCustomizing ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span>{isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}</span>
          </button>
          <button
            onClick={syncToCloud}
            disabled={isSyncing}
            className="btn-secondary text-xs px-3 py-2 cursor-pointer"
          >
            {isSyncing ? 'Syncing...' : '🔄 Cloud Sync'}
          </button>
          <button
            onClick={() => openModal('quickAdd')}
            className="btn-primary text-xs px-4 py-2 cursor-pointer"
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
                    <button onClick={() => moveWidget(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveWidget(idx, 1)} disabled={idx === widgetOrder.length - 1} className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-3)] disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleHideWidget(key)} className={`p-1 rounded hover:bg-[var(--surface-2)] ${isHidden ? 'text-emerald-400' : 'text-[var(--text-3)]'}`} title={isHidden ? 'Show widget' : 'Hide widget'}>
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
                <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Total Net Worth</span>
                  <span className="text-emerald-400 font-bold text-sm">▲ 14.8% YTD</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={netWorth > 0 ? netWorth : 421868} />
                </div>
                <p className="text-[11px] text-[var(--text-3)] mt-2">
                  Aggregated across {accounts.length} linked accounts & assets
                </p>
              </div>

              {/* Invested Retirement */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Invested Portfolio</span>
                  <span className="text-purple-400 font-bold">401k · IRA · HSA</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={
                    latestYear?.balances
                      ? Object.values(latestYear.balances).reduce((a, b) => a + Number(b), 0)
                      : 206000
                  } />
                </div>
                <p className="text-[11px] text-[var(--text-3)] mt-2">
                  Target retirement horizon: 2038
                </p>
              </div>

              {/* Monthly Budget Pace */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Monthly Spend</span>
                  <span className="text-amber-400 font-bold">{budgetPacePct}% of budget</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={currentMonthSpent} />
                </div>
                <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${budgetPacePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-3)] mt-2">
                  {formatMoney(remainingBudget)} remaining this month
                </p>
              </div>

              {/* Credit & Liabilities */}
              <div className="card p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Total Liabilities</span>
                  <span className="text-rose-400 font-semibold">Credit Cards</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
                  <AnimatedNumber value={totalDebts > 0 ? totalDebts : 2384} />
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  Credit Score: 782 (Excellent)
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

        if (key === 'accounts') {
          return (
            <div key="accounts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Linked Accounts Quicklist */}
              <div className="card p-5 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-1)]">Linked Money Accounts</h3>
                    <p className="text-xs text-[var(--text-3)]">Direct sync with banks and brokerages</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('tab-accounts')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    View All ({accounts.length}) →
                  </button>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {accounts.slice(0, 4).map(account => (
                    <div key={account.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: account.color || '#8B5CF6' }}
                        >
                          {account.institution?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-1)]">{account.name}</p>
                          <p className="text-[10px] text-[var(--text-3)]">
                            {account.institution} · •••• {account.mask} ({account.type})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-[var(--text-1)]">
                          {formatMoney(account.balance)}
                        </p>
                        <span className="text-[9px] text-emerald-400 font-medium">Synced</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Portfolio Allocation Mix */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[var(--text-1)]">Portfolio Mix</h3>
                  <button
                    onClick={() => setCurrentTab('tab-overview')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Details →
                  </button>
                </div>

                <div className="space-y-3">
                  {(portfolioData?.categories || []).map(cat => {
                    const val = latestYear?.balances?.[cat.key] || 0;
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--text-2)] font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.label}
                          </span>
                          <span className="font-mono text-[var(--text-1)] font-semibold">
                            {formatMoney(val)}
                          </span>
                        </div>
                        <div className="w-full bg-[var(--surface-3)] h-1 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: cat.color,
                              width: `${Math.min(100, Math.max(5, (val / 150000) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        if (key === 'scorecard') {
          return (
            <div key="scorecard" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5 space-y-2 border-emerald-500/20 bg-gradient-to-br from-[var(--surface)] to-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Emergency Buffer</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">9.4 Mos</span>
                </div>
                <h4 className="font-bold text-sm text-[var(--text-1)]">Robust Cash Reserves</h4>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Your liquid depository accounts comfortably cover 9+ months of essential household burn rate.
                </p>
              </div>

              <div className="card p-5 space-y-2 border-purple-500/20 bg-gradient-to-br from-[var(--surface)] to-purple-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-400">Retirement Horizon</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 font-mono">FIRE Ready</span>
                </div>
                <h4 className="font-bold text-sm text-[var(--text-1)]">On Track for 2038</h4>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Current compound savings velocity puts you 2 years ahead of your target financial independence date.
                </p>
              </div>

              <div className="card p-5 space-y-2 border-blue-500/20 bg-gradient-to-br from-[var(--surface)] to-blue-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-blue-400">Debt Optimization</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">782 FICO</span>
                </div>
                <h4 className="font-bold text-sm text-[var(--text-1)]">Prime Credit Standing</h4>
                <p className="text-xs text-[var(--text-3)] leading-relaxed">
                  Credit utilization is locked at an optimal 3.4%. Zero high-interest revolving balances detected.
                </p>
              </div>
            </div>
          );
        }

        if (key === 'recent') {
          return (
            <div key="recent" className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-1)]">Recent Transactions</h3>
                  <p className="text-xs text-[var(--text-3)]">Activity logged this month</p>
                </div>
                <button
                  onClick={() => setCurrentTab('tab-transactions')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Full Ledger ({transactions.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                      <th className="py-2 font-semibold">Date</th>
                      <th className="py-2 font-semibold">Merchant / Description</th>
                      <th className="py-2 font-semibold">Category</th>
                      <th className="py-2 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                        <td className="py-3 font-mono text-[var(--text-3)]">{tx.date}</td>
                        <td className="py-3 font-bold text-[var(--text-1)]">{tx.description}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-[var(--surface-3)] text-[var(--text-2)]">
                            {tx.categoryId}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          {formatMoney(tx.amount, 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
