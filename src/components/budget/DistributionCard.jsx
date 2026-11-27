import React, { useMemo } from 'react';
import { PieChart } from 'lucide-react';
import { computeDistribution } from '../../budget/calc.js';
import { DonutChart } from '../charts/DonutChart.jsx';
import { useApp } from '../../context/AppContext.jsx';

export const DistributionCard = ({ period, transactions, categories = [] }) => {
  const { formatMoney } = useApp();

  const distribution = useMemo(() => {
    return computeDistribution(period, transactions, categories);
  }, [period, transactions, categories]);

  const chartData = distribution.rankedList.map(item => ({
    label: item.label,
    value: item.amount,
    color: item.color || '#3b82f6'
  }));

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-1)]">
            Spend Distribution &amp; Ranking
          </h3>
          <p className="text-xs text-[var(--text-3)]">
            Breakdown by spending category
          </p>
        </div>
      </div>

      <DonutChart data={chartData} title="" height={240} />
    </div>
  );
};
