import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Wallet,
  Target,
  ArrowLeftRight,
  Calculator,
  ShieldCheck,
  Zap,
  Gem,
  Settings,
  X,
  Search,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const BottomNav = () => {
  const { currentTab, setCurrentTab, openModal, accountsData, transactions, showMenuDrawer, setShowMenuDrawer } = useApp();
  const { signOut } = useAuth();

  const accountCount = accountsData?.linked?.length || 0;
  const txCount = transactions?.length || 0;

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

  const handleSelectTab = (id) => {
    setCurrentTab(id);
    setShowMenuDrawer(false);
  };

  return (
    <>
      {/* Mobile Bottom Tab Bar (Taller height & extra bottom safe-area padding for curved screens) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-2xl border-t border-[var(--border)] px-1 sm:px-4 py-3 shadow-2xl select-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 2rem) + 0.75rem)' }}
      >
        <div className="flex items-center justify-around w-full max-w-lg mx-auto">
          <button
            onClick={() => setCurrentTab('tab-dashboard')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-dashboard' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentTab('tab-accounts')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-accounts' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            <span>Accounts</span>
          </button>

          <button
            onClick={() => setCurrentTab('tab-overview')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-overview' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <TrendingUp className="w-5 h-5 shrink-0" />
            <span>Portfolio</span>
          </button>

          <button
            onClick={() => setCurrentTab('tab-transactions')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-transactions' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 shrink-0" />
            <span>Txns</span>
          </button>

          <button
            onClick={() => setCurrentTab('tab-expenses')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-expenses' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <Wallet className="w-5 h-5 shrink-0" />
            <span>Budget</span>
          </button>

          <button
            onClick={() => setCurrentTab('tab-goals')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[40px] min-h-[48px] px-1.5 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              currentTab === 'tab-goals' ? 'text-emerald-400 font-black scale-105' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            <Target className="w-5 h-5 shrink-0" />
            <span>Goals</span>
          </button>
        </div>
      </nav>

      {/* Hamburger Menu Drawer */}
      {showMenuDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200 select-none">
          <div
            className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-32 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 2rem) + 6rem)' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
                  LJ
                </div>
                <div>
                  <h3 className="font-black text-sm text-[var(--text-1)]">LedgerJourney Navigation</h3>
                  <p className="text-[10px] text-[var(--text-3)]">All tabs, calculators, tax &amp; settings</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenuDrawer(false)}
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Command Search Button */}
            <div>
              <button
                onClick={() => {
                  setShowMenuDrawer(false);
                  openModal('commandMenu');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Search commands, accounts, calculators...</span>
                </div>
                <kbd className="px-2 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text-3)] border border-[var(--border)]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-5">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="px-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-4)]">
                    {sec.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {sec.items.map(item => {
                      const isActive = currentTab === item.id;
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                              : 'text-[var(--text-2)] bg-[var(--surface)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] border border-[var(--border)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'opacity-70'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] font-bold">
                                {item.badge}
                              </span>
                            )}
                            {item.tag && (
                              <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {item.tag}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign Out Button */}
            <div className="pt-3 pb-6 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setShowMenuDrawer(false);
                  if (confirm('Sign out of your session?')) {
                    signOut();
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
