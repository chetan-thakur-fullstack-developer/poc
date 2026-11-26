import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  resolvePeriod,
  computePeriodMetrics,
  computeInsights,
  computeTrendSeries,
  computeDistribution,
  computeCategoryRows,
  selectRecurring,
  selectRecentActivity
} from '../../budget/calc.js';
import { BudgetHeader } from '../budget/BudgetHeader.jsx';
import { SummaryIndicators } from '../budget/SummaryIndicators.jsx';
import { InsightsCards } from '../budget/InsightsCards.jsx';
import { PaceCard } from '../budget/PaceCard.jsx';
import { TrendCard } from '../budget/TrendCard.jsx';
import { CategoriesCard } from '../budget/CategoriesCard.jsx';
import { DistributionCard } from '../budget/DistributionCard.jsx';
import { SubscriptionsCard } from '../budget/SubscriptionsCard.jsx';
import { RecentActivityCard } from '../budget/RecentActivityCard.jsx';
import { ManageBudgetModal } from '../budget/ManageBudgetModal.jsx';

export const ExpensesTab = () => {
  const { expensesData, setExpensesData, transactions, showToast, isDemoUser, user } = useApp();

  // Storage prefix for persistence (BR-10)
  const storagePrefix = isDemoUser ? 'ew_demo_budget_' : `ew_user_${user?.id || 'real'}_budget_`;

  // Period State persistence
  const [periodState, setPeriodState] = useState(() => {
    try {
      const saved = localStorage.getItem(storagePrefix + 'period');
      return saved ? JSON.parse(saved) : { mode: 'month', month: null, preset: 'mtd', customRange: { start: '', end: '' } };
    } catch {
      return { mode: 'month', month: null, preset: 'mtd', customRange: { start: '', end: '' } };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storagePrefix + 'period', JSON.stringify(periodState));
    } catch (e) {
      console.error('Failed to persist budget period state', e);
    }
  }, [periodState, storagePrefix]);

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Resolve period using calculation module
  const period = useMemo(() => {
    return resolvePeriod(
      periodState.mode,
      periodState.month,
      periodState.customRange,
      periodState.preset
    );
  }, [periodState]);

  // Categories & Caps
  const categories = expensesData?.categories || [];
  const setCategories = (updater) => {
    setExpensesData(prev => {
      const nextCats = typeof updater === 'function' ? updater(prev?.categories || []) : updater;
      return { ...prev, categories: nextCats };
    });
  };

  // Compute metrics in single pass (BR-9)
  const metrics = useMemo(() => {
    return computePeriodMetrics(period, transactions, categories);
  }, [period, transactions, categories]);

  // Compute insights
  const insights = useMemo(() => {
    return computeInsights(period, transactions, categories);
  }, [period, transactions, categories]);

  return (
    <div className="space-y-6 sm:space-y-8 select-none animate-fadeIn pb-12">
      {/* Header & Period Controls */}
      <BudgetHeader
        period={period}
        periodState={periodState}
        setPeriodState={setPeriodState}
        onOpenManageBudget={() => setIsManageModalOpen(true)}
      />

      {/* Summary Indicators */}
      <SummaryIndicators
        metrics={metrics}
        cappedCount={categories.length}
        onManageClick={() => setIsManageModalOpen(true)}
      />

      {/* Smart Insights & Pacing Alerts */}
      <InsightsCards insights={insights} />

      {/* Budget Pace & Trajectory Card */}
      <PaceCard metrics={metrics} />

      {/* Spending Trend & Velocity Chart */}
      <TrendCard period={period} transactions={transactions} />

      {/* Category Budgets & Caps */}
      <CategoriesCard
        period={period}
        transactions={transactions}
        categories={categories}
        setCategories={setCategories}
        onAddCategoryAttempt={() => setIsManageModalOpen(true)}
      />

      {/* Spend Distribution & Ranking */}
      <DistributionCard period={period} transactions={transactions} categories={categories} />

      {/* Recurring Subscriptions & Bills */}
      <SubscriptionsCard period={period} transactions={transactions} />

      {/* Recent Activity in Period */}
      <RecentActivityCard period={period} transactions={transactions} />

      {/* Manage Budget Modal */}
      <ManageBudgetModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        categories={categories}
        setCategories={setCategories}
      />
    </div>
  );
};
