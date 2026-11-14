import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const AccountsTab = () => {
  const { accountsData, formatMoney, openModal, deleteAccount, syncToCloud } = useApp();
  const linked = accountsData?.linked || [];

  // Group by account type
  const checkingTotal = linked
    .filter(a => a.type === 'checking')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const investmentTotal = linked
    .filter(a => a.type === 'investment' || a.type === 'retirement')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const creditTotal = linked
    .filter(a => a.type === 'credit')
    .reduce((s, a) => s + (Number(a.balance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Linked Money Accounts</h2>
          <p className="text-xs text-[var(--text-3)]">
            Manage your depository accounts, credit lines, and investment balances.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={syncToCloud}
            className="btn-secondary text-xs px-3 py-2 cursor-pointer"
          >
            Sync with Supabase
          </button>
          <button
            onClick={() => openModal('addAccount')}
            className="btn-primary text-xs px-4 py-2 cursor-pointer"
          >
            + Link Account
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Cash & Depository</span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">
            {formatMoney(checkingTotal)}
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Investments & 401(k)</span>
          <p className="text-xl font-black font-mono text-purple-400 mt-1">
            {formatMoney(investmentTotal)}
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Credit Card Balance</span>
          <p className="text-xl font-black font-mono text-rose-400 mt-1">
            {formatMoney(creditTotal)}
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">All Accounts ({linked.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linked.map(account => (
            <div
              key={account.id}
              className="card-inner p-4 flex flex-col justify-between hover:border-[var(--border-hover)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                    style={{ backgroundColor: account.color || '#8B5CF6' }}
                  >
                    {account.institution?.[0] || 'B'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-1)]">{account.name}</h4>
                    <p className="text-[11px] text-[var(--text-3)] font-medium">
                      {account.institution} · •••• {account.mask}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteAccount(account.id)}
                  title="Remove account"
                  className="text-xs text-[var(--text-3)] hover:text-rose-400 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--text-2)]">
                    {account.type}
                  </span>
                  {account.mapping?.portfolioKey && (
                    <span className="ml-2 text-[10px] text-purple-400 font-mono">
                      ↳ maps to {account.mapping.portfolioKey}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-[var(--text-1)]">
                    {formatMoney(account.balance, 2)}
                  </p>
                  <p className="text-[9px] text-emerald-400">
                    Synced {account.lastSynced ? new Date(account.lastSynced).toLocaleDateString() : 'Active'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
