import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const QuickAddModal = () => {
  const { modals, closeModal, openModal, setCurrentTab } = useApp();

  if (!modals.quickAdd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-sm p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl">
        <button
          onClick={() => closeModal('quickAdd')}
          className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text-1)] text-lg"
        >
          ✕
        </button>

        <h3 className="text-base font-bold text-[var(--text-1)] mb-1">Quick Add</h3>
        <p className="text-xs text-[var(--text-3)] mb-4">
          Choose an entry type to update your wealth data immediately:
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              closeModal('quickAdd');
              openModal('addTx');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-emerald-500/40 hover:bg-[var(--surface-3)] transition-all text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
              💸
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-1)]">Record Transaction</p>
              <p className="text-[10px] text-[var(--text-3)]">Add grocery, bill, or salary payment</p>
            </div>
          </button>

          <button
            onClick={() => {
              closeModal('quickAdd');
              openModal('addAccount');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-emerald-500/40 hover:bg-[var(--surface-3)] transition-all text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
              💳
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-1)]">Link / Add Account</p>
              <p className="text-[10px] text-[var(--text-3)]">Checking, savings, CD, or credit card</p>
            </div>
          </button>

          <button
            onClick={() => {
              closeModal('quickAdd');
              setCurrentTab('tab-overview');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-emerald-500/40 hover:bg-[var(--surface-3)] transition-all text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
              📈
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-1)]">Update Portfolio Balances</p>
              <p className="text-[10px] text-[var(--text-3)]">401(k), Roth IRA, HSA, ESPP balances</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
