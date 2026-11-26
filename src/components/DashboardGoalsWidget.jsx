import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { Target, CreditCard, Plus, ChevronRight, Calendar, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

/* ─── Goal Card (shared between desktop grid & mobile carousel) ─── */
const GoalCard = ({ goal, onDeposit, formatMoney, getGoalStatus, isMobile }) => {
  const isPaydown = goal.type === 'paydown';
  const pct = isPaydown
    ? Math.min(100, Math.round(((goal.target - goal.current) / goal.target) * 100))
    : Math.min(100, Math.round((goal.current / goal.target) * 100));

  const status = getGoalStatus(goal);
  const remaining = isPaydown ? goal.current : Math.max(0, goal.target - goal.current);
  const isOnTrack = status.label.includes('On Track') || status.label.includes('Achieved');
  const isAchieved = status.label.includes('Achieved') || status.label.includes('Debt Free');

  // Determine bar color semantics
  const barColor = isAchieved || (isPaydown && pct === 100)
    ? '#10B981'
    : isPaydown
    ? '#EF4444'
    : isOnTrack
    ? '#10B981'
    : '#F59E0B';

  const barBg = isAchieved || (isPaydown && pct === 100)
    ? 'bg-emerald-500/15'
    : isPaydown
    ? 'bg-rose-500/10'
    : isOnTrack
    ? 'bg-emerald-500/10'
    : 'bg-amber-500/10';

  const formatDeadline = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`
        card p-4 sm:p-5 flex flex-col justify-between gap-3
        transition-all group
        ${isMobile
          ? 'snap-center shrink-0 w-[85vw] min-w-[280px] max-w-[340px]'
          : 'w-full'
        }
        ${isPaydown ? 'hover:border-rose-500/40' : 'hover:border-emerald-500/40'}
        hover:shadow-lg
      `}
    >
      {/* Top: Icon, Title, Status Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}40` }}
            >
              {isPaydown ? (
                <CreditCard className="w-4 h-4" style={{ color: goal.color }} />
              ) : (
                <Target className="w-4 h-4" style={{ color: goal.color }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                  {isPaydown ? (goal.apr ? `${goal.apr}% APR` : 'Debt') : (goal.category || 'Goal')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[var(--text-1)] truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mt-0.5" title={goal.title}>
                {goal.title}
              </h4>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 whitespace-nowrap ${status.color}`}>
            {status.label.replace(/^[^\w]*/, '').split('(')[0].trim()}
          </span>
        </div>

        {/* Amount: Balance/Saved vs Target */}
        {isMobile ? (
          <div className="text-center pt-1">
            <div className="text-2xl font-black font-mono text-[var(--text-1)]">
              {formatMoney(goal.current)}
            </div>
            <div className="text-[11px] text-[var(--text-3)] mt-0.5">
              {isPaydown ? `of ${formatMoney(goal.target)} original balance` : `of ${formatMoney(goal.target)} target`}
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-[var(--text-3)] block">{isPaydown ? 'Remaining Balance' : 'Saved'}</span>
              <span className="font-mono font-bold text-sm text-[var(--text-1)]">
                {formatMoney(goal.current)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--text-3)] block">{isPaydown ? 'Original Debt' : 'Target'}</span>
              <span className="font-mono text-xs text-[var(--text-3)]">
                {formatMoney(goal.target)}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className={`relative w-full h-2.5 rounded-full overflow-hidden ${barBg}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-3)]">
            <span className="font-bold" style={{ color: barColor }}>
              {isPaydown ? `${pct}% paid off` : `${pct}% complete`}
            </span>
            <span>{isPaydown ? `${formatMoney(remaining)} left` : `${formatMoney(remaining)} remaining`}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {isMobile ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDeposit(goal); }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[48px] border ${
            isPaydown
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
          }`}
        >
          {isPaydown ? <CreditCard className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isPaydown ? 'Pay Debt (-$500)' : 'Add Deposit'}</span>
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onDeposit(goal); }}
          className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer group/btn pt-1 ${
            isPaydown ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300' : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
            isPaydown ? 'bg-rose-500/15 group-hover/btn:bg-rose-500/25' : 'bg-emerald-500/15 group-hover/btn:bg-emerald-500/25'
          }`}>
            {isPaydown ? <CreditCard className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </div>
          <span>{isPaydown ? 'Pay Principal' : 'Quick Deposit'}</span>
        </button>
      )}
    </motion.div>
  );
};

/* ─── Pagination Dots for mobile carousel ─── */
const PaginationDots = ({ total, active }) => (
  <div className="flex items-center justify-center gap-1.5 pt-3 md:hidden">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === active
            ? 'w-5 h-1.5 bg-emerald-600 dark:bg-emerald-400'
            : 'w-1.5 h-1.5 bg-[var(--border)]'
        }`}
      />
    ))}
  </div>
);

