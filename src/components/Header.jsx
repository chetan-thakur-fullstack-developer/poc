import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Bell, Plus, ChevronDown, Sparkles, Search, Sun, Moon, Settings, LogOut, Menu } from 'lucide-react';

export const Header = () => {
  const {
    currentTab,
    openModal,
    setShowCreateModal,
    setCurrentTab,
    notifications,
    clearNotifications,
    privacyMask,
    setPrivacyMask,
    showToast,
    theme,
    setTheme,
    loadDemoTemplate,
    resetToCleanWorkspace,
    showConfirmModal,
    showMenuDrawer,
    setShowMenuDrawer
  } = useApp();

  const { user, isDemoUser, signOut } = useAuth();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const notifRef = useRef(null);
  const newDropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopover(false);
      }
      if (newDropdownRef.current && !newDropdownRef.current.contains(e.target)) {
        setShowNewDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfilePopover(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all gap-2 sm:gap-4 select-none">
      {/* Left: Active Section Title & Subheading (Hamburger menu only visible on mobile lg:hidden) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setShowMenuDrawer(!showMenuDrawer)}
          className="lg:hidden min-w-[40px] min-h-[40px] p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden font-black text-base tracking-tight">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
            LJ
          </span>
          <span className="hidden md:inline">LedgerJourney</span>
        </div>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-xs sm:text-sm font-black text-[var(--text-1)] tracking-tight leading-tight">
            {activeTitle}
          </h2>
          <p className="text-[10px] font-medium text-[var(--text-3)] leading-none mt-0.5">
            {activeSubtitle}
          </p>
        </div>
      </div>

      {/* Middle: SaaS Standard Search Bar / Cmd+K Trigger (Initial desktop search bar) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => openModal('commandMenu')}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[var(--text-4)] group-hover:text-[var(--accent)] transition-colors" />
            <span className="text-xs font-medium">Search accounts, transactions, calculators...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono font-bold text-[var(--text-3)] shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Minimal Controls & Global Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Privacy Shield Active Badge */}
        {privacyMask && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <span>🛡️ Privacy Shield Active</span>
            <button
              onClick={() => {
                setPrivacyMask(false);
                showToast('Privacy mask disabled', 'info');
              }}
              className="text-[10px] underline ml-1 hover:text-white cursor-pointer font-bold"
            >
              Reveal
            </button>
          </div>
        )}

        {/* Global Quick Add Dropdown Menu ("+ New ▾") */}
        <div className="relative" ref={newDropdownRef}>
          <button
            onClick={() => setShowNewDropdown(!showNewDropdown)}
            className="btn-primary text-xs px-3.5 py-2 shadow-sm cursor-pointer flex items-center gap-1.5 font-bold min-h-[44px] md:min-h-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showNewDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showNewDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-4)] border-b border-[var(--border)]">
                Quick Actions
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    openModal('addTx');
                    setShowNewDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">💸</span>
                  <span>Record Transaction</span>
                </button>
                <button
                  onClick={() => {
                    openModal('addAccount');
                    setShowNewDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs">🏦</span>
                  <span>Link Account</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setShowNewDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs">🎯</span>
                  <span>Create Goal</span>
                </button>
                <button
                  onClick={() => {
                    openModal('quickAdd');
                    setShowNewDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs">⚡</span>
                  <span>Quick Add Wizard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer active:scale-95 shadow-sm relative"
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

        {/* Profile Avatar & Profile Popover Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfilePopover(!showProfilePopover)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer"
            title="Open Profile & Menu"
          >
            {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
          </button>

          {showProfilePopover && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-[var(--border)]">
                <p className="text-xs font-black text-[var(--text-1)]">{isDemoUser ? 'Demo Household' : (user?.user_metadata?.full_name || 'Household User')}</p>
                <p className="text-[10px] text-[var(--text-3)] font-mono truncate mt-0.5">{user?.email || 'demo@ledgerjourney.app'}</p>
              </div>

              {/* Theme Switcher Section */}
              <div className="p-2 border-b border-[var(--border)]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-4)] mb-2 px-1">
                  Appearance Theme
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      theme === 'light' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs' : 'bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-[10px]">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-xs' : 'bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-[10px]">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('glass')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      theme === 'glass' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-xs' : 'bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px]">Glass</span>
                  </button>
                </div>
              </div>

              {/* Actions & Settings */}
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    loadDemoTemplate();
                    setShowProfilePopover(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">📥</span>
                  <span>Load Sample Data</span>
                </button>
                <button
                  onClick={() => {
                    showConfirmModal({
                      title: 'Reset Workspace to Clean Slate',
                      message: 'Are you sure you want to reset your workspace? All custom accounts, transactions, and data will be permanently cleared.',
                      confirmText: 'Reset Workspace',
                      isDanger: true,
                      onConfirm: () => {
                        resetToCleanWorkspace();
                        setShowProfilePopover(false);
                      }
                    });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs">🔄</span>
                  <span>Reset Workspace</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('tab-settings');
                    setShowProfilePopover(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left border-t border-[var(--border)] mt-1 pt-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--text-3)]" />
                  <span>Settings & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Sign out of your session?')) {
                      signOut();
                    }
                    setShowProfilePopover(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left border-t border-[var(--border)] mt-1 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
