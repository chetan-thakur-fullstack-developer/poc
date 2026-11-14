import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export const MobileNav = () => {
  const { currentTab, setCurrentTab, openModal } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 flex items-center justify-around">
      <button
        onClick={() => setCurrentTab('tab-dashboard')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentTab === 'tab-dashboard' ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
        }`}
      >
        <span className="text-lg">📊</span>
        <span>Home</span>
      </button>

      <button
        onClick={() => setCurrentTab('tab-accounts')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentTab === 'tab-accounts' || currentTab === 'tab-overview' ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
        }`}
      >
        <span className="text-lg">💳</span>
        <span>Money</span>
      </button>

      {/* Floating Center Add Button */}
      <button
        onClick={() => openModal('quickAdd')}
        className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 transition-transform"
      >
        +
      </button>

      <button
        onClick={() => setCurrentTab('tab-expenses')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentTab === 'tab-expenses' || currentTab === 'tab-goals' ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
        }`}
      >
        <span className="text-lg">💰</span>
        <span>Budget</span>
      </button>

      <button
        onClick={() => setCurrentTab('tab-settings')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentTab === 'tab-settings' ? 'text-emerald-400 font-bold' : 'text-[var(--text-3)]'
        }`}
      >
        <span className="text-lg">⚙️</span>
        <span>Settings</span>
      </button>
    </nav>
  );
};