/* ─── Empty State ─── */
const GoalsEmptyState = ({ onCreateGoal }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="card p-8 sm:p-10 text-center space-y-4 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-2)] border border-emerald-500/20 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(#10B981_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-[0.06] pointer-events-none" />

    <div className="relative z-10 max-w-sm mx-auto space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto shadow-md">
        <Sparkles className="w-7 h-7" />
      </div>
      <h3 className="text-base font-black text-[var(--text-1)]">
        Set your first financial goal or liability
      </h3>
      <p className="text-xs text-[var(--text-3)] leading-relaxed max-w-xs mx-auto">
        Track your savings milestones and debt paydown liabilities in one unified dashboard snapshot.
      </p>
      <button
        onClick={onCreateGoal}
        className="btn-primary text-xs px-5 py-3 mt-2 cursor-pointer text-white shadow-md flex items-center gap-2 mx-auto font-bold min-h-[44px] bg-emerald-600 hover:bg-emerald-500 transition-colors"
      >
        <Target className="w-4 h-4" />
        <span>Create Your First Goal</span>
      </button>
    </div>
  </motion.div>
);

/* ─── Main Dashboard Goals Widget ─── */
export const DashboardGoalsWidget = () => {
  const {
    goals,
    formatMoney,
    getGoalStatus,
    openDepositModal,
    setCurrentTab,
    handleOpenCreate
  } = useApp();

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMilestones = goals || [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.firstElementChild?.offsetWidth || 280;
      const gap = 12;
      const idx = Math.round(el.scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(idx, activeMilestones.length - 1));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [activeMilestones.length]);

  const saveCount = activeMilestones.filter(g => (g.type || 'save') === 'save').length;
  const paydownCount = activeMilestones.filter(g => g.type === 'paydown').length;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)] hidden sm:block">Active Goals &amp; Liabilities</h3>
            <h3 className="font-bold text-sm text-[var(--text-1)] sm:hidden">Goals &amp; Debt</h3>
            {activeMilestones.length > 0 && (
              <p className="text-[10px] text-[var(--text-3)] hidden sm:block">
                {saveCount} goal{saveCount !== 1 ? 's' : ''} • {paydownCount} debt {paydownCount !== 1 ? 'liabilities' : 'liability'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setCurrentTab('tab-goals')}
          className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {activeMilestones.length === 0 ? (
        <GoalsEmptyState onCreateGoal={() => handleOpenCreate('save')} />
      ) : (
        <>
          {/* Mobile: Horizontal Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 hide-scrollbar md:hidden"
          >
            {activeMilestones.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDeposit={openDepositModal}
                formatMoney={formatMoney}
                getGoalStatus={getGoalStatus}
                isMobile={true}
              />
            ))}
          </div>

          {/* Pagination Dots (mobile only) */}
          {activeMilestones.length > 1 && (
            <PaginationDots total={activeMilestones.length} active={activeIndex} />
          )}

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMilestones.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDeposit={openDepositModal}
                formatMoney={formatMoney}
                getGoalStatus={getGoalStatus}
                isMobile={false}
              />
            ))}
          </div>

          {/* If more than 3 milestones, show a subtle "view more" indicator on desktop */}
          {activeMilestones.length > 3 && (
            <div className="hidden md:flex justify-center pt-1">
              <button
                onClick={() => setCurrentTab('tab-goals')}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-3)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>+{activeMilestones.length - 3} more item{activeMilestones.length - 3 !== 1 ? 's' : ''}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
