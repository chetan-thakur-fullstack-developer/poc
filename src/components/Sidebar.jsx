import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
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
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { currentTab, setCurrentTab, accountsData, transactions, openModal } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('ew_sidebar_collapsed') === 'true';
  });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredY, setHoveredY] = useState(0);

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

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 pt-4">
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

      {/* Sidebar Footer & Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)]/50 space-y-2.5">
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
      </div>

      {/* Global State-Driven Floating Tooltip */}
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
