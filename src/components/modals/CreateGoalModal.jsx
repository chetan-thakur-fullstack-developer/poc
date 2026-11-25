import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Target, CreditCard, X } from 'lucide-react';

export const CreateGoalModal = () => {
  const {
    showCreateModal,
    setShowCreateModal,
    editingGoal,
    formTitle,
    setFormTitle,
    formCategory,
    setFormCategory,
    formType,
    setFormType,
    formTarget,
    setFormTarget,
    formDate,
    setFormDate,
    formAccountId,
    setFormAccountId,
    formAllocPct,
    setFormAllocPct,
    formMonthly,
    setFormMonthly,
    formColor,
    setFormColor,
    formApr,
    setFormApr,
    formMinPayment,
    setFormMinPayment,
    handleSaveGoal,
    linkedAccounts,
    getAccountCapacity
  } = useApp();

  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card w-full max-w-lg p-6 sm:p-8 space-y-6 bg-[var(--surface)] border border-[var(--border-strong)] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-base font-black text-[var(--text-1)]">
              {editingGoal ? 'Edit Milestone' : (formType === 'paydown' ? 'Pay debt' : 'Create New Goal')}
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              {formType === 'paydown' ? 'Configure existing liability balance, APR, and link any account' : 'Configure milestone targets & synced account funding'}
            </p>
          </div>
          <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveGoal} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">
                {formType === 'paydown' ? 'Debt / Creditor Name *' : 'Goal Title *'}
              </label>
              <input
                type="text"
                required
                placeholder={formType === 'paydown' ? 'e.g. Chase Sapphire Credit Card' : 'e.g. Dream Wedding Fund'}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Category Tag</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="Debt">Debt / Liability</option>
                  <option value="Property">Property</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Asset">Asset</option>
                  <option value="Safety">Safety & Emergency</option>
                  <option value="Retirement">Retirement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Goal Type</label>
                <select
                  value={formType}
                  onChange={(e) => {
                    const t = e.target.value;
                    setFormType(t);
                    setFormColor(t === 'paydown' ? '#EF4444' : '#10B981');
                  }}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="save">Save Up (Asset / Accumulation)</option>
                  <option value="paydown">Pay Down (Debt / Liabilities)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">
                  {formType === 'paydown' ? 'Total Balance Owed ($) *' : 'Target Amount ($) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="10000"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="input-field text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">
                  {formType === 'paydown' ? 'Target Payoff Date' : 'Target Date'}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="input-field text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">Theme Color</label>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="input-field cursor-pointer h-[42px] p-1"
                />
              </div>
            </div>

            {/* Link Existing Account */}
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-1)]">Link Existing Account (Optional)</h4>
              <div>
                <select
                  value={formAccountId}
                  onChange={(e) => {
                    const aid = e.target.value;
                    setFormAccountId(aid);
                    if (aid) {
                      const cap = getAccountCapacity(aid);
                      setFormAllocPct(Math.min(25, cap.availablePct));
                    } else {
                      setFormAllocPct(0);
                    }
                  }}
                  className="input-field text-xs cursor-pointer"
                >
                  <option value="">No account linked (Manual entry)</option>
                  {linkedAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — ${Number(acc.balance || 0).toLocaleString()} balance
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialized Paydown Fields */}
            {formType === 'paydown' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <div>
                  <label className="block text-xs font-bold text-rose-300 mb-1">Interest Rate (APR %)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18.99"
                    value={formApr}
                    onChange={(e) => setFormApr(e.target.value)}
                    className="input-field text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-300 mb-1">Minimum Monthly Payment ($)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={formMinPayment}
                    onChange={(e) => setFormMinPayment(e.target.value)}
                    className="input-field text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Monthly Pacing */}
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Monthly Pacing</h4>
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] mb-1.5">
                {formType === 'paydown' ? 'Planned Monthly Principal Payment ($)' : 'Planned Monthly Contribution ($)'}
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="500"
                value={formMonthly}
                onChange={(e) => setFormMonthly(e.target.value)}
                className="input-field text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-xs px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary text-xs px-5 py-2.5 text-white shadow-sm flex items-center gap-1.5 ${
                formType === 'save' ? 'bg-[#1D4ED8]' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {formType === 'paydown' ? <CreditCard className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              <span>Pay debt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
