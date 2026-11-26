import React, { useState } from 'react';
import { Sliders, X, Check, Plus, Trash2 } from 'lucide-react';
import { Amount } from './Amount.jsx';

export const ManageBudgetModal = ({ isOpen, onClose, categories = [], setCategories }) => {
  if (!isOpen) return null;

  const [localCategories, setLocalCategories] = useState(JSON.parse(JSON.stringify(categories || [])));
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');

  const handleLimitChange = (id, val) => {
    const num = Number(val);
    setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, limit: isNaN(num) ? 0 : num } : c));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const limitNum = Number(newCatLimit) || 0;
    const newCat = {
      id: `cat_${Date.now()}`,
      label: newCatName.trim(),
      limit: limitNum,
      color: '#3b82f6',
      icon: 'tag'
    };
    setLocalCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setNewCatLimit('');
  };

  const handleDeleteCategory = (id) => {
    setLocalCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    setCategories(localCategories);
    onClose();
  };

  const totalBudget = localCategories.reduce((acc, c) => acc + (Number(c.limit) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--text-1)]">
                Manage Budget Caps &amp; Categories
              </h3>
              <p className="text-xs text-[var(--text-3)]">
                Total Budget: <span className="font-mono font-bold text-[var(--text-1)]"><Amount value={totalBudget} decimals={0} /></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--surface-3)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
              Category Spending Caps
            </h4>
            {localCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                  <span className="text-xs font-bold text-[var(--text-1)] truncate">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                    <span className="text-xs font-mono font-bold text-[var(--text-3)]">$</span>
                    <input
                      type="number"
                      value={cat.limit}
                      onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                      className="w-20 text-xs font-bold font-mono bg-transparent text-[var(--text-1)] outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Category Form */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
              Add New Category Cap
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Category Name (e.g. Travel)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-1)] outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Monthly Cap ($)"
                  value={newCatLimit}
                  onChange={(e) => setNewCatLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold font-mono text-[var(--text-1)] outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex-shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--text-2)] font-bold text-xs transition-all cursor-pointer border border-[var(--border)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
