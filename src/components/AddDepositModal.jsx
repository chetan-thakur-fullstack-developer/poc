import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { X, Target, DollarSign, Zap } from 'lucide-react';

/* ─── Quick Deposit Modal (Global Root Level) ─── */
export const AddDepositModal = () => {
  const {
    depositModalGoal,
    setDepositModalGoal,
    depositAmount,
    setDepositAmount,
    submitDepositModal,
    formatMoney
  } = useApp();

  if (!depositModalGoal) return null;

  const goal = depositModalGoal;
  const amount = depositAmount;
  const setAmount = setDepositAmount;

  const inputRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) setDepositModalGoal(null);
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setDepositModalGoal(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setDepositModalGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitDepositModal();
  };

  const presetAmounts = [100, 250, 500, 1000];
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const parsedAmount = parseFloat(amount) || 0;
  const newTotal = Math.min(goal.target, goal.current + parsedAmount);
  const newPct = Math.min(100, Math.round((newTotal / goal.target) * 100));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" ref={backdropRef} onClick={handleBackdropClick}>
      <motion.div
        className="card w-full max-w-md bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}40` }}
              >
                <Target className="w-5 h-5" style={{ color: goal.color }} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-1)]">Quick Deposit</h3>
                <p className="text-[11px] text-[var(--text-3)] truncate max-w-[200px]">{goal.title}</p>
              </div>
            </div>
            <button
              onClick={() => setDepositModalGoal(null)}
              className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Current progress preview */}
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--text-3)]">Current Progress</span>
              <span className="font-mono font-bold text-[var(--text-1)]">{formatMoney(goal.current)} / {formatMoney(goal.target)}</span>
            </div>
            <div className="relative w-full h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: goal.color, width: `${pct}%` }} />
              {parsedAmount > 0 && (
                <motion.div
                  className="absolute top-0 h-full rounded-full opacity-40"
                  style={{ backgroundColor: goal.color, left: `${pct}%`, width: `${Math.min(newPct - pct, 100 - pct)}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            {parsedAmount > 0 && (
              <motion.div
                className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Zap className="w-3 h-3" />
                <span>After deposit: {newPct}% complete ({formatMoney(newTotal)})</span>
              </motion.div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text-2)]">Deposit Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
              <input
                ref={inputRef}
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="input-field text-sm font-mono font-bold pl-9 py-3"
                required
              />
            </div>
          </div>

          {/* Preset Amount Chips */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  amount === String(preset)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)] hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
              >
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!parsedAmount || parsedAmount <= 0}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px] shadow-md"
          >
            <Target className="w-4 h-4" />
            <span>Deposit {parsedAmount > 0 ? formatMoney(parsedAmount) : ''}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
