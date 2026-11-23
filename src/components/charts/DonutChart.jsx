import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend);

export const DonutChart = ({ data = [], title = '' }) => {
  const labels = data.map(d => d.label);
  const values = data.map(d => d.value);
  const colors = data.map((d, i) => d.color || ['#0066FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'][i % 6]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 0,
        spacing: 0,
        hoverOffset: 4
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
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const val = Number(context.raw).toLocaleString();
            const total = context.dataset.data.reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((context.raw / total) * 100);
            return ` $${val} (${pct}%)`;
          }
        }
      }
    }
  };

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const colorsList = ['#0066FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'];

  const formatCompact = (n) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4" style={{ backgroundColor: 'var(--app-bg-2)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
      {title && <h3 className="font-bold text-sm text-[var(--text-1)]">{title}</h3>}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center mx-auto sm:mx-0">
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

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ background: item.color || colorsList[idx % colorsList.length] }} />
                  <span className="text-[var(--text-1)] font-bold">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-black text-[var(--text-1)]">
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
