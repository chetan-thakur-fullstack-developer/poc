import React, { useState } from 'react';
import { Sliders, Check, Trash2 } from 'lucide-react';
import { Amount } from './Amount.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

export const ManageBudgetModal = ({ isOpen, onClose, categories = [], setCategories, monthlyBudget = 0, setMonthlyBudget }) => {
  const [localCategories, setLocalCategories] = useState(() => JSON.parse(JSON.stringify(categories || [])));
  const [localMonthlyBudget, setLocalMonthlyBudget] = useState(monthlyBudget);
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
    if (setMonthlyBudget) {
      setMonthlyBudget(Number(localMonthlyBudget) || 0);
    }
    onClose();
  };

  const totalBudget = Number(localMonthlyBudget) || localCategories.reduce((acc, c) => acc + (Number(c.limit) || 0), 0);

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} icon={<Check className="w-4 h-4" />}>
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Budget & Categories"
      subtitle={`Total Budget: $${totalBudget.toLocaleString()}`}
      icon={<Sliders className="w-5 h-5" />}
      footer={modalFooter}
    >
      {/* Overall Monthly Budget Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
          Overall Monthly Budget Amount
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--surface)] px-3 py-2 rounded-xl border border-[var(--border)] flex-1">
            <span className="text-xs font-mono font-bold text-[var(--text-3)]">$</span>
            <input
              type="number"
              value={localMonthlyBudget}
              onChange={(e) => setLocalMonthlyBudget(e.target.value)}
              className="w-full text-xs font-bold font-mono bg-transparent text-[var(--text-1)] outline-none"
              placeholder="e.g. 4500"
            />
          </div>
        </div>
      </div>

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
                aria-label="Delete Category"
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
            <Button variant="primary" size="sm" onClick={handleAddCategory}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
