import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Target, Flag, Plus, Sparkles, ShieldCheck, Trophy, Pencil, Trash2, Check, X, Calendar } from 'lucide-react';
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
  const [newDate, setNewDate] = useState('2027-12-31');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editCurrent, setEditCurrent] = useState('');
  const [editMonthly, setEditMonthly] = useState('');
  const [editDate, setEditDate] = useState('');

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
      date: newDate || '2027-12-31',
      color: '#10B981'
    };

    setGoals([newGoal, ...goals]);
    setNewTitle('');
    setNewTarget('');
    setNewMonthly('');
    setNewDate('2027-12-31');
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

  const startEditing = (goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditTarget(goal.target);
    setEditCurrent(goal.current);
    setEditMonthly(goal.monthly || 500);
    setEditDate(goal.date || '2027-12-31');
  };

  const saveEdit = (id) => {
    setGoals(goals.map(g => g.id === id ? {
      ...g,
      title: editTitle,
      target: parseFloat(editTarget) || g.target,
      current: parseFloat(editCurrent) || g.current,
      monthly: parseFloat(editMonthly) || g.monthly,
      date: editDate || g.date
    } : g));
    setEditingId(null);
    showToast('Goal updated successfully', 'success');
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
    showToast('Goal removed successfully', 'info');
  };

  const addContribution = (id, amount = 500) => {
    setGoals(goals.map(g => g.id === id ? {
      ...g,
      current: Math.min(g.target, g.current + amount)
    } : g));
    showToast(`Added +${formatMoney(amount)} deposit to goal!`, 'success');
  };

  const getGoalStatus = (goal) => {
    const remaining = Math.max(0, goal.target - goal.current);
    if (remaining === 0) return { label: '🎉 Achieved', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };

    const now = new Date();
    const targetD = new Date(goal.date || '2027-12-31');
    const diffMonths = (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth());

    if (diffMonths <= 0) {
      return { label: '⚠️ Target date passed', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    }

    const requiredMonthly = remaining / diffMonths;
    const currentMonthly = goal.monthly || 500;

    if (currentMonthly >= requiredMonthly) {
      return { label: '🟢 On Track', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    } else {
      return {
        label: `⚠️ Off Track (Need $${Math.ceil(requiredMonthly).toLocaleString()}/mo)`,
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      };
    }
  };

  const totalGoalValue = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalMonthly = goals.reduce((sum, g) => sum + (g.monthly || 0), 0);

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-[var(--text-3)]">Contribute, track target dates, and check On-Track status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const status = getGoalStatus(goal);
            const isEditing = editingId === goal.id;

            return (
              <div key={goal.id} className="card p-5 space-y-4 flex flex-col justify-between">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-400">Editing Goal</span>
                      <button onClick={() => setEditingId(null)} className="p-1 text-[var(--text-3)] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Target ($)</label>
                        <input
                          type="number"
                          value={editTarget}
                          onChange={(e) => setEditTarget(e.target.value)}
                          className="input-field text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Saved ($)</label>
                        <input
                          type="number"
                          value={editCurrent}
                          onChange={(e) => setEditCurrent(e.target.value)}
                          className="input-field text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Monthly ($)</label>
                        <input
                          type="number"
                          value={editMonthly}
                          onChange={(e) => setEditMonthly(e.target.value)}
                          className="input-field text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Target Date</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="input-field text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(goal.id)}
                        className="btn-primary text-xs !py-1.5 flex-1 justify-center cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-secondary text-xs !py-1.5 flex-1 justify-center cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View Mode */
                  <>
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                        >
                          {goal.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditing(goal)}
                            className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-3)] hover:text-white transition-colors cursor-pointer"
                            title="Edit goal"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[var(--text-1)] mt-2">
                        {goal.title}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-3)]">
                        <Calendar className="w-3 h-3 text-[var(--text-4)]" />
                        <span>Target: {goal.date}</span>
                      </div>

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

                    <div className="pt-3 border-t border-[var(--border)] space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[var(--text-3)] font-medium">
                          +{formatMoney(goal.monthly || 500)}/mo pacing
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <button
                        onClick={() => addContribution(goal.id, 500)}
                        className="btn-secondary text-xs !py-1 !px-2 w-full justify-center text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        + Deposit $500
                      </button>
                    </div>
                  </>
                )}
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
            <p className="text-xs text-[var(--text-3)]">Create a personalized savings objective with target date</p>
          </div>
        </div>

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
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
