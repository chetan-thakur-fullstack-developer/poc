import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Target, Flag, Plus, Sparkles, ShieldCheck, Trophy } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber.jsx';

export const GoalsTab = () => {
  const { formatMoney, showToast } = useApp();

  const [goals, setGoals] = useState([
    {
      id: 'g_1',
      title: 'Emergency Reserve (6 Months)',
      category: 'Safety',
      target: 50000,
      current: 45000,
      monthly: 1200,
      date: '2026-12-31',
      color: '#10B981'
    },
    {
      id: 'g_2',
      title: 'Real Estate / Vacation Home',
      category: 'Property',
      target: 120000,
      current: 78000,
      monthly: 2500,
      date: '2027-06-30',
      color: '#3B82F6'
    },
    {
      id: 'g_3',
      title: 'FIRE Milestone $1,000,000',
      category: 'Retirement',
      target: 1000000,
      current: 421868,
      monthly: 3500,
      date: '2030-12-31',
      color: '#8B5CF6'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newMonthly, setNewMonthly] = useState('');

  const goalTemplates = [
    { title: 'Home Down Payment', target: 80000, current: 24000, monthly: 1500, category: 'Property', date: '2028-05-30', color: '#3B82F6' },
    { title: 'Dream Vacation (Europe)', target: 12000, current: 4500, monthly: 600, category: 'Lifestyle', date: '2026-09-15', color: '#EC4899' },
    { title: 'New Electric Vehicle', target: 55000, current: 15000, monthly: 1000, category: 'Asset', date: '2027-11-30', color: '#8B5CF6' }
  ];

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const newGoal = {
      id: `g_${Date.now()}`,
      title: newTitle,
      category: 'Savings',
      target: parseFloat(newTarget),
      current: 0,
      monthly: parseFloat(newMonthly) || 500,
      date: '2027-12-31',
      color: '#10B981'
    };

    setGoals([newGoal, ...goals]);
    setNewTitle('');
    setNewTarget('');
    setNewMonthly('');
    showToast('New financial goal created successfully', 'success');
  };

  const applyTemplate = (template) => {
    if (goals.some(g => g.title === template.title)) {
      showToast('Goal template already exists in your active list', 'info');
      return;
    }
    setGoals([{ id: `g_${Date.now()}`, ...template }, ...goals]);
    showToast(`Added goal template: "${template.title}"`, 'success');
  };

  const totalGoalValue = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalMonthly = goals.reduce((sum, g) => sum + (g.monthly || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Household Goals & Milestones</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Target long-term wealth milestones, emergency funds, and investment objectives.
          </p>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
            Total Goal Value
          </div>
          <div className="text-lg font-black font-mono text-[var(--text-1)]">
            <AnimatedNumber value={totalGoalValue} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
            Total Saved
          </div>
          <div className="text-lg font-black font-mono text-emerald-400">
            <AnimatedNumber value={totalSaved} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
            Monthly Contributions
          </div>
          <div className="text-lg font-black font-mono text-purple-400">
            <AnimatedNumber value={totalMonthly} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
            Active Milestones
          </div>
          <div className="text-lg font-black font-mono text-[var(--text-1)]">
            {goals.length} Goals
          </div>
        </div>
      </div>

      {/* Active Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Your Active Goals</h3>
            <p className="text-xs text-[var(--text-3)]">Contribute, adjust pacing, and celebrate milestones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

            return (
              <div key={goal.id} className="card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
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
                  <div className="w-full bg-[var(--surface-3)] h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ backgroundColor: goal.color, width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                  <span className="text-[10px] text-[var(--text-3)] font-medium">
                    +{formatMoney(goal.monthly || 500)}/mo pacing
                  </span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {pct}% Achieved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Templates Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Goal Templates</h3>
            <p className="text-xs text-[var(--text-3)]">Pre-built goals with suggested amounts & timelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {goalTemplates.map((tpl, i) => (
            <div key={i} className="card-inner p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--text-3)]">
                  {tpl.category}
                </span>
                <h4 className="font-bold text-xs text-[var(--text-1)] mt-1.5">{tpl.title}</h4>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{formatMoney(tpl.target)} target</p>
              </div>
              <button
                onClick={() => applyTemplate(tpl)}
                className="btn-secondary text-xs !py-1.5 !px-3 w-full justify-center cursor-pointer"
              >
                + Add Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Custom Goal Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">Add Custom Financial Goal</h3>
            <p className="text-xs text-[var(--text-3)]">Create a personalized savings objective</p>
          </div>
        </div>

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Goal Title (e.g. Wedding Fund)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-field text-xs"
          />
          <input
            type="number"
            required
            placeholder="Target Amount ($)"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="input-field text-xs font-mono"
          />
          <button type="submit" className="btn-primary text-xs py-2 justify-center cursor-pointer">
            + Create Goal
          </button>
        </form>
      </div>
    </div>
  );
};
