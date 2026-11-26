import React, { useState } from 'react';
import { Tag, Plus, ChevronDown, ChevronRight, AlertTriangle, Check, X, Pencil, Sparkles } from 'lucide-react';
import { Amount } from './Amount.jsx';
import { computeCategoryRows } from '../../budget/calc.js';

export const CategoriesCard = ({ period, transactions, categories = [], setCategories, onAddCategoryAttempt }) => {
  const [editingCatId, setEditingCatId] = useState(null);
  const [editLimitInput, setEditLimitInput] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ default: true });

  const categoryRows = computeCategoryRows(period, transactions, categories);
  const totalCapped = categoryRows.reduce((acc, c) => acc + c.limit, 0);
  const totalSpent = categoryRows.reduce((acc, c) => acc + c.spent, 0);

  const handleStartEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditLimitInput(cat.limit);
  };

  const handleSaveEdit = (catId) => {
    const num = Number(editLimitInput);
    if (isNaN(num) || num < 0) {
      alert('Cap cannot be negative.');
      return;
    }
    setCategories(prev => (prev || []).map(c => c.id === catId ? { ...c, limit: num } : c));
    setEditingCatId(null);
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-1)]">
              Category Budgets &amp; Caps
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              {categories.length} categories · Total Capped: <span className="font-mono font-bold text-[var(--text-1)]"><Amount value={totalCapped} decimals={0} /></span>
            </p>
          </div>
        </div>

        <button
          onClick={onAddCategoryAttempt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] font-bold text-xs border border-[var(--border)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category Rows */}
      <div className="space-y-3 pt-2">
        {categoryRows.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-[var(--text-3)]">
            <Tag className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-bold">No category caps configured.</p>
            <p className="text-[11px]">Set budget caps below to track spending targets per category.</p>
          </div>
        ) : (
          categoryRows.map(cat => (
            <div
              key={cat.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                cat.isOver ? 'bg-rose-500/5 border-rose-500/30' : 'bg-[var(--surface-2)] border-[var(--border)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#3b82f6' }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-[var(--text-1)] truncate">
                      {cat.label}
                    </h4>
                    <p className="text-[10px] text-[var(--text-3)]">
                      Spent: <span className="font-mono text-[var(--text-2)]"><Amount value={cat.spent} decimals={2} /></span>
                    </p>
                  </div>
                </div>

                {/* Inline Cap Edit & Status */}
                <div className="flex items-center gap-3">
                  {cat.isOver && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Over Cap</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2.5 py-1 rounded-xl border border-[var(--border)] text-xs">
                    <span className="text-[var(--text-3)] font-bold">Cap:</span>
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold">$</span>
                        <input
                          type="number"
                          value={editLimitInput}
                          onChange={(e) => setEditLimitInput(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-xs font-bold font-mono rounded bg-[var(--surface-2)] border border-emerald-500 text-[var(--text-1)] outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded bg-[var(--surface-3)] text-[var(--text-2)] hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black font-mono text-[var(--text-1)]">
                          <Amount value={cat.limit} decimals={0} />
                        </span>
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar per category */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-3)]">
                  <span>{cat.pct}% used</span>
                  <span>Remaining: <Amount value={cat.remaining} decimals={2} /></span>
                </div>
                <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className={`h-full transition-all duration-300 ${cat.isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, Math.max(0, cat.pct))}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
