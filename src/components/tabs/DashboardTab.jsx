import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

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

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            HOUSEHOLD DASHBOARD
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-1)] mt-1.5">
            Executive Wealth Snapshot
          </h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Live aggregated intelligence across all accounts, portfolios, and budgets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* KPI Net Worth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Net Worth</span>
            <span className="text-emerald-400 font-bold text-sm">▲ 14.8% YTD</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono">
            {formatMoney(netWorth > 0 ? netWorth : 421868)}
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
            {formatMoney(
              latestYear?.balances
                ? Object.values(latestYear.balances).reduce((a, b) => a + Number(b), 0)
                : 206000
            )}
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
            {formatMoney(currentMonthSpent)}
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
            {formatMoney(totalDebts > 0 ? totalDebts : 2384)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium">
            Credit Score: 782 (Excellent)
          </p>
        </div>
      </div>

      {/* Middle Grid: Accounts Quicklist & Asset Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Recent Activity Table */}
      <div className="card p-5 space-y-4">
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
                <tr key={tx.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                  <td className="py-2.5 font-mono text-[var(--text-3)]">{tx.date}</td>
                  <td className="py-2.5 font-bold text-[var(--text-1)]">{tx.description}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-3)] text-[var(--text-2)] font-medium">
                      {tx.categoryId || 'General'}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-right text-[var(--text-1)]">
                    {formatMoney(tx.amount, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
