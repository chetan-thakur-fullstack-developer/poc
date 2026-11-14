import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Header = () => {
  const {
    currentCurrency,
    setCurrentCurrency,
    theme,
    setTheme,
    openModal,
    isSyncing,
    lastSyncTime,
    syncToCloud
  } = useApp();

  const { user, isDemoUser, isCloudAuthAvailable } = useAuth();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('glass');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Title or Search Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden font-bold text-lg tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            EW
          </span>
          <span>Executive Wealth</span>
        </div>

        {/* ⌘K Command Palette Button */}
        <button
          onClick={() => openModal('commandMenu')}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search or jump to...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text-3)] border border-[var(--border)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Cloud Sync, Currency, Theme, Quick Add, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Cloud Sync Chip */}
        <button
          onClick={syncToCloud}
          disabled={isSyncing}
          title="Click to sync data with Supabase"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : isCloudAuthAvailable ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <span className="hidden md:inline">
            {isSyncing ? 'Syncing...' : isCloudAuthAvailable ? 'Supabase Connected' : 'Local / Demo Mode'}
          </span>
          <span className="text-[10px] text-[var(--text-3)] hidden lg:inline">
            {lastSyncTime ? `(${lastSyncTime})` : ''}
          </span>
        </button>

        {/* Currency Switcher */}
        <select
          value={currentCurrency}
          onChange={(e) => setCurrentCurrency(e.target.value)}
          className="px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] outline-none cursor-pointer hover:border-[var(--border-hover)]"
        >
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="GBP">£ GBP</option>
          <option value="INR">₹ INR</option>
          <option value="CAD">C$ CAD</option>
          <option value="AUD">A$ AUD</option>
        </select>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
          className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
        >
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🔮'}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => openModal('quickAdd')}
          className="btn-primary text-xs px-3 py-1.5"
        >
          <span className="text-base leading-none font-bold">+</span>
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* User Profile / Auth */}
        <button
          onClick={() => openModal('auth')}
          className="flex items-center gap-2 p-1 pl-2 rounded-full bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
        >
          {isDemoUser ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 hidden sm:inline">
              Demo Sandbox
            </span>
          ) : (
            <span className="text-xs font-medium max-w-[90px] truncate hidden sm:inline">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'}
            </span>
          )}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm ${
            isDemoUser ? 'bg-gradient-to-tr from-amber-500 to-orange-500' : 'bg-gradient-to-tr from-emerald-500 to-indigo-500'
          }`}>
            {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
          </div>
        </button>
      </div>
    </header>
  );
};
