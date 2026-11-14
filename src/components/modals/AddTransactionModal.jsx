import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const AddTransactionModal = () => {
  const { modals, closeModal, addTransaction, expensesData, currentCurrency } = useApp();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cardId, setCardId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);

  if (!modals.addTx) return null;

  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      description,
      amount: parseFloat(amount),
      categoryId: categoryId || (categories[0]?.id || 'cat_general'),
      cardId: cardId || (cards[0]?.id || 'card_default'),
      date,
      isRecurring
    });

    closeModal('addTx');
    setDescription('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl">
        <button
          onClick={() => closeModal('addTx')}
          className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text-1)] text-lg"
        >
          ✕
        </button>

        <h3 className="text-base font-bold text-[var(--text-1)] mb-1">Record Transaction</h3>
        <p className="text-xs text-[var(--text-3)] mb-4">
          Add an expense, bill payment, or deposit to your ledger.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Whole Foods, Electricity Bill, Salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Amount ({currentCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Card / Payment Source
              </label>
              <select
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">Select account...</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>{card.name} (•{card.masked})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="txRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-[var(--border)] text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="txRecurring" className="text-xs text-[var(--text-2)] cursor-pointer">
              Recurring monthly subscription or bill
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => closeModal('addTx')}
              className="flex-1 btn-secondary text-xs py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary text-xs py-2"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
