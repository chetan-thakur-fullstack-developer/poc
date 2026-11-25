import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Target, CreditCard, X, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber.jsx';

export const GoalDetailModal = () => {
  const {
    detailGoal,
    setDetailGoal,
    isDetailEditing,
    setIsDetailEditing,
    handleToggleDetailEdit,
    handleSaveGoal,
    handleDeletePrompt,
    handleDeposit,
    getGoalStatus,
    formatMoney,
    showAddTxModal,
    setShowAddTxModal,
    handleAddManualTx,
    txDesc,
    setTxDesc,
    txAmount,
    setTxAmount,
    txType,
    setTxType,
    formTitle,
    setFormTitle,
    formTarget,
    setFormTarget,
    formDate,
    setFormDate,
    formMonthly,
    setFormMonthly,
    formApr
  } = useApp();

  if (!detailGoal) return null;

  const isPaydown = detailGoal.type === 'paydown';
  const pct = isPaydown
    ? Math.min(100, Math.round(((detailGoal.target - detailGoal.current) / detailGoal.target) * 100))
    : Math.min(100, Math.round((detailGoal.current / detailGoal.target) * 100));
  const status = getGoalStatus(detailGoal);
  const remaining = detailGoal.current;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="card w-full max-w-3xl max-h-[90vh] bg-[var(--app-bg-2)] border border-[var(--border-strong)] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: detailGoal.color }} />
            <div>
              <h3 className="text-lg font-black text-[var(--text-1)]">{detailGoal.title}</h3>
              <p className="text-xs text-[var(--text-3)]">{detailGoal.category} • Target Date: {detailGoal.date}</p>
            </div>
          </div>
          <button
            onClick={() => setDetailGoal(null)}
            className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Edit Toggle Bar */}
        <div className="flex items-center justify-between bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--text-2)]">
            {isDetailEditing ? '✍️ Editing Milestone Details' : 'Milestone Management'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleDetailEdit}
              className="btn-secondary text-xs !py-1.5 !px-3 cursor-pointer flex items-center gap-1"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isDetailEditing ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>
            <button
              onClick={() => handleDeletePrompt(detailGoal)}
              className="btn-secondary text-xs !py-1.5 !px-3 text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Inline Edit Form vs Hero Banner */}
        {isDetailEditing ? (
          <form onSubmit={handleSaveGoal} className="card p-6 space-y-4 bg-[var(--surface)] border border-emerald-500/40">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Edit Milestone Parameters</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1">Title / Creditor Name</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">Target / Balance ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="input-field text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">Monthly Pacing ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formMonthly}
                    onChange={(e) => setFormMonthly(e.target.value)}
                    className="input-field text-xs font-mono font-bold"
                  />
                </div>
                {isPaydown && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-2)] mb-1">APR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formApr}
                      onChange={(e) => setFormApr(e.target.value)}
                      className="input-field text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDetailEditing(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                <button type="submit" className="btn-primary text-xs px-5 py-2 text-white" style={{ backgroundColor: '#1D4ED8' }}>Save Changes</button>
              </div>
            </div>
          </form>
        ) : (
          /* A. Hero Banner */
          <div className="card p-6 space-y-4 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${detailGoal.color}25`, color: detailGoal.color }}>
                  {detailGoal.category} {detailGoal.apr ? `• ${detailGoal.apr}% APR` : ''}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <button onClick={() => setShowAddTxModal(true)} className="btn-primary text-xs !py-1.5 !px-3 cursor-pointer">
                + Log Transaction
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--text-2)]">{isPaydown ? `Paid Off (${pct}%)` : `Progress (${pct}%)`}</span>
                <span className="font-mono text-[var(--text-1)]">{isPaydown ? `${formatMoney(detailGoal.target - detailGoal.current)} paid of ${formatMoney(detailGoal.target)}` : `${formatMoney(detailGoal.current)} / ${formatMoney(detailGoal.target)}`}</span>
              </div>
              <div className="relative w-full bg-[var(--surface-3)] h-3 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ backgroundColor: detailGoal.color, width: `${pct}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm" style={{ left: '50%' }} />
              </div>
            </div>
          </div>
        )}

        {/* B. 4-Column KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">{isPaydown ? 'Paid Off' : 'Total Saved'}</span>
            <p className="text-lg font-black font-mono text-emerald-400 mt-1">{isPaydown ? formatMoney(detailGoal.target - detailGoal.current) : formatMoney(detailGoal.current)}</p>
            <span className="text-[10px] text-[var(--text-4)]">{pct}% complete</span>
          </div>
          <div className="card p-4">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">{isPaydown ? 'Remaining Balance' : 'Remaining'}</span>
            <p className="text-lg font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(remaining)}</p>
            <span className="text-[10px] text-[var(--text-4)]">Owed / Left</span>
          </div>
          <div className="card p-4">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Monthly Pace</span>
            <p className="text-lg font-black font-mono text-purple-400 mt-1">{formatMoney(detailGoal.monthly || 500)}/mo</p>
            <span className="text-[10px] text-[var(--text-4)]">Scheduled payment</span>
          </div>
          <div className="card p-4">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Target Horizon</span>
            <p className="text-lg font-black font-mono text-emerald-400 mt-1">{detailGoal.date}</p>
            <span className="text-[10px] text-[var(--text-4)]">Deadline</span>
          </div>
        </div>

        {/* C. Main Column — Activity Feed */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h4 className="font-bold text-sm text-[var(--text-1)]">Activity &amp; Ledger</h4>
            <button onClick={() => setShowAddTxModal(true)} className="btn-secondary text-xs !py-1 !px-2.5 cursor-pointer">
              + Add Entry
            </button>
          </div>

          <div className="space-y-2">
            {(!detailGoal.transactions || detailGoal.transactions.length === 0) ? (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">No activity recorded yet.</div>
            ) : (
              detailGoal.transactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${tx.type === 'deposit' || tx.type === 'payment' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {tx.type === 'deposit' || tx.type === 'payment' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-1)]">{tx.description}</div>
                      <div className="text-[10px] text-[var(--text-3)]">{tx.date} • Source: {tx.source || 'Manual Entry'}</div>
                    </div>
                  </div>
                  <div className={`font-mono font-black ${tx.type === 'deposit' || tx.type === 'payment' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'deposit' || tx.type === 'payment' ? '+' : '-'}{formatMoney(tx.amount, 2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
