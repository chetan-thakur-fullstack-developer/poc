import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  Target,
  Calculator,
  ShieldCheck,
  Zap,
  Gem,
  Settings,
  ChevronUp,
  LogOut,
  Sparkles,
  Search
} from 'lucide-react';

export const Sidebar = () => {
  const { currentTab, setCurrentTab, accountsData, transactions, openModal } = useApp();
  const { user, isDemoUser, signOut } = useAuth();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  const accountCount = accountsData?.linked?.length || 0;
  const txCount = transactions?.length || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navSections = [
    {
      title: 'Home',
      items: [
        { id: 'tab-dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Money',
      items: [
        { id: 'tab-accounts', label: 'Accounts', icon: CreditCard, badge: accountCount },
        { id: 'tab-overview', label: 'Portfolio', icon: TrendingUp },
        { id: 'tab-transactions', label: 'Transactions', icon: ArrowLeftRight, badge: txCount }
      ]
    },
    {
      title: 'Planning',
      items: [
        { id: 'tab-expenses', label: 'Budget & Spend', icon: Wallet },
        { id: 'tab-goals', label: 'Goals', icon: Target },
        { id: 'tab-tax', label: 'Tax Savings', icon: Calculator },
        { id: 'tab-credit', label: 'Credit Health', icon: ShieldCheck },
        { id: 'tab-blueprint', label: 'Calculators & FIRE', icon: Zap }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'tab-pricing', label: 'Plans & Billing', icon: Gem, tag: 'PRO' },
        { id: 'tab-settings', label: 'Settings & Cloud', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
          LJ
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-[var(--text-1)]">LedgerJourney</h1>
          <p className="text-[10px] text-[var(--text-3)] font-medium">Personal Finance OS</p>
        </div>
      </div>

      {/* Quick Search Bar in Sidebar */}
      <div className="px-4 pt-4">
        <button
          onClick={() => openModal('commandMenu')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 opacity-60" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text-3)] border border-[var(--border)]">
            ⌘K
          </kbd>
        </button>
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
              const IconComponent = item.icon;
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
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'opacity-70'}`} />
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

      {/* User / Household Footer with Interactive Popover */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)]/50 space-y-2.5 relative" ref={popoverRef}>
        {/* Take a Tour Button */}
        <button
          onClick={() => openModal('tour')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">Take a tour</span>
        </button>

        {showPopover && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[var(--text-1)] truncate">
                  {user?.user_metadata?.full_name || (isDemoUser ? 'Demo Household' : 'Executive Member')}
                </p>
                <p className="text-[10px] text-[var(--text-3)] truncate">
                  {user?.email || 'executive@wealth.os'}
                </p>
              </div>
            </div>

            <div className="py-1 space-y-0.5">
              <button
                onClick={() => { setCurrentTab('tab-pricing'); setShowPopover(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <span>Plans & Billing</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">PRO</span>
              </button>

              <button
                onClick={() => { setCurrentTab('tab-settings'); setShowPopover(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Settings & Security</span>
              </button>
            </div>

            <div className="pt-1 mt-1 border-t border-[var(--border)]">
              <button
                onClick={() => { signOut(); setShowPopover(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isDemoUser ? 'Exit Demo Session' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowPopover(!showPopover)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30 shrink-0">
              {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[var(--text-1)] truncate">
                {user?.user_metadata?.full_name || (isDemoUser ? 'Demo Household' : 'Executive User')}
              </p>
              <p className="text-[10px] text-[var(--text-3)] truncate">
                {user?.email || 'executive@wealth.os'}
              </p>
            </div>
          </div>
          <ChevronUp className={`w-3.5 h-3.5 text-[var(--text-3)] transition-transform ${showPopover ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
};
