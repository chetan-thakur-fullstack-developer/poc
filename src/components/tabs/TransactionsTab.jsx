import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const TransactionsTab = () => {
  const { transactions, formatMoney, openModal, deleteTransaction, expensesData } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.amount).includes(search);
    const matchesCategory =
      selectedCategory === 'all' || t.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = filtered.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Transactions Register</h2>
          <p className="text-xs text-[var(--text-3)]">
            Search, filter, and track all expenses across cards and bank accounts.
          </p>
        </div>

        <button
          onClick={() => openModal('addTx')}
          className="btn-primary text-xs px-4 py-2 cursor-pointer self-start sm:self-auto"
        >
          + Record Transaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search merchants or amounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs pl-8"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-[var(--text-3)]">🔍</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">Total Filtered:</span>
            <p className="font-mono text-sm font-black text-emerald-400">{formatMoney(totalSpent, 2)}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--text-1)]">
            Ledger ({filtered.length} entries)
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-3)]">
            No transactions found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold">Merchant / Description</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Card / Account</th>
                  <th className="py-2.5 font-semibold text-right">Amount</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(tx => {
                  const card = cards.find(c => c.id === tx.cardId);
                  const cat = categories.find(c => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                      <td className="py-3 font-mono text-[var(--text-3)]">{tx.date}</td>
                      <td className="py-3">
                        <div className="font-bold text-[var(--text-1)]">{tx.description}</div>
                        {tx.isRecurring && (
                          <span className="text-[9px] text-amber-400 font-semibold uppercase">
                            • Recurring
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: cat ? `${cat.color}20` : 'rgba(148,163,184,0.15)',
                            color: cat?.color || '#94A3B8'
                          }}
                        >
                          {cat?.label || 'General'}
                        </span>
                      </td>
                      <td className="py-3 text-[var(--text-2)]">
                        {card ? `${card.name} (•${card.masked})` : 'Manual'}
                      </td>
                      <td className="py-3 font-mono font-bold text-right text-[var(--text-1)]">
                        {formatMoney(tx.amount, 2)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-[var(--text-3)] hover:text-rose-400 p-1 text-xs"
                          title="Delete entry"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
