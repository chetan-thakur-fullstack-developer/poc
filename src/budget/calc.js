/**
 * Pure calculation layer for the Budget Tab
 * Zero framework dependencies. Fully tested and deterministic.
 */

// --- Date Helpers ---
export const parseDate = (d) => {
  if (!d) return new Date();
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date() : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const formatDateStr = (date) => {
  const d = parseDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

export const diffInDays = (start, end) => {
  const s = parseDate(start);
  const e = parseDate(end);
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays) + 1; // inclusive count
};

// --- 1. resolvePeriod ---
export const resolvePeriod = (mode = 'month', monthInput = null, rangeInput = null, preset = 'mtd', nowInput = new Date()) => {
  const now = parseDate(nowInput);

  if (mode === 'month') {
    let year = now.getFullYear();
    let month = now.getMonth();
    if (monthInput) {
      if (typeof monthInput === 'string' && monthInput.includes('-')) {
        const [y, m] = monthInput.split('-').map(Number);
        if (!isNaN(y) && !isNaN(m)) {
          year = y;
          month = m - 1;
        }
      } else if (typeof monthInput === 'object' && monthInput.year !== undefined && monthInput.month !== undefined) {
        year = monthInput.year;
        month = monthInput.month - 1;
      }
    }
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // last day of month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const label = `${monthNames[month]} ${year}`;
    return { start, end, label, mode, month: `${year}-${String(month + 1).padStart(2, '0')}`, isValid: true };
  }

  // Range mode
  if (preset === 'custom') {
    if (!rangeInput || !rangeInput.start || !rangeInput.end) {
      return { error: 'Missing custom date', isValid: false };
    }
    const start = parseDate(rangeInput.start);
    const end = parseDate(rangeInput.end);
    if (start.getTime() > end.getTime()) {
      return { error: 'Start date cannot be after end date', isValid: false };
    }
    const label = `${formatDateStr(start)} to ${formatDateStr(end)}`;
    return { start, end, label, mode, preset, customRange: rangeInput, isValid: true };
  }

  // Preset ranges relative to now
  let start = new Date(now);
  let end = new Date(now);
  let label = 'Month to Date';

  const todayTime = now.getTime();

  switch (preset) {
    case 'all_time': {
      start = new Date(now);
      end = new Date(now);
      label = 'All Time';
      break;
    }
    case 'ytd': {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now);
      label = 'Year to Date';
      break;
    }
    case 'mtd': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      label = 'Month to Date';
      break;
    }
    case 'last_7': {
      start = new Date(todayTime - 6 * 24 * 60 * 60 * 1000);
      end = new Date(now);
      label = 'Last 7 Days';
      break;
    }
    case 'last_30': {
      start = new Date(todayTime - 29 * 24 * 60 * 60 * 1000);
      end = new Date(now);
      label = 'Last 30 Days';
      break;
    }
    case 'last_90': {
      start = new Date(todayTime - 89 * 24 * 60 * 60 * 1000);
      end = new Date(now);
      label = 'Last 90 Days';
      break;
    }
    case 'last_12_months': {
      start = new Date(todayTime - 364 * 24 * 60 * 60 * 1000);
      end = new Date(now);
      label = 'Last 12 Months';
      break;
    }
    case 'last_year': {
      const prevYear = now.getFullYear() - 1;
      start = new Date(prevYear, 0, 1);
      end = new Date(prevYear, 11, 31);
      label = String(prevYear);
      break;
    }
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      label = 'Month to Date';
      break;
    }
  }

  return { start, end, label, mode, preset, isValid: true };
};

