import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Target, Flag, Plus, Sparkles, ShieldCheck, Trophy, Pencil, Trash2, Check, X, Calendar, ArrowUpRight, ArrowDownRight, Layers, CreditCard, AlertCircle } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';

export const GoalsTab = () => {
  const {
    formatMoney,
    showToast,
    accountsData,
    showConfirmModal,
    goals,
    setGoals,
    detailGoal,
    setDetailGoal,
    showCreateModal,
    setShowCreateModal,
    editingGoal,
    setEditingGoal,
    isDetailEditing,
    setIsDetailEditing,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDetailWithEdit,
    handleToggleDetailEdit,
    handleSaveGoal,
    applyTemplate,
    handleDeletePrompt,
    handleDeposit,
    getGoalStatus
  } = useApp();

  // Goal Type Sub-tabs: 'save' vs 'paydown'
  const [goalTypeTab, setGoalTypeTab] = useState('save');

  const saveTemplates = [
    { title: 'Home Down Payment', target: 80000, current: 24000, monthly: 1500, category: 'Property', type: 'save', date: '2028-05-30', color: '#3B82F6' },
    { title: 'Dream Vacation (Europe)', target: 12000, current: 4500, monthly: 600, category: 'Lifestyle', type: 'save', date: '2026-09-15', color: '#EC4899' },
    { title: 'Emergency Buffer 3M', target: 15000, current: 5000, monthly: 500, category: 'Safety', type: 'save', date: '2027-01-30', color: '#10B981' }
  ];

  const paydownTemplates = [
    { title: 'Amex Platinum Balance', target: 6200, current: 1500, monthly: 700, category: 'Debt', type: 'paydown', date: '2026-10-30', color: '#EF4444', apr: 22.99, minPayment: 200 },
    { title: 'Student Loan Consolidation', target: 28000, current: 11000, monthly: 650, category: 'Debt', type: 'paydown', date: '2029-12-30', color: '#F59E0B', apr: 5.85, minPayment: 350 },
    { title: 'Auto Loan Payoff', target: 14000, current: 4200, monthly: 500, category: 'Debt', type: 'paydown', date: '2027-08-30', color: '#EC4899', apr: 7.25, minPayment: 400 }
  ];

  const filteredGoals = goals.filter(g => (g.type || 'save') === goalTypeTab);

  const totalGoalValue = filteredGoals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = filteredGoals.reduce((sum, g) => sum + g.current, 0);
  const totalMonthly = filteredGoals.reduce((sum, g) => sum + (g.monthly || 0), 0);

  return (
    <div className="space-y-6 pb-32">
      {/* 1. Top Section: Clean Tabs [Save Up] [Debt Payoff] & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sub-tabs: Save Up vs Pay Down (Active Goals vs Debt Payoff) */}
        <div role="tablist" className="flex rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--border)] shrink-0 w-fit">
          <button
            role="tab"
            aria-selected={goalTypeTab === 'save'}
            onClick={() => setGoalTypeTab('save')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              goalTypeTab === 'save' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-3)] hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span>Active Goals (Save Up)</span>
          </button>
          <button
            role="tab"
            aria-selected={goalTypeTab === 'paydown'}
            onClick={() => setGoalTypeTab('paydown')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              goalTypeTab === 'paydown' ? 'bg-rose-600 text-white shadow-sm' : 'text-[var(--text-3)] hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span>Debt Payoff</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenCreate(goalTypeTab)}
          className={`btn-primary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-1.5 text-white shadow-sm shrink-0 whitespace-nowrap ${
            goalTypeTab === 'save' ? 'bg-[#8B5CF6] hover:bg-[#7c4dff]' : 'bg-rose-600 hover:bg-rose-500'
          }`}
        >
          {goalTypeTab === 'save' ? <Target className="w-4 h-4 shrink-0" /> : <CreditCard className="w-4 h-4 shrink-0" />}
          <span>{goalTypeTab === 'save' ? 'Create Goal' : 'Add Debt Liability'}</span>
        </button>
      </div>

      {/* KPI Summary Grid (Only rendered when goals exist so empty state is the hero) */}
      {filteredGoals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div className="card p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
              {goalTypeTab === 'save' ? 'Total Goal Value' : 'Total Debt Owed'}
            </div>
            <div className="text-lg font-black font-mono text-[var(--text-1)]">
              <AnimatedNumber value={totalGoalValue} />
            </div>
          </div>
          <div className="card p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
              {goalTypeTab === 'save' ? 'Total Saved' : 'Total Paid Off'}
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              <AnimatedNumber value={totalSaved} />
            </div>
          </div>
          <div className="card p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
              Monthly Pacing
            </div>
            <div className="text-lg font-black font-mono text-purple-400">
              <AnimatedNumber value={totalMonthly} />
            </div>
          </div>
          <div className="card p-4 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)] mb-1">
                Active {goalTypeTab === 'save' ? 'Goals' : 'Liabilities'}
              </div>
              <div className="text-lg font-black font-mono text-[var(--text-1)]">
                {filteredGoals.length} {filteredGoals.length === 1 ? (goalTypeTab === 'save' ? 'Goal' : 'Liability') : (goalTypeTab === 'save' ? 'Goals' : 'Liabilities')}
              </div>
            </div>
            <button
              onClick={() => showToast('Select a goal and link it to an account to allocate funds.', 'info')}
              className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>Allocate Funds ↗</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Premium Interactive Empty State */}
      {filteredGoals.length === 0 ? (
        <div className={`card p-12 text-center space-y-6 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-2)] border relative overflow-hidden ${
          goalTypeTab === 'save' ? 'border-emerald-500/30' : 'border-rose-500/30'
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="max-w-md mx-auto space-y-3 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg ${
              goalTypeTab === 'save' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {goalTypeTab === 'save' ? <Target className="w-7 h-7" /> : <CreditCard className="w-7 h-7" />}
            </div>
            <h3 className="text-lg font-black text-[var(--text-1)]">
              {goalTypeTab === 'save' ? 'Plan for your future wealth' : 'Conquer your existing debts'}
            </h3>
            <p className="text-xs text-[var(--text-3)] leading-relaxed">
              {goalTypeTab === 'save'
                ? 'Set automated monthly pacing, link synced accounts, and watch your net worth milestones compound effortlessly.'
                : 'Add existing credit cards, auto loans, or mortgages to calculate interest reduction and optimal payoff dates.'}
            </p>
            <button
              onClick={() => handleOpenCreate(goalTypeTab)}
              className={`btn-primary text-xs px-6 py-3 mt-3 cursor-pointer text-white shadow-sm flex items-center gap-2 mx-auto font-bold ${
                goalTypeTab === 'save' ? 'bg-[#8B5CF6] hover:bg-[#7c4dff]' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {goalTypeTab === 'save' ? <Target className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              <span>{goalTypeTab === 'save' ? 'Add Your First Goal' : 'Add Debt Liability'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5. Active Cards Grid + Ghost Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)]">
                Active {goalTypeTab === 'save' ? 'Save Up Milestones' : 'Debt Paydown Liabilities'}
              </h3>
              <p className="text-xs text-[var(--text-3)]">
                {goalTypeTab === 'save' ? 'Track savings accumulation and compound interest horizons' : 'Monitor remaining principal balance, APR, and payoff speed'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredGoals.map(goal => {
              const isPaydown = goal.type === 'paydown';
              const pct = isPaydown
                ? Math.min(100, Math.round(((goal.target - goal.current) / goal.target) * 100))
                : Math.min(100, Math.round((goal.current / goal.target) * 100));
              const status = getGoalStatus(goal);

              return (
                <div
                  key={goal.id}
                  onClick={() => { setDetailGoal(goal); setIsDetailEditing(false); }}
                  className={`card p-5 space-y-4 flex flex-col justify-between cursor-pointer transition-all group ${
                    isPaydown ? 'hover:border-rose-500/50' : 'hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[150px]"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                        title={`${goal.category} ${isPaydown && goal.apr ? `• ${goal.apr}% APR` : ''}`}
                      >
                        {goal.category} {isPaydown && goal.apr ? `• ${goal.apr}% APR` : ''}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetailWithEdit(goal)}
                          className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-3)] hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(goal)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-[var(--text-1)] mt-2 group-hover:text-emerald-400 transition-colors truncate" title={goal.title}>
                      {goal.title}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-3)] min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3 h-3 text-[var(--text-4)]" />
                        <span>Target: {goal.date}</span>
                      </div>
                      {goal.linkedAccountName && goal.linkedAccountName !== 'None' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] truncate max-w-[120px]" title={goal.linkedAccountName}>
                          🔗 {goal.linkedAccountName}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-end mt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--text-3)]">{isPaydown ? 'Remaining Balance' : 'Saved'}</span>
                        <p className="font-mono font-bold text-[var(--text-1)]">{formatMoney(goal.current)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--text-3)]">{isPaydown ? 'Original Debt' : 'Target'}</span>
                        <p className="font-mono font-bold text-[var(--text-2)]">{formatMoney(goal.target)}</p>
                      </div>
                    </div>

                    {/* Progress bar with informative expected pacing marker tooltip */}
                    <div className="relative w-full bg-[var(--surface-3)] h-2.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ backgroundColor: goal.color, width: `${pct}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-sm cursor-help"
                        style={{ left: '50%' }}
                        title="Expected progress based on time-based timeline pacing (50% target)"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[var(--text-3)] font-medium">
                        +{formatMoney(goal.monthly || 500)}/mo pacing
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeposit(goal.id, 500)}
                      className={`btn-secondary text-xs !py-1 !px-2 w-full justify-center font-semibold cursor-pointer flex items-center gap-1 ${
                        isPaydown ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {isPaydown ? <CreditCard className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isPaydown ? 'Pay debt (-$500)' : 'Deposit $500'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Ghost Add Cards to balance layout when fewer than 3 goals */}
            {Array.from({ length: Math.max(0, 3 - filteredGoals.length) }).map((_, idx) => (
              <div
                key={`ghost-${idx}`}
                onClick={() => handleOpenCreate(goalTypeTab)}
                className="card p-6 border-2 border-dashed border-[var(--border-strong)] hover:border-[#8B5CF6] bg-[var(--surface-2)]/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group min-h-[220px]"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-3)] group-hover:bg-[#8B5CF6]/15 group-hover:text-[#8B5CF6] flex items-center justify-center text-[var(--text-3)] transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--text-2)] group-hover:text-[var(--text-1)]">
                    Add New {goalTypeTab === 'save' ? 'Goal' : 'Liability'}
                  </h4>
                  <p className="text-[10px] text-[var(--text-4)] mt-0.5">Fill empty slot with a custom objective</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal & Debt Templates Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)]">
              {goalTypeTab === 'save' ? 'Savings & Wealth Templates' : 'Debt Paydown Templates'}
            </h3>
            <p className="text-xs text-[var(--text-3)]">Pre-built objectives with suggested amounts & timelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(goalTypeTab === 'save' ? saveTemplates : paydownTemplates).map((tpl, i) => {
            const isAdded = goals.some(g => g.title === tpl.title);
            return (
              <div key={i} className="card-inner p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--text-3)]">
                    {tpl.category} {tpl.apr ? `• ${tpl.apr}% APR` : ''}
                  </span>
                  <h4 className="font-bold text-xs text-[var(--text-1)] mt-1.5">{tpl.title}</h4>
                  <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{formatMoney(tpl.target)} {tpl.apr ? 'balance' : 'target'}</p>
                </div>
                <button
                  onClick={() => !isAdded && applyTemplate(tpl)}
                  disabled={isAdded}
                  className={`text-xs !py-1.5 !px-3 w-full justify-center flex items-center gap-1.5 transition-all ${
                    isAdded
                      ? 'bg-[var(--surface-3)] text-[var(--text-4)] border border-[var(--border)] cursor-not-allowed opacity-60'
                      : 'btn-secondary text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 font-bold cursor-pointer'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Added ✓' : 'Add Template'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
