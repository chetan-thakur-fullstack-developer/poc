import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = () => {
  const { currentTab, setCurrentTab, accountsData, transactions } = useApp();
  const { user, isDemoUser } = useAuth();

  const accountCount = accountsData?.linked?.length || 0;
  const txCount = transactions?.length || 0;

  const navSections = [
    {
      title: 'Home',
      items: [
        { id: 'tab-dashboard', label: 'Dashboard', icon: '📊' }
      ]
    },
    {
      title: 'Money',
      items: [
        { id: 'tab-accounts', label: 'Accounts', icon: '💳', badge: accountCount },
        { id: 'tab-overview', label: 'Portfolio', icon: '📈' },
        { id: 'tab-transactions', label: 'Transactions', icon: '🔄', badge: txCount }
      ]
    },
    {
      title: 'Planning',
      items: [
        { id: 'tab-expenses', label: 'Budget & Spend', icon: '💰' },
        { id: 'tab-goals', label: 'Goals', icon: '🎯' },
        { id: 'tab-tax', label: 'Tax Savings', icon: '⚖️' },
        { id: 'tab-credit', label: 'Credit Health', icon: '🛡️' },
        { id: 'tab-blueprint', label: 'Calculators & FIRE', icon: '⚡' }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'tab-pricing', label: 'Plans & Billing', icon: '💎', tag: 'PRO' },
        { id: 'tab-settings', label: 'Settings & Cloud', icon: '⚙️' }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
          EW
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-[var(--text-1)]">Executive Wealth</h1>
          <p className="text-[10px] text-[var(--text-3)] font-medium">Personal Finance OS</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              {sec.title}
            </div>
            {sec.items.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--surface-3)] text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)]">
                      {item.badge}
                    </span>
                  )}
                  {item.tag && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Household Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30">
            {(user?.user_metadata?.full_name || user?.email || 'U')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-1)] truncate">
              {user?.user_metadata?.full_name || 'Primary Member'}
            </p>
            <p className="text-[10px] text-[var(--text-3)] truncate">
              {user?.email || 'Executive Household'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
