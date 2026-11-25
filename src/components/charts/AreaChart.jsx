import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const AreaChart = ({ data = [], height = 260, color = '#0066FF', title = '' }) => {
  const labels = data.map(d => d.label);
  const values = data.map(d => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        data: values,
        borderColor: color,
        borderWidth: 3,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, color + '66');
          gradient.addColorStop(1, color + '00');
          return gradient;
        },
        tension: 0.35,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#34D399',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 14,
        displayColors: false,
        callbacks: {
          title: (context) => `Date / Period: ${context[0].label}`,
          label: (context) => ` Net Worth: $${Number(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#E2E8F0', font: { size: 11, weight: 'bold', family: 'Inter' } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: {
          color: '#E2E8F0',
          font: { size: 11, weight: 'bold', family: 'Inter' },
          callback: (val) => `$${Number(val).toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="card p-6 space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--text-1)]">{title}</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)] font-bold">
            Actual &amp; Projected History
          </span>
        </div>
      )}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
