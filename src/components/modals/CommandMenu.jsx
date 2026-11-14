import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const CommandMenu = () => {
  const { modals, closeModal, setCurrentTab, openModal, syncToCloud } = useApp();
  const [query, setQuery] = useState('');

  if (!modals.commandMenu) return null;

  const actions = [
    { label: 'Go to Dashboard', icon: '📊', tab: 'tab-dashboard' },
    { label: 'Go to Accounts', icon: '💳', tab: 'tab-accounts' },
    { label: 'Go to Portfolio Tracking', icon: '📈', tab: 'tab-overview' },
    { label: 'Go to Transactions Ledger', icon: '🔄', tab: 'tab-transactions' },
    { label: 'Go to Budget & Expenses', icon: '💰', tab: 'tab-expenses' },
    { label: 'Go to Financial Goals', icon: '🎯', tab: 'tab-goals' },
    { label: 'Go to Tax Savings', icon: '⚖️', tab: 'tab-tax' },
    { label: 'Go to Credit Health', icon: '🛡️', tab: 'tab-credit' },
    { label: 'Go to FIRE & Calculators', icon: '⚡', tab: 'tab-blueprint' },
    { label: 'Go to Settings & Cloud Sync', icon: '⚙️', tab: 'tab-settings' },
    { label: 'Record New Transaction', icon: '➕', action: () => openModal('addTx') },
    { label: 'Link New Account', icon: '🏦', action: () => openModal('addAccount') },
    { label: 'Synchronize All Data to Cloud', icon: '☁️', action: () => syncToCloud() }
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    closeModal('commandMenu');
    setQuery('');
    if (item.tab) setCurrentTab(item.tab);
    if (item.action) item.action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[var(--border)] flex items-center gap-3">
          <span className="text-base text-[var(--text-3)]">🔍</span>
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]"
          />
          <button
            onClick={() => closeModal('commandMenu')}
            className="text-xs px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--text-3)] hover:text-[var(--text-1)]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-3)]">
              No matching actions found
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors text-left cursor-pointer"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
