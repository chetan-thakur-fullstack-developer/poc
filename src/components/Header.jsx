import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Bell, Plus, Sun, Moon, Sparkles } from 'lucide-react';

export const Header = () => {
  const {
    currentTab,
    currentCurrency,
    setCurrentCurrency,
    theme,
    setTheme,
    openModal,
    setCurrentTab,
    notifications,
    clearNotifications
  } = useApp();

  const { user, isDemoUser, signOut } = useAuth();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopover(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('glass');
    else setTheme('dark');
  };

  const TAB_TITLES = {
    'tab-dashboard': 'Household Dashboard',
    'tab-accounts': 'Linked Money Accounts',
    'tab-overview': 'Portfolio & Wealth Tracker',
    'tab-transactions': 'Transactions Ledger',
    'tab-expenses': 'Monthly Budget & Spending',
    'tab-goals': 'Household Goals & Milestones',
    'tab-tax': 'Tax Savings & Optimization',
    'tab-credit': 'Credit Health & FICO Score',
    'tab-blueprint': 'Calculators & FIRE Planning',
    'tab-pricing': 'Plans & Billing',
    'tab-settings': 'Settings & Cloud Sync'
  };

  const TAB_SUBTITLES = {
    'tab-dashboard': 'Overview of net worth, cash flow & recent activity',
    'tab-accounts': 'Manage checking, savings, investment & credit accounts',
    'tab-overview': 'Track asset allocation, performance & historical growth',
    'tab-transactions': 'Search, filter and analyze all household transactions',
    'tab-expenses': 'Monitor monthly budgets, spending categories & trends',
    'tab-goals': 'Set and track financial milestones and target dates',
    'tab-tax': 'Estimate tax brackets, deductions and optimize withholdings',
    'tab-credit': 'Monitor credit score factors, utilization and reports',
    'tab-blueprint': 'Interactive paystub, retirement, mortgage & FIRE models',
    'tab-pricing': 'Manage subscription tier, billing and enterprise access',
    'tab-settings': 'Configure currency, profile, security and cloud sync'
  };

  const activeTitle = TAB_TITLES[currentTab] || 'Dashboard';
  const activeSubtitle = TAB_SUBTITLES[currentTab] || 'Manage your financial life';

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border)] bg-[var(--surface)]/75 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Active Section Title & Subheading */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 lg:hidden font-black text-base tracking-tight">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-md">
            LJ
          </span>
          <span>LedgerJourney</span>
        </div>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-xs sm:text-sm font-extrabold text-[var(--text-1)] tracking-tight leading-tight">
            {activeTitle}
          </h2>
          <p className="text-[10px] font-medium text-[var(--text-3)] leading-none mt-0.5">
            {activeSubtitle}
          </p>
        </div>
      </div>

      {/* Right Minimal Controls */}
      <div className="flex items-center gap-2.5">
        {/* Demo Mode Badge */}
        {isDemoUser && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Demo Mode</span>
            <button onClick={signOut} className="text-[10px] underline ml-1 hover:text-white cursor-pointer font-bold">Exit</button>
          </div>
        )}

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={`Theme: ${theme.toUpperCase()}`}
          className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer active:scale-95 shadow-sm flex items-center justify-center"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => openModal('quickAdd')}
          className="btn-primary text-xs px-3.5 py-1.5 shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline font-semibold">New</span>
        </button>

        {/* Notification Bell & Popover (Second Last) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer active:scale-95 shadow-sm relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 max-w-sm rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-[var(--text-1)]">Notifications</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 font-mono">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] font-bold text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-3)]">
                    <Sparkles className="w-6 h-6 mx-auto mb-1 text-[var(--text-4)]" />
                    <p className="font-bold text-[var(--text-1)]">All caught up</p>
                    <p className="text-[10px] text-[var(--text-4)] mt-0.5">Important alerts and reminders will appear here.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3.5 hover:bg-[var(--surface)] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--text-1)]">{n.title}</p>
                        <span className="text-[9px] font-mono text-[var(--text-4)] shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-2)] mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Settings Shortcut (Last) */}
        <button
          onClick={() => setCurrentTab('tab-settings')}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer"
          title="Open Settings & Profile"
        >
          {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
        </button>
      </div>
    </header>
  );
};
