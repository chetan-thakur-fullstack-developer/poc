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
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, color + '55');
          gradient.addColorStop(1, color + '00');
          return gradient;
        },
        tension: 0.35,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(11, 17, 32, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#10B981',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` $${Number(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { size: 10, family: 'Inter' } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#94A3B8',
          font: { size: 10, family: 'Inter' },
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
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]">
            Chart.js Engine
          </span>
        </div>
      )}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