// --- 2. computePeriodMetrics ---
export const computePeriodMetrics = (period, transactions = [], caps = [], monthlyBudget = 0, nowInput = new Date()) => {
  if (!period || !period.isValid || !period.start || !period.end) {
    return {
      totalDays: 0,
      elapsedDays: 0,
      daysLeft: 0,
      budget: 0,
      spent: 0,
      remaining: 0,
      safeToSpend: 0,
      pctSpent: 0,
      pctElapsed: 0,
      paceStatus: 'On track',
      projectedPeriodEnd: 0,
      dailyAverage: 0,
      recommendedDaily: 0
    };
  }

  const now = parseDate(nowInput);
  const start = parseDate(period.start);
  const end = parseDate(period.end);

  const totalDays = diffInDays(start, end);

  const effectiveToday = now.getTime() < start.getTime() ? start : (now.getTime() > end.getTime() ? end : now);
  const rawElapsed = diffInDays(start, effectiveToday);
  let elapsedDays = clamp(rawElapsed, 0, totalDays);

  if (now.getTime() < start.getTime()) {
    elapsedDays = 0;
  } else if (now.getTime() > end.getTime()) {
    elapsedDays = totalDays;
  }

  const daysLeft = Math.max(0, totalDays - elapsedDays);

  let spent = 0;
  const startTime = start.getTime();
  const endTime = end.getTime();

  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;

    const txDate = parseDate(tx.date).getTime();
    if (txDate >= startTime && txDate <= endTime) {
      spent += Number(tx.amount) || 0;
    }
  });

  let sumCaps = 0;
  (caps || []).forEach(c => {
    const limit = Number(c.limit !== undefined ? c.limit : c.amount) || 0;
    sumCaps += limit;
  });

  const budget = (monthlyBudget !== undefined && Number(monthlyBudget) > 0) ? Number(monthlyBudget) : sumCaps;

  const remaining = budget - spent;
  const safeToSpend = daysLeft > 0 ? remaining / daysLeft : remaining;
  const pctSpent = budget > 0 ? (spent / budget) * 100 : 0;
  const pctElapsed = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

  let paceStatus = 'Steady';
  if (pctSpent - pctElapsed > 5) {
    paceStatus = 'Ahead';
  } else if (pctSpent - pctElapsed < -5) {
    paceStatus = 'On track';
  }

  const dailyAverage = elapsedDays > 0 ? spent / elapsedDays : 0;
  const projectedPeriodEnd = elapsedDays > 0 ? (spent / elapsedDays) * totalDays : 0;
  const recommendedDaily = daysLeft > 0 ? safeToSpend : remaining;

  return {
    totalDays,
    elapsedDays,
    daysLeft,
    budget: Number(budget.toFixed(2)),
    spent: Number(spent.toFixed(2)),
    remaining: Number(remaining.toFixed(2)),
    safeToSpend: Number(safeToSpend.toFixed(2)),
    pctSpent: Number(pctSpent.toFixed(1)),
    pctElapsed: Number(pctElapsed.toFixed(1)),
    paceStatus,
    projectedPeriodEnd: Number(projectedPeriodEnd.toFixed(2)),
    dailyAverage: Number(dailyAverage.toFixed(2)),
    recommendedDaily: Number(recommendedDaily.toFixed(2))
  };
};

