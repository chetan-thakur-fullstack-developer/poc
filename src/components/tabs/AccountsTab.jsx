import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { Plus, Link2, Layers, TrendingUp, TrendingDown, Pencil, AlertCircle, ShieldCheck, Sparkles, Zap, Trash2, MoreVertical } from 'lucide-react';

export const AccountsTab = () => {
  const { accountsData, setAccountsData, formatMoney, openModal, deleteAccount, syncToCloud, isSyncing } = useApp();
  const [filter, setFilter] = useState('all');
  const [monthlySavingsInput, setMonthlySavingsInput] = useState(1500);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      if (openRowMenuId && target && !target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
        setMenuPos(null);
      }
    };
    const handleScroll = () => {
      if (openRowMenuId) {
        setOpenRowMenuId(null);
        setMenuPos(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openRowMenuId]);

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

  const activeLinked = linked.filter(a => !a.isExcluded);
  const totalAssets = activeLinked
    .filter(a => a.type !== 'credit')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const totalLiab = activeLinked
    .filter(a => a.type === 'credit')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const netWorth = totalAssets - totalLiab;

  // 1-Year, 3-Year, 5-Year Net Worth Projection based on monthly savings
  const projected1Yr = netWorth + monthlySavingsInput * 12 * 1.07;
  const projected3Yr = netWorth + monthlySavingsInput * 36 * 1.07;
  const projected5Yr = netWorth + monthlySavingsInput * 60 * 1.07;

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Net Worth Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Net Worth Card */}
        <div className="lg:col-span-7 card p-6 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-emerald-500/10 border border-emerald-500/25 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-3)]">Total Household Net Worth</span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-1)] font-mono my-1.5">
                <AnimatedNumber value={netWorth} />
              </div>
              <p className="text-xs font-semibold text-[var(--text-3)]">
                Aggregated across {linked.length} linked accounts & assets
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xl shadow-inner">
              💎
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Total Assets: {formatMoney(totalAssets)}
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                Total Liabilities: {formatMoney(Math.abs(totalLiab))}
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-[var(--surface-3)]">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.max(4, Math.min(96, (totalAssets / (totalAssets + Math.abs(totalLiab) || 1)) * 100))}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-700"
                style={{ width: `${Math.max(4, Math.min(96, (Math.abs(totalLiab) / (totalAssets + Math.abs(totalLiab) || 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Money Breakdown Donut Chart */}
        <div className="lg:col-span-5">
          <DonutChart
            title="Asset & Liability Distribution"
            data={[
              { label: 'Total Assets', value: totalAssets, color: '#10B981' },
              { label: 'Total Liabilities', value: Math.abs(totalLiab), color: '#EF4444' }
            ]}
          />
        </div>
      </div>

      {/* Filter Chips & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Accounts', icon: Layers },
            { id: 'assets', label: 'Assets', icon: TrendingUp },
            { id: 'liabilities', label: 'Liabilities', icon: TrendingDown },
            { id: 'linked', label: 'Plaid Linked', icon: Link2 },
            { id: 'manual', label: 'Manual', icon: Pencil },
            { id: 'unmapped', label: 'Unmapped', icon: AlertCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-sm font-bold'
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
          className="btn-primary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Table / List (Placed higher for better user workflow) */}
      <div className="card overflow-visible">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Linked Accounts & Assets ({filteredAccounts.length})
          </h3>
        </div>

        <div
          onScroll={() => {
            setOpenRowMenuId(null);
            setMenuPos(null);
          }}
          className="max-h-[600px] overflow-y-auto overflow-x-auto relative"
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-4)] uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-6 sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Account Name</th>
                <th className="py-3.5 px-6 sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Institution</th>
                <th className="py-3.5 px-6 sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Type</th>
                <th className="py-3.5 px-6 sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Source</th>
                <th className="py-3.5 px-6 text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Balance</th>
                <th className="py-3.5 px-6 text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[var(--text-3)]">
                    No accounts found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const isNeg = Number(acc.balance) < 0 || acc.type === 'credit';
                  const isMenuOpen = openRowMenuId === acc.id;
                  return (
                    <tr key={acc.id} className="odd:bg-[var(--surface)] even:bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] transition-colors group relative">
                      <td className="py-4 px-6 font-bold text-[var(--text-1)] flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: acc.color || '#8B5CF6' }}
                        >
                          {acc.institution?.[0] || 'A'}
                        </div>
                        <div>
                          <span className={`text-sm ${acc.isExcluded ? 'line-through opacity-60' : ''}`}>{acc.name}</span>
                          <div className="text-[10px] text-[var(--text-3)] font-normal flex items-center gap-1.5">
                            <span>Updated live via API</span>
                            {acc.isExcluded && <span className="text-amber-400 font-bold">· (Excluded)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[var(--text-2)] font-semibold">{acc.institution || 'Direct Bank'}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]">
                          {acc.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          {acc.source || 'Manual'}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-black text-sm ${isNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatMoney(acc.balance, 2)}
                      </td>
                      <td className="py-4 px-6 text-right relative row-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMenuOpen) {
                              setOpenRowMenuId(null);
                              setMenuPos(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setOpenRowMenuId(acc.id);
                              const menuWidth = 208;
                              let left = rect.right - menuWidth;
                              if (left < 12) left = 12;
                              if (left + menuWidth > window.innerWidth - 12) left = window.innerWidth - menuWidth - 12;
                              setMenuPos({ top: rect.bottom + 4, left: left });
                            }
                          }}
                          className="p-2 rounded-lg text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                          title="Account Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && menuPos && createPortal(
                          <div
                            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 999999 }}
                            className="w-52 rounded-xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                const updatedLinked = linked.map(a => a.id === acc.id ? { ...a, isExcluded: !a.isExcluded } : a);
                                setAccountsData(prev => ({ ...prev, linked: updatedLinked }));
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <span>{acc.isExcluded ? '📥 Include in Net Worth' : '📤 Exclude from Net Worth'}</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteAccount(acc.id);
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-3)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Account</span>
                            </button>
                          </div>,
                          document.body
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wealth Velocity & Net Worth Simulator (Positioned below accounts table) */}
      <div className="card p-6 space-y-5 bg-gradient-to-br from-[var(--surface)] to-indigo-500/10 border-indigo-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Wealth Velocity & Net Worth Simulator</h3>
              <p className="text-[10px] text-[var(--text-3)]">Project your future net worth based on monthly compounding savings (7% APY)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-2)]">Monthly Savings:</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[var(--accent)]">$</span>
                <input
                  type="number"
                  value={monthlySavingsInput}
                  onChange={(e) => setMonthlySavingsInput(Number(e.target.value) || 0)}
                  className="w-32 pl-7 pr-3 py-1.5 text-xs font-bold font-mono rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] text-right outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={monthlySavingsInput}
              onChange={(e) => setMonthlySavingsInput(Number(e.target.value))}
              className="w-full sm:w-40 h-2 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">1-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected1Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+7% compound projection</p>
          </div>
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">3-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected3Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+7% compound projection</p>
          </div>
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">5-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected5Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+7% compound projection</p>
          </div>
        </div>
      </div>
    </div>
  );
};
