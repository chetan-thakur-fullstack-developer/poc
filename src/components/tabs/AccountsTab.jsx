import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { Plus, Link2, Layers, TrendingUp, TrendingDown, Pencil, AlertCircle, ShieldCheck, Sparkles, Zap, Trash2, MoreVertical, X, Check } from 'lucide-react';

export const AccountsTab = () => {
  const { accountsData, setAccountsData, transactions, formatMoney, openModal, deleteAccount, syncToCloud, isSyncing, showToast } = useApp();
  const [filter, setFilter] = useState('all');
  const [monthlySavingsInput, setMonthlySavingsInput] = useState(1500);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  // Mobile Edit Account Bottom Sheet State
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccName, setEditAccName] = useState('');
  const [editAccBalance, setEditAccBalance] = useState('');

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      if (openRowMenuId && target && !target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
        setMenuPos(null);
      }
    };
    const handleScroll = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      if (target?.closest('.row-menu-container')) {
        return;
      }
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

  // Dynamic Monthly Change calculation from transactions in current month
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyChange = (transactions || [])
    .filter(t => !t.isExcluded && t.date?.startsWith(currentMonthPrefix))
    .reduce((sum, t) => {
      const amt = Number(t.amount) || 0;
      const isExp = t.isExpense !== undefined ? t.isExpense : (amt >= 0);
      return isExp ? sum - amt : sum + Math.abs(amt);
    }, 0);

  // Dynamic APY & Health Status based on assets
  const effectiveAPY = totalAssets > 0 ? 7.0 : 0.0;
  const debtToAssetRatio = totalAssets > 0 ? ((Math.abs(totalLiab) / totalAssets) * 100).toFixed(1) : '0';
  const healthStatus = linked.length === 0 ? 'Clean Slate — Ready' : Number(debtToAssetRatio) < 30 ? 'Strong Financial Health' : 'Moderate Leverage';

  // 1-Year, 3-Year, 5-Year Net Worth Projection based on monthly savings
  const projected1Yr = netWorth + monthlySavingsInput * 12 * (1 + effectiveAPY / 100);
  const projected3Yr = netWorth + monthlySavingsInput * 36 * (1 + effectiveAPY / 100);
  const projected5Yr = netWorth + monthlySavingsInput * 60 * (1 + effectiveAPY / 100);

  const handleSaveAccountEdit = (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    const updatedLinked = linked.map(a => a.id === editingAccount.id ? {
      ...a,
      name: editAccName || a.name,
      balance: parseFloat(editAccBalance) || 0
    } : a);
    setAccountsData(prev => ({ ...prev, linked: updatedLinked }));
    showToast(`Account "${editAccName}" updated successfully`, 'success');
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none relative">
      {/* =========================================================
         DESKTOP VIEW: Balanced 3-Column Hero Section
         ========================================================= */}
      <div className="hidden lg:grid grid-cols-3 gap-6 card p-6 sm:p-8 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-emerald-500/10 border border-emerald-500/25 shadow-xl items-center">
        {/* Column 1: Net Worth Hero */}
        <div className="space-y-2 border-r border-[var(--border)] pr-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
            Total Household Net Worth
          </span>
          <div className="text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-1)] font-mono my-1">
            <AnimatedNumber value={netWorth} />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>{monthlyChange >= 0 ? '▲ +' : '▼ '}{formatMoney(monthlyChange)} this month</span>
            <span className="text-[var(--text-4)]">•</span>
            <span className="text-[var(--text-3)]">{linked.length} accounts</span>
          </div>
        </div>

        {/* Column 2: Assets & Liabilities Breakdown with Segmented Bar */}
        <div className="space-y-3 border-r border-[var(--border)] pr-6 pl-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
            Asset vs Liability Split
          </span>
          <div className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Assets: <strong className="font-mono">{formatMoney(totalAssets)}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              Liabilities: <strong className="font-mono">{formatMoney(Math.abs(totalLiab))}</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-[var(--surface-3)] shadow-inner w-full">
            <div
              className="h-full bg-emerald-500 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, Math.min(96, (totalAssets / (totalAssets + Math.abs(totalLiab) || 1)) * 100))}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, Math.min(96, (Math.abs(totalLiab) / (totalAssets + Math.abs(totalLiab) || 1)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Column 3: Financial Health & Velocity Context */}
        <div className="space-y-2 pl-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
            Health Ratio &amp; Velocity
          </span>
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-1)]">
            <span>Debt-to-Asset Ratio:</span>
            <span className="font-mono text-emerald-400">
              {debtToAssetRatio}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-1)]">
            <span>Annual Compounding APY:</span>
            <span className="font-mono text-purple-400">{effectiveAPY.toFixed(1)}%</span>
          </div>
          <p className="text-[10px] text-[var(--text-3)] pt-1">
            Status: <strong className="text-emerald-400">{healthStatus}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================
         MOBILE VIEW: Streamlined Single Hero Card
         ========================================================= */}
      <div className="block lg:hidden card p-6 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-emerald-500/10 border border-emerald-500/25 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
              Total Household Net Worth
            </span>
            <div className="text-3xl font-black tracking-tight text-[var(--text-1)] font-mono my-1.5">
              <AnimatedNumber value={netWorth} />
            </div>
            <p className="text-xs font-semibold text-[var(--text-3)]">
              Aggregated across {linked.length} linked accounts &amp; assets
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Assets: {formatMoney(totalAssets)}
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              Liabilities: {formatMoney(Math.abs(totalLiab))}
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-[var(--surface-3)] shadow-inner">
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

      {/* Filters: Horizontally scrollable pill menu on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="overflow-x-auto flex flex-nowrap gap-2 py-1 scrollbar-none whitespace-nowrap">
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
                className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] shrink-0 ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-md font-bold'
                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Add Account Button (Hidden on Mobile since FAB is used) */}
        <button
          onClick={() => openModal('addAccount')}
          className="hidden sm:flex btn-primary text-xs px-4 py-2.5 cursor-pointer items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Account List: Stacked Card List Item on Mobile (with tap-to-edit), Table on Desktop */}
      <div className="card overflow-visible">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Linked Accounts &amp; Assets ({filteredAccounts.length})
          </h3>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-3)]">
            <div className="max-w-xs mx-auto space-y-1.5 px-4">
              <p className="font-bold text-[var(--text-1)] text-sm">No accounts linked yet</p>
              <p className="text-xs text-[var(--text-3)] leading-relaxed">
                Link your bank accounts, investment portfolios, or credit cards using the "+ Add Account" button below.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Stacked Card List Items (Tap to open Edit Bottom Sheet) */}
            <div className="block lg:hidden divide-y divide-[var(--border)] p-3 space-y-2.5">
              {filteredAccounts.map(acc => {
                const isNeg = Number(acc.balance) < 0 || acc.type === 'credit';
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setEditingAccount(acc);
                      setEditAccName(acc.name);
                      setEditAccBalance(acc.balance);
                    }}
                    className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2 shadow-sm cursor-pointer hover:border-emerald-500/50 transition-all active:scale-[0.99]"
                  >
                    {/* Top Row: Icon + Account Name + Balance (right-aligned) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: acc.color || '#8B5CF6' }}
                        >
                          {acc.institution?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold text-[var(--text-1)] truncate ${acc.isExcluded ? 'line-through opacity-60' : ''}`}>
                            {acc.name}
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">Tap to edit details &amp; actions</span>
                        </div>
                      </div>
                      <div className={`font-mono font-black text-sm shrink-0 ${isNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatMoney(acc.balance, 2)}
                      </div>
                    </div>

                    {/* Bottom Row: Institution, Type, and Source badge */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[11px] text-[var(--text-3)]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-[var(--text-2)]">{acc.institution || 'Direct Bank'}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)]">
                          {acc.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                          {acc.source === 'plaid' ? 'Plaid' : (acc.source || 'Manual')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAccount(acc.id);
                          }}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Remove Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div
              onScroll={() => {
                setOpenRowMenuId(null);
                setMenuPos(null);
              }}
              className="hidden lg:block max-h-[600px] overflow-y-auto overflow-x-auto relative"
            >
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-4)] uppercase tracking-wider text-[10px] font-extrabold">
                    <th className="py-3.5 px-6 sticky-th">Account Name</th>
                    <th className="py-3.5 px-6 sticky-th">Institution</th>
                    <th className="py-3.5 px-6 sticky-th">Type</th>
                    <th className="py-3.5 px-6 sticky-th">Source</th>
                    <th className="py-3.5 px-6 text-right sticky-th">Balance</th>
                    <th className="py-3.5 px-6 text-right sticky-th">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredAccounts.map(acc => {
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
                              className="w-52 rounded-xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto"
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
                            document.getElementById('portal-root') || document.body
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Wealth Velocity & Net Worth Simulator */}
      <div className="card p-6 space-y-5 bg-gradient-to-br from-[var(--surface)] to-indigo-500/10 border-indigo-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">Wealth Velocity &amp; Net Worth Simulator</h3>
              <p className="text-[10px] text-[var(--text-3)]">Project your future net worth based on monthly compounding savings ({effectiveAPY.toFixed(1)}% APY)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-2">
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
          </div>
        </div>

        {/* Full-width slider for easy thumb control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-3)]">
            <span>$100/mo</span>
            <span>$5,000/mo</span>
            <span>$10,000/mo</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={monthlySavingsInput}
            onChange={(e) => setMonthlySavingsInput(Number(e.target.value))}
            className="w-full h-3 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
          />
        </div>

        {/* 1/3/5 Year Projections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">1-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected1Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+{effectiveAPY.toFixed(1)}% compound projection</p>
          </div>
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">3-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected3Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+{effectiveAPY.toFixed(1)}% compound projection</p>
          </div>
          <div className="card-inner p-4 space-y-1 border border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-4)]">5-Year Horizon</span>
            <div className="text-lg font-black font-mono text-emerald-400">{formatMoney(projected5Yr)}</div>
            <p className="text-[10px] text-[var(--text-3)]">+{effectiveAPY.toFixed(1)}% compound projection</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for "+ Add Account" at bottom right on mobile */}
      <button
        onClick={() => openModal('addAccount')}
        className="sm:hidden fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-2xl shadow-emerald-500/50 cursor-pointer active:scale-95 transition-transform"
        title="Add Account"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Mobile Edit Account Bottom Sheet Modal */}
      {editingAccount && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200 select-none">
          <form
            onSubmit={handleSaveAccountEdit}
            className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 1rem) + 2rem)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{ backgroundColor: editingAccount.color || '#8B5CF6' }}
                >
                  {editingAccount.institution?.[0] || 'A'}
                </div>
                <div>
                  <h3 className="font-black text-sm text-[var(--text-1)]">Edit Account Details</h3>
                  <p className="text-[10px] text-[var(--text-3)]">{editingAccount.institution || 'Direct Bank'} • {editingAccount.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)] block mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={editAccName}
                  onChange={(e) => setEditAccName(e.target.value)}
                  className="input-field text-xs py-3 w-full"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)] block mb-1">
                  Account Balance ($)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editAccBalance}
                  onChange={(e) => setEditAccBalance(e.target.value)}
                  className="input-field text-xs py-3 w-full font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div>
                  <p className="text-xs font-bold text-[var(--text-1)]">Exclude from Net Worth</p>
                  <p className="text-[10px] text-[var(--text-3)]">Hide this account balance from your totals</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingAccount.isExcluded)}
                  onChange={(e) => {
                    const isEx = e.target.checked;
                    setAccountsData(prev => ({
                      ...prev,
                      linked: prev.linked.map(a => a.id === editingAccount.id ? { ...a, isExcluded: isEx } : a)
                    }));
                    setEditingAccount(prev => ({ ...prev, isExcluded: isEx }));
                  }}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  deleteAccount(editingAccount.id);
                  setEditingAccount(null);
                }}
                className="btn-secondary text-xs px-4 py-3 text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Remove Account
              </button>
              <button
                type="submit"
                className="btn-primary text-xs flex-1 py-3 cursor-pointer font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
