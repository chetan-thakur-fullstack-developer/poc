import React, { useState, useMemo } from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PieChart, ListOrdered } from 'lucide-react';
import { computeDistribution } from '../../budget/calc.js';
import { Amount } from './Amount.jsx';
import { useApp } from '../../context/AppContext.jsx';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DistributionCard = ({ period, transactions, categories = [] }) => {
  const { formatMoney } = useApp();
  const [chartStyle, setChartStyle] = useState('doughnut'); // 'doughnut' | 'pie'

  const distribution = useMemo(() => {
    return computeDistribution(period, transactions, categories);
  }, [period, transactions, categories]);

  const chartData = {
    labels: distribution.rankedList.map(item => item.label),
    datasets: [
      {
        data: distribution.rankedList.map(item => item.amount),
        backgroundColor: distribution.rankedList.map(item => item.color || '#3b82f6'),
        borderWidth: 2,
        borderColor: 'var(--surface)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatMoney(context.raw, 2)} (${distribution.rankedList[context.dataIndex]?.percentage}%)`
        }
      }
    }
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
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

        <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setChartStyle('doughnut')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartStyle === 'doughnut' ? 'bg-[var(--surface)] text-purple-400 shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            Doughnut
          </button>
          <button
            onClick={() => setChartStyle('pie')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartStyle === 'pie' ? 'bg-[var(--surface)] text-purple-400 shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
        {/* Chart Canvas */}
        <div className="h-60 sm:h-64 relative flex items-center justify-center">
          {distribution.rankedList.length === 0 ? (
            <div className="text-center space-y-2 text-[var(--text-3)]">
              <PieChart className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-bold">No spend distribution in range.</p>
            </div>
          ) : (
            chartStyle === 'doughnut' ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <Pie data={chartData} options={chartOptions} />
            )
          )}
        </div>

        {/* Ranked List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {distribution.rankedList.map((item, index) => (
            <div
              key={item.categoryId || index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-bold font-mono text-[var(--text-3)] w-4 text-right">
                  #{index + 1}
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-[var(--text-1)] truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[var(--text-3)]">
                  {item.percentage}%
                </span>
                <span className="font-mono font-black text-[var(--text-1)]">
                  <Amount value={item.amount} decimals={2} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
