import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend);

export const DonutChart = ({ data = [], title = '', height = 280 }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  // Filter out 0% assets to remove clutter
  const activeData = data.filter(d => Number(d.value) > 0);

  const labels = activeData.map(d => d.label);
  const values = activeData.map(d => d.value);
  const colors = activeData.map((d, i) => d.color || ['#0066FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'][i % 6]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: activeCategory ? activeData.map(d => d.label === activeCategory ? 3 : 0) : 0,
        borderColor: '#ffffff',
        borderRadius: 4,
        spacing: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '76%',
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#34D399',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const val = Number(context.raw).toLocaleString();
            const total = context.dataset.data.reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((context.raw / total) * 100);
            return ` $${val} (${pct}% of portfolio)`;
          }
        }
      }
    }
  };

  const total = activeData.reduce((sum, d) => sum + d.value, 0) || 1;
  const colorsList = ['#0066FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'];

  const formatCompact = (n) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="card p-6 space-y-4 h-full flex flex-col justify-between" style={{ backgroundColor: 'var(--app-bg-2)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--text-1)]">{title}</h3>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto" style={{ minHeight: `${height}px` }}>
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center mx-auto sm:mx-0">
          <div className="absolute inset-0 w-full h-full">
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-[9px] uppercase font-bold text-[var(--text-3)] tracking-wider">Total</span>
            <span className="text-xs sm:text-sm font-black font-mono text-[var(--text-1)] mt-0.5" title={`$${total.toLocaleString()}`}>
              {formatCompact(total)}
            </span>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="flex-1 w-full space-y-2">
          {activeData.map((item, idx) => {
            const pct = Math.round((item.value / total) * 100);
            const isSelected = activeCategory === item.label;
            return (
              <div
                key={idx}
                onClick={() => setActiveCategory(isSelected ? null : item.label)}
                className={`flex items-center justify-between text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-sm'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ background: item.color || colorsList[idx % colorsList.length] }} />
                  <span className={`font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-[var(--text-1)]'}`}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-black text-[var(--text-1)] shrink-0">
                  <span className="text-emerald-400 font-bold text-[11px]">{pct}%</span>
                  <span className="text-xs">${item.value.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
