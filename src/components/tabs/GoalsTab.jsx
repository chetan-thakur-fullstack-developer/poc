import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const GoalsTab = () => {
  const { formatMoney, showToast } = useApp();

  const [goals, setGoals] = useState([
    {
      id: 'g_1',
      title: 'Emergency Reserve (6 Months)',
      category: 'Safety',
      target: 50000,
      current: 45000,
      date: '2026-12-31',
      color: '#10B981'
    },
    {
      id: 'g_2',
      title: 'Real Estate / Vacation Home',
      category: 'Property',
      target: 120000,
      current: 78000,
      date: '2027-06-30',
      color: '#3B82F6'
    },
    {
      id: 'g_3',
      title: 'FIRE Milestone $1,000,000',
      category: 'Retirement',
      target: 1000000,
      current: 421868,
      date: '2030-12-31',
      color: '#8B5CF6'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const newGoal = {
      id: `g_${Date.now()}`,
      title: newTitle,
      category: 'Savings',
      target: parseFloat(newTarget),
      current: 0,
      date: '2027-12-31',
      color: '#EC4899'
    };

    setGoals([...goals, newGoal]);
    setNewTitle('');
    setNewTarget('');
    showToast('New financial goal saved', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[var(--text-1)]">Household Goals & Milestones</h2>
        <p className="text-xs text-[var(--text-3)]">
          Target long-term wealth milestones, emergency funds, and investment objectives.
        </p>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

          return (
            <div key={goal.id} className="card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                  >
                    {goal.category}
                  </span>
                  <span className="text-[var(--text-3)] font-mono text-[10px]">
                    Target: {goal.date}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[var(--text-1)] mt-2">
                  {goal.title}
                </h3>

                <div className="flex justify-between items-end mt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-3)]">Saved</span>
                    <p className="font-mono font-bold text-[var(--text-1)]">{formatMoney(goal.current)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-3)]">Target</span>
                    <p className="font-mono font-bold text-[var(--text-2)]">{formatMoney(goal.target)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--surface-3)] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: goal.color, width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="text-right text-[10px] font-bold text-emerald-400">
                {pct}% Achieved
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Goal Card */}
      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-sm text-[var(--text-1)]">Add New Financial Goal</h3>
        <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Goal Title (e.g. New Car Fund, College 529)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-field text-xs flex-1"
          />
          <input
            type="number"
            required
            placeholder="Target Amount"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="input-field text-xs sm:w-44 font-mono"
          />
          <button type="submit" className="btn-primary text-xs px-5 py-2">
            Create Goal
          </button>
        </form>
      </div>
    </div>
  );
};
