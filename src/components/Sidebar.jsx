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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Search
} from 'lucide-react';

export const Sidebar = () => {
  const { currentTab, setCurrentTab, accountsData, transactions, openModal } = useApp();
  const { user, isDemoUser, signOut } = useAuth();
  const [showPopover, setShowPopover] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('ew_sidebar_collapsed') === 'true';
  });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredY, setHoveredY] = useState(0);
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
    <aside className={`transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} shrink-0 hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] select-none z-50 relative`}>
      {/* Brand Header */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-center lg:justify-start border-b border-[var(--border)]">
        <div
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
              localStorage.setItem('ew_sidebar_collapsed', 'false');
            }
          }}
          className="flex items-center gap-3 min-w-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 shrink-0">
            LJ
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-[var(--text-1)] truncate">LedgerJourney</h1>
              <p className="text-[10px] text-[var(--text-3)] font-medium">Personal Finance OS</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Search Bar in Sidebar */}
      <div className="px-3 pt-4">
        <button
          onClick={() => openModal('commandMenu')}
          onMouseEnter={(e) => {
            if (isCollapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem('Search (⌘K)');
              setHoveredY(rect.top + rect.height / 2);
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm relative`}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 opacity-60 shrink-0" />
            {!isCollapsed && <span className="truncate">Search or jump to...</span>}
          </div>
          {!isCollapsed && (
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text-3)] border border-[var(--border)]">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                {sec.title}
              </div>
            )}
            {sec.items.map(item => {
              const isActive = currentTab === item.id;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem(item.label);
                      setHoveredY(rect.top + rect.height / 2);
                    }
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[var(--surface-3)] text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'opacity-70'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {!isCollapsed && item.tag && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-[var(--border)]">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Household Footer & Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)]/50 space-y-2.5 relative" ref={popoverRef}>
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            localStorage.setItem('ew_sidebar_collapsed', String(next));
          }}
          onMouseEnter={(e) => {
            if (isCollapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem('Expand menu');
              setHoveredY(rect.top + rect.height / 2);
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm relative`}
        >
          <div className="flex items-center gap-2 truncate">
            {isCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <><ChevronLeft className="w-4 h-4 shrink-0" /><span className="truncate">Collapse Menu</span></>}
          </div>
        </button>

        {!isCollapsed && (
          <button
            onClick={() => openModal('tour')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Take a tour</span>
          </button>
        )}

        {showPopover && (
          <div className="fixed bottom-20 left-4 z-[200] w-64 p-2 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
          onMouseEnter={(e) => {
            if (isCollapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem(user?.user_metadata?.full_name || 'User Profile');
              setHoveredY(rect.top + rect.height / 2);
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2'} rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm relative`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30 shrink-0 shadow-sm">
              {isDemoUser ? 'D' : (user?.user_metadata?.full_name || user?.email || 'U')[0]}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-[var(--text-1)] truncate">
                  {user?.user_metadata?.full_name || (isDemoUser ? 'Demo Household' : 'Executive User')}
                </p>
                <p className="text-[10px] text-[var(--text-3)] truncate">
                  {user?.email || 'executive@wealth.os'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronUp className={`w-3.5 h-3.5 text-[var(--text-3)] transition-transform ${showPopover ? 'rotate-180' : ''}`} />}
        </button>
      </div>

      {/* Global State-Driven Floating Tooltip (Bypasses container overflow clipping) */}
      {hoveredItem && isCollapsed && (
        <div
          className="fixed left-20 ml-1 px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-1)] text-xs font-extrabold tracking-tight whitespace-nowrap shadow-2xl z-[300] backdrop-blur-md pointer-events-none animate-in fade-in duration-100"
          style={{ top: `${hoveredY}px`, transform: 'translateY(-50%)' }}
        >
          {hoveredItem}
        </div>
      )}
    </aside>
  );
};
