import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ShieldAlert } from 'lucide-react';

export const SubscriptionRadar = () => {
  const { transactions } = useApp();
  const [cancelledIds, setCancelledIds] = useState(new Set());

  // Filter recurring transactions from user transactions
  const recurringTxs = (transactions || []).filter(tx => tx.isRecurring);

  const handleToggleCancel = (id) => {
    setCancelledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const subscriptions = recurringTxs.map(tx => ({
    id: tx.id,
    merchant_name: tx.description,
    estimated_monthly_amount: Math.abs(Number(tx.amount) || 0),
    last_charged_date: tx.date,
    status: cancelledIds.has(tx.id) ? 'cancelled' : 'active'
  }));

  const totalMonthlyWaste = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.estimated_monthly_amount, 0);

  if (subscriptions.length === 0) {
    return (
      <div className="card p-5 space-y-3 border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Subscription Ghost Radar</h3>
            <p className="text-[10px] text-[var(--text-3)]">No recurring subscriptions or SaaS items detected. Mark transactions as recurring to track them here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4 border-amber-500/30 bg-gradient-to-br from-[var(--surface)] to-amber-500/5">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Subscription Ghost Radar</h3>
            <p className="text-[10px] text-[var(--text-3)]">Automated recurring SaaS & membership tracking</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-amber-400 font-mono">${totalMonthlyWaste.toFixed(2)}/mo</div>
          <div className="text-[9px] text-[var(--text-4)]">${(totalMonthlyWaste * 12).toFixed(2)} / year</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {subscriptions.map(sub => {
          const isCancelled = sub.status === 'cancelled';
          return (
            <div key={sub.id} className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${isCancelled ? 'bg-[var(--surface-2)]/40 opacity-60 border-[var(--border)]' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCancelled ? 'bg-slate-400' : 'bg-amber-400 animate-pulse'}`} />
                <div className="min-w-0">
                  <div className={`font-bold truncate ${isCancelled ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)]'}`}>{sub.merchant_name}</div>
                  <div className="text-[10px] text-[var(--text-3)] truncate">Last charged: {sub.last_charged_date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono font-bold ${isCancelled ? 'text-[var(--text-4)]' : 'text-[var(--text-1)]'}`}>
                  ${sub.estimated_monthly_amount}/mo
                </span>
                <button
                  onClick={() => handleToggleCancel(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                    isCancelled
                      ? 'bg-[var(--surface-3)] text-[var(--text-3)] hover:bg-[var(--surface)]'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {isCancelled ? 'Restore' : 'Mark Cancelled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--text-4)] text-center italic pt-1">
        Disclaimer: Automated subscription detection is for informational tracking and does not constitute formal cancellation of third-party contracts.
      </p>
    </div>
  );
};