// --- 3. computeInsights ---
export const computeInsights = (period, transactions = [], caps = [], priorTransactions = [], priorCaps = []) => {
  const insights = [];
  const metrics = computePeriodMetrics(period, transactions, caps);

  const capMap = {};
  (caps || []).forEach(c => {
    capMap[c.id] = Number(c.limit !== undefined ? c.limit : c.amount) || 0;
  });

  const catSpend = {};
  const startTime = parseDate(period.start).getTime();
  const endTime = parseDate(period.end).getTime();

  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;
    const txDate = parseDate(tx.date).getTime();
    if (txDate >= startTime && txDate <= endTime) {
      const catId = tx.categoryId || 'uncategorized';
      catSpend[catId] = (catSpend[catId] || 0) + (Number(tx.amount) || 0);
    }
  });

  Object.entries(catSpend).forEach(([catId, spent]) => {
    const limit = capMap[catId] || 0;
    if (limit > 0 && spent > limit) {
      if (insights.length < 4) {
        insights.push({
          id: `over_cap_${catId}`,
          type: 'danger',
          title: 'Budget Exceeded',
          message: `Category spend ($${spent.toFixed(2)}) has exceeded its cap ($${limit.toFixed(2)}).`,
          priority: 1
        });
      }
    }
  });

  Object.entries(catSpend).forEach(([catId, spent]) => {
    const limit = capMap[catId] || 0;
    if (limit > 0 && spent <= limit && (spent / limit) >= 0.9) {
      if (insights.length < 4) {
        insights.push({
          id: `near_cap_${catId}`,
          type: 'warning',
          title: 'Approaching Cap Limit',
          message: `Category has used over 90% of its assigned budget cap.`,
          priority: 2
        });
      }
    }
  });

  if (priorTransactions && priorTransactions.length > 0) {
    let priorSpent = 0;
    (priorTransactions || []).forEach(tx => {
      if (tx.isExcluded) return;
      const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
      if (isExp) priorSpent += Number(tx.amount) || 0;
    });

    if (priorSpent > 0 && metrics.spent > priorSpent * 1.25) {
      if (insights.length < 4) {
        insights.push({
          id: 'material_increase',
          type: 'warning',
          title: 'Higher Spend Pace',
          message: `Current period spending is ≥ 25% higher than the prior equivalent period.`,
          priority: 3
        });
      }
    }
  }

  let hasUncappedSpendWithTx = false;
  Object.entries(catSpend).forEach(([catId, spent]) => {
    const limit = capMap[catId] !== undefined ? capMap[catId] : 0;
    if (spent > 0 && limit === 0) {
      hasUncappedSpendWithTx = true;
    }
  });

  if (hasUncappedSpendWithTx && insights.length < 4) {
    insights.push({
      id: 'uncapped_spend',
      type: 'info',
      title: 'Uncapped Spending Detected',
      message: `You have expenses in categories without an active budget cap.`,
      priority: 4
    });
  }

  if (insights.length === 0) {
    return [{
      id: 'all_clear',
      type: 'success',
      title: 'All Clear',
      message: 'All spending is well within budget caps and pacing normally.',
      priority: 0
    }];
  }

  return insights;
};

// --- 4. computeTrendSeries ---
export const computeTrendSeries = (period, transactions = [], grouping = 'auto') => {
  if (!period || !period.isValid) return { labels: [], data: [], grouping: 'day' };

  const start = parseDate(period.start);
  const end = parseDate(period.end);
  const totalDays = diffInDays(start, end);

  let effectiveGrouping = grouping;
  if (grouping === 'auto') {
    if (totalDays <= 45) effectiveGrouping = 'day';
    else if (totalDays <= 180) effectiveGrouping = 'week';
    else effectiveGrouping = 'month';
  }

  const startTime = start.getTime();
  const endTime = end.getTime();
  const buckets = {};

  const currentDate = new Date(start);
  while (currentDate.getTime() <= endTime) {
    let key = formatDateStr(currentDate);
    if (effectiveGrouping === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - d.getDay());
      key = formatDateStr(d);
    } else if (effectiveGrouping === 'month') {
      key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!buckets[key]) buckets[key] = 0;

    if (effectiveGrouping === 'day') currentDate.setDate(currentDate.getDate() + 1);
    else if (effectiveGrouping === 'week') currentDate.setDate(currentDate.getDate() + 7);
    else currentDate.setMonth(currentDate.getMonth() + 1);
  }

  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;

    const txDate = parseDate(tx.date);
    const txTime = txDate.getTime();
    if (txTime >= startTime && txTime <= endTime) {
      let key = formatDateStr(txDate);
      if (effectiveGrouping === 'week') {
        const d = new Date(txDate);
        d.setDate(d.getDate() - d.getDay());
        key = formatDateStr(d);
      } else if (effectiveGrouping === 'month') {
        key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      }
      if (buckets[key] !== undefined) {
        buckets[key] += Number(tx.amount) || 0;
      }
    }
  });

  const labels = Object.keys(buckets).sort();
  const data = labels.map(l => Number(buckets[l].toFixed(2)));

  return { labels, data, grouping: effectiveGrouping };
};

