import React from 'react';
import { Repeat, Plus, Calendar, ExternalLink } from 'lucide-react';
import { Amount } from './Amount.jsx';
import { useApp } from '../../context/AppContext.jsx';

export const SubscriptionsCard = ({ period, transactions = [] }) => {
  const { openModal } = useApp();

  // Filter recurring transactions or subscriptions
  const recurringTxs = (transactions || []).filter(tx => tx.isRecurring || tx.cadence);

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-1)]">
              Recurring Subscriptions &amp; Bills
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              Automated subscription radar &amp; recurring commitments
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal('addTx')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] font-bold text-xs border border-[var(--border)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Grid of Subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {recurringTxs.length === 0 ? (
          <div className="col-span-full p-8 text-center space-y-2 text-[var(--text-3)]">
            <Repeat className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-bold">No recurring subscriptions or bills detected.</p>
            <p className="text-[11px]">Mark transactions as recurring to track them here.</p>
          </div>
        ) : (
          recurringTxs.map(sub => (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[var(--text-1)] truncate">
                    {sub.description || sub.name}
                  </h4>
                  <span className="text-xs font-mono font-black text-indigo-400">
                    <Amount value={sub.amount} decimals={2} />
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-3)]">
                  Cadence: <span className="font-bold text-[var(--text-2)]">{sub.cadence || 'Monthly'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-3)]">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {sub.date || sub.nextDueDate || 'Upcoming'}</span>
                </div>
                <button
                  onClick={() => openModal('addTx')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[10px] transition-all cursor-pointer border border-indigo-500/20"
                >
                  <span>Log payment</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
