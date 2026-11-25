import React, { useState } from 'react';
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
  Menu,
  X,
  Search,
  Plus,
  LogOut
} from 'lucide-react';

export const MobileNav = () => {
  const { currentTab, setCurrentTab, openModal, accountsData, transactions } = useApp();
  const { signOut } = useAuth();
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);

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
      {/* Bottom Sticky Mobile Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('tab-dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'tab-dashboard' ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('tab-accounts')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
            ['tab-accounts', 'tab-overview', 'tab-transactions'].includes(currentTab) ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Money</span>
        </button>

        {/* Floating Center Add Button */}
        <button
          onClick={() => openModal('quickAdd')}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 transition-transform"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setCurrentTab('tab-expenses')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
            ['tab-expenses', 'tab-goals', 'tab-tax', 'tab-credit', 'tab-blueprint'].includes(currentTab) ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Budget</span>
        </button>

        <button
          onClick={() => setShowMenuDrawer(true)}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
            showMenuDrawer || ['tab-pricing', 'tab-settings'].includes(currentTab) ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Full Menu Drawer for Mobile */}
      {showMenuDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
                  LJ
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-1)]">LedgerJourney Menus</h3>
                  <p className="text-[10px] text-[var(--text-3)]">Select any section to navigate</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenuDrawer(false)}
                className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search */}
            <div>
              <button
                onClick={() => {
                  setShowMenuDrawer(false);
                  openModal('commandMenu');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 opacity-60" />
                  <span>Search commands or items...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text-3)] border border-[var(--border)]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-5">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                    {sec.title}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {sec.items.map(item => {
                      const isActive = currentTab === item.id;
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#8B5CF6]/15 text-purple-400 border border-[#8B5CF6]/30 shadow-sm'
                              : 'text-[var(--text-2)] bg-[var(--surface)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] border border-[var(--border)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'opacity-70'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)]">
                              {item.badge}
                            </span>
                          )}
                          {item.tag && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.tag}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign Out Button at Bottom */}
            <div className="pt-3 pb-8 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setShowMenuDrawer(false);
                  if (confirm('Sign out of your session?')) {
                    signOut();
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm"
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