// --- 5. computeDistribution ---
export const computeDistribution = (period, transactions = [], caps = []) => {
  if (!period || !period.isValid) return { slices: [], rankedList: [] };

  const startTime = parseDate(period.start).getTime();
  const endTime = parseDate(period.end).getTime();
  const catSpend = {};
  let totalSpent = 0;

  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;

    const txDate = parseDate(tx.date).getTime();
    if (txDate >= startTime && txDate <= endTime) {
      const catId = tx.categoryId || 'uncategorized';
      const amt = Number(tx.amount) || 0;
      catSpend[catId] = (catSpend[catId] || 0) + amt;
      totalSpent += amt;
    }
  });

  const capMap = {};
  (caps || []).forEach(c => {
    capMap[c.id] = c;
  });

  const rankedList = Object.entries(catSpend)
    .map(([catId, amount]) => {
      const catInfo = capMap[catId] || { label: catId, color: '#3b82f6', icon: 'tag' };
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      return {
        categoryId: catId,
        label: catInfo.label || catId,
        color: catInfo.color || '#3b82f6',
        icon: catInfo.icon || 'tag',
        amount: Number(amount.toFixed(2)),
        percentage: Number(percentage.toFixed(1))
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { slices: rankedList, rankedList };
};

// --- 6. computeCategoryRows ---
export const computeCategoryRows = (period, transactions = [], caps = [], groups = [], categoryOrder = []) => {
  if (!period || !period.isValid) return [];

  const startTime = parseDate(period.start).getTime();
  const endTime = parseDate(period.end).getTime();
  const catSpend = {};

  (transactions || []).forEach(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;

    const txDate = parseDate(tx.date).getTime();
    if (txDate >= startTime && txDate <= endTime) {
      const catId = tx.categoryId || 'uncategorized';
      catSpend[catId] = (catSpend[catId] || 0) + (Number(tx.amount) || 0);
    }
  });

  const rows = (caps || []).map(cat => {
    const spent = catSpend[cat.id] || 0;
    const limit = Number(cat.limit !== undefined ? cat.limit : cat.amount) || 0;
    const remaining = limit - spent;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    const isOver = spent > limit;

    return {
      ...cat,
      spent: Number(spent.toFixed(2)),
      limit: Number(limit.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      pct: Number(pct.toFixed(1)),
      isOver
    };
  });

  if (categoryOrder && categoryOrder.length > 0) {
    rows.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.id);
      const idxB = categoryOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  return rows;
};

// --- 7. selectRecurring ---
export const selectRecurring = (subscriptions = [], period) => {
  if (!period || !period.isValid) return subscriptions;
  const startTime = parseDate(period.start).getTime();
  const endTime = parseDate(period.end).getTime();

  return (subscriptions || []).filter(sub => {
    if (sub.active === false) return false;
    if (!sub.lastOccurrence && !sub.nextDueDate) return true;
    const occurrenceDate = parseDate(sub.lastOccurrence || sub.nextDueDate).getTime();
    return occurrenceDate >= startTime && occurrenceDate <= endTime || sub.active !== false;
  });
};

// --- 8. selectRecentActivity ---
export const selectRecentActivity = (transactions = [], period) => {
  if (!period || !period.isValid) return [];
  const startTime = parseDate(period.start).getTime();
  const endTime = parseDate(period.end).getTime();

  const filtered = (transactions || []).filter(tx => {
    if (tx.isExcluded) return;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return;
    const txDate = parseDate(tx.date).getTime();
    return txDate >= startTime && txDate <= endTime;
  });

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return filtered.slice(0, 8);
};
