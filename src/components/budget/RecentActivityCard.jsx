import React from 'react';
import { Receipt, ArrowRight, Calendar } from 'lucide-react';
import { Amount } from './Amount.jsx';
import { selectRecentActivity } from '../../budget/calc.js';
import { useApp } from '../../context/AppContext.jsx';

export const RecentActivityCard = ({ period, transactions = [] }) => {
  const { setCurrentTab } = useApp();
  const recentTxs = selectRecentActivity(transactions, period);

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-1)]">
              Recent Activity in Period
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              Latest transactions recorded within the selected date range
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('tab-transactions')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] font-bold text-xs border border-[var(--border)] transition-all cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2 pt-1">
        {recentTxs.length === 0 ? (
          <div className="p-6 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center text-xs text-[var(--text-3)]">
            No transactions in range.
          </div>
        ) : (
          recentTxs.map(tx => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs hover:bg-[var(--surface-3)] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--text-2)] border border-[var(--border)]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-[var(--text-1)] truncate">
                    {tx.description || tx.name || 'Expense Transaction'}
                  </h4>
                  <p className="text-[10px] text-[var(--text-3)]">
                    {tx.date} · <span className="uppercase">{tx.categoryId || 'General'}</span>
                  </p>
                </div>
              </div>
              <div className="font-mono font-black text-rose-400 flex-shrink-0">
                -<Amount value={tx.amount} decimals={2} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
