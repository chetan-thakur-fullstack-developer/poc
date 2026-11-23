import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Search, Filter, Plus, Trash2, ArrowUpDown, Receipt } from 'lucide-react';

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
  const avgTicket = filtered.length > 0 ? totalSpent / filtered.length : 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
        <button
          onClick={() => openModal('addTx')}
          className="btn-primary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Filtered Volume</span>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-0.5">{formatMoney(totalSpent, 2)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Total Entries</span>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-0.5">{filtered.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Average Ticket</span>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-0.5">{formatMoney(avgTicket, 2)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-4)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search merchants or amounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs pl-9 py-2.5"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs py-2.5 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            Ledger Entries ({filtered.length})
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-3)]">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-[var(--text-4)] opacity-50" />
            <p className="font-bold text-[var(--text-1)]">No transactions found</p>
            <p className="text-[11px] text-[var(--text-4)] mt-0.5">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-4)] bg-[var(--surface-2)]/20 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Merchant / Description</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Card / Account</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(tx => {
                  const card = cards.find(c => c.id === tx.cardId);
                  const cat = categories.find(c => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-[var(--surface-2)]/60 transition-colors group">
                      <td className="py-3.5 px-6 font-mono text-[var(--text-3)] text-[11px]">{tx.date}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[var(--text-1)]">{tx.description}</div>
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 font-bold uppercase mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Recurring
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm"
                          style={{
                            backgroundColor: cat ? `${cat.color}18` : 'rgba(148,163,184,0.12)',
                            color: cat?.color || '#94A3B8',
                            border: `1px solid ${cat ? `${cat.color}30` : 'rgba(148,163,184,0.2)'}`
                          }}
                        >
                          {cat?.label || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-[var(--text-2)] font-medium">
                        {card ? `${card.name} (•${card.masked})` : 'Manual Entry'}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-black text-right text-[var(--text-1)] text-sm">
                        {formatMoney(tx.amount, 2)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-[var(--text-4)] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-85 group-hover:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
