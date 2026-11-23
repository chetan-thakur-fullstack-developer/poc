import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { Plus, Link2, Layers, TrendingUp, TrendingDown, Pencil, AlertCircle } from 'lucide-react';

export const AccountsTab = () => {
  const { accountsData, formatMoney, openModal, deleteAccount, syncToCloud, isSyncing } = useApp();
  const [filter, setFilter] = useState('all');

  const linked = accountsData?.linked || [];

  // Filter accounts based on filter chip
  const filteredAccounts = linked.filter(acc => {
    const isLiability = acc.type === 'credit' || (Number(acc.balance) < 0);
    const isLinked = acc.source === 'plaid' || acc.source === 'linked';
    const isManual = !isLinked;

    if (filter === 'assets') return !isLiability;
    if (filter === 'liabilities') return isLiability;
    if (filter === 'linked') return isLinked;
    if (filter === 'manual') return isManual;
    if (filter === 'unmapped') return !acc.mapping || Object.keys(acc.mapping).length === 0;
    return true; // 'all'
  });

  const totalAssets = linked
    .filter(a => a.type !== 'credit')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const totalLiab = linked
    .filter(a => a.type === 'credit')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const netWorth = totalAssets - totalLiab;

  const assetAccounts = linked.filter(a => a.type !== 'credit');
  const liabAccounts = linked.filter(a => a.type === 'credit');

  return (
    <div className="space-y-6">
      {/* Header & Net Worth Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-6 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] to-emerald-500/5 border border-emerald-500/20">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-3)]">Your Net Worth</span>
          <div className="text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-1)] font-mono my-2">
            <AnimatedNumber value={netWorth} />
          </div>
          <p className="text-xs font-semibold text-[var(--text-3)] mb-5">
            Across {linked.length} linked accounts & assets
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Assets {Math.round((totalAssets / (totalAssets + Math.abs(totalLiab) || 1)) * 100)}%
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                Liabilities {Math.round((Math.abs(totalLiab) / (totalAssets + Math.abs(totalLiab) || 1)) * 100)}%
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden flex bg-[var(--surface-3)]">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (totalAssets / (totalAssets + Math.abs(totalLiab) || 1)) * 100)}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (Math.abs(totalLiab) / (totalAssets + Math.abs(totalLiab) || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Money Breakdown Donut Chart */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Money Breakdown</h3>
            <p className="text-[10px] text-[var(--text-3)]">Asset & liability distribution</p>
          </div>
          <div className="py-1">
            <DonutChart
              data={[
                { label: 'Total Assets', value: totalAssets, color: '#10B981' },
                { label: 'Total Liabilities', value: Math.abs(totalLiab), color: '#EF4444' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Filter Chips & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All', icon: Layers },
            { id: 'assets', label: 'Assets', icon: TrendingUp },
            { id: 'liabilities', label: 'Liabilities', icon: TrendingDown },
            { id: 'linked', label: 'Linked', icon: Link2 },
            { id: 'manual', label: 'Manual', icon: Pencil },
            { id: 'unmapped', label: 'Unmapped', icon: AlertCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => openModal('addAccount')}
          className="btn-primary text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Table / List */}
      <div className="card p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                <th className="py-2.5 font-semibold">Account Name</th>
                <th className="py-2.5 font-semibold">Institution</th>
                <th className="py-2.5 font-semibold">Type</th>
                <th className="py-2.5 font-semibold">Source</th>
                <th className="py-2.5 font-semibold text-right">Balance</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    No accounts found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const isNeg = Number(acc.balance) < 0 || acc.type === 'credit';
                  return (
                    <tr key={acc.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                      <td className="py-3.5 font-bold text-[var(--text-1)] flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: acc.color || '#8B5CF6' }}
                        >
                          {acc.institution?.[0] || 'A'}
                        </div>
                        <span>{acc.name}</span>
                      </td>
                      <td className="py-3.5 text-[var(--text-2)]">{acc.institution || 'Direct'}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-[var(--surface-3)] text-[var(--text-2)]">
                          {acc.type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-400">
                          {acc.source || 'Manual'}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold ${isNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatMoney(acc.balance, 2)}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => deleteAccount(acc.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
