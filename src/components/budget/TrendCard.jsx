import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, BarChart2, LineChart as LineIcon } from 'lucide-react';
import { computeTrendSeries } from '../../budget/calc.js';
import { useApp } from '../../context/AppContext.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendCard = ({ period, transactions }) => {
  const { formatMoney } = useApp();
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [grouping, setGrouping] = useState('auto'); // 'auto' | 'day' | 'week' | 'month'

  const series = useMemo(() => {
    return computeTrendSeries(period, transactions, grouping);
  }, [period, transactions, grouping]);

  const totalSeriesAmount = series.data.reduce((acc, val) => acc + val, 0);
  const txCount = (transactions || []).filter(tx => {
    if (tx.isExcluded) return false;
    const isExp = tx.isExpense !== undefined ? tx.isExpense : (tx.type !== 'income' && tx.type !== 'transfer' && tx.type !== 'adjustment' && Number(tx.amount) > 0);
    if (!isExp) return false;
    const t = new Date(tx.date).getTime();
    return t >= period.start.getTime() && t <= period.end.getTime();
  }).length;

  const chartData = {
    labels: series.labels,
    datasets: [
      {
        label: 'Spending',
        data: series.data,
        borderColor: '#10b981',
        backgroundColor: chartType === 'line' ? 'rgba(16, 185, 129, 0.1)' : '#10b981',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        borderRadius: 6
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
          label: (context) => ` Spend: ${formatMoney(context.raw, 2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-3)', font: { size: 10 } }
      },
      y: {
        grid: { color: 'var(--border)' },
        ticks: {
          color: 'var(--text-3)',
          font: { size: 10 },
          callback: (value) => formatMoney(value, 0)
        }
      }
    }
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-1)]">
            Spending Trend &amp; Velocity
          </h3>
          <p className="text-xs text-[var(--text-3)]">
            {txCount} transactions · grouped by {series.grouping} · total <span className="font-mono font-bold text-[var(--text-1)]">{formatMoney(totalSeriesAmount, 2)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grouping Select */}
          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] outline-none cursor-pointer"
          >
            <option value="auto">Auto Grouping</option>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-[var(--surface)] text-emerald-400 shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
              }`}
              title="Line Chart"
            >
              <LineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-[var(--surface)] text-emerald-400 shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {series.data.length === 0 || totalSeriesAmount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[var(--text-3)]">
            <TrendingUp className="w-8 h-8 opacity-40" />
            <p className="text-xs font-bold">No transaction trend data in this period.</p>
          </div>
        ) : (
          chartType === 'line' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )
        )}
      </div>
    </div>
  );
};
