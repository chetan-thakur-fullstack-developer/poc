import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';

export const PortfolioTab = () => {
  const { portfolioData, formatMoney, updatePortfolioYear, syncToCloud, isSyncing } = useApp();
  const [selectedYearIndex, setSelectedYearIndex] = useState(
    Math.max(0, (portfolioData?.defaultAccountData?.length || 1) - 1)
  );

  const categories = portfolioData?.categories || [];
  const years = portfolioData?.defaultAccountData || [];
  const activeYearData = years[selectedYearIndex] || {};

  // Calculate year totals
  const totalBalances = activeYearData.balances
    ? Object.values(activeYearData.balances).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;

  const totalInvested = activeYearData.invested
    ? Object.values(activeYearData.invested).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;

  const totalContri = activeYearData.contri
    ? Object.values(activeYearData.contri).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Portfolio & Wealth Tracker</h2>
          <p className="text-xs text-[var(--text-3)]">
            Multi-year tracking of 401(k), Roth IRA, HSA, ESPP, and CD savings balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector buttons */}
          <div className="flex p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            {years.map((y, idx) => (
              <button
                key={y.year}
                onClick={() => setSelectedYearIndex(idx)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedYearIndex === idx
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {y.year}
              </button>
            ))}
          </div>

          <button
            onClick={syncToCloud}
            disabled={isSyncing}
            className="btn-primary text-xs px-3 py-2 cursor-pointer"
          >
            {isSyncing ? 'Saving...' : 'Save to Supabase'}
          </button>
        </div>
      </div>

      {/* KPI Cards for Selected Year */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">
            {activeYearData.year} Base Salary
          </span>
          <p className="text-xl font-black font-mono text-[var(--text-1)] mt-1">
            <AnimatedNumber value={activeYearData.salary || 0} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">
            Total Year-End Balance
          </span>
          <p className="text-xl font-black font-mono text-purple-400 mt-1">
            <AnimatedNumber value={totalBalances} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">
            Total Capital Invested
          </span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">
            <AnimatedNumber value={totalInvested} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">
            Total Contributions
          </span>
          <p className="text-xl font-black font-mono text-blue-400 mt-1">
            <AnimatedNumber value={totalContri} />
          </p>
        </div>
      </div>

      {/* Portfolio Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title={`Asset Allocation Breakdown (${activeYearData.year})`}
          data={categories.map(cat => ({
            label: cat.label,
            value: activeYearData.balances?.[cat.key] || 0,
            color: cat.color
          }))}
        />
        <AreaChart
          title="Multi-Year Net Worth Growth History"
          color="#8B5CF6"
          height={220}
          data={years.map(y => ({
            label: y.year,
            value: Object.values(y.balances || {}).reduce((sum, v) => sum + (Number(v) || 0), 0)
          }))}
        />
      </div>

      {/* Categories Breakdown Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--text-1)]">
            Category Breakdown ({activeYearData.year})
          </h3>
          <span className="text-xs text-[var(--text-3)]">
            Inputs auto-sync with Supabase
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                <th className="py-2.5 font-semibold">Category</th>
                <th className="py-2.5 font-semibold">Tax Treatment</th>
                <th className="py-2.5 font-semibold text-right">Balance</th>
                <th className="py-2.5 font-semibold text-right">Invested</th>
                <th className="py-2.5 font-semibold text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {categories.map(cat => {
                const bal = activeYearData.balances?.[cat.key] || 0;
                const inv = activeYearData.invested?.[cat.key] || 0;
                const con = activeYearData.contri?.[cat.key] || 0;

                return (
                  <tr key={cat.key} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                    <td className="py-3 font-bold text-[var(--text-1)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.label}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-[var(--surface-3)] text-[var(--text-2)]">
                        {cat.type}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <input
                        type="number"
                        value={bal}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'balances', cat.key, e.target.value)}
                        className="w-28 text-right font-mono font-bold px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] text-xs focus:border-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <input
                        type="number"
                        value={inv}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'invested', cat.key, e.target.value)}
                        className="w-28 text-right font-mono px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] text-xs focus:border-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <input
                        type="number"
                        value={con}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'contri', cat.key, e.target.value)}
                        className="w-28 text-right font-mono px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-emerald-400 font-semibold text-xs focus:border-emerald-500 outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* IRS Base Limits Overview */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[var(--text-1)]">
          IRS Contribution Limits Tracker
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Object.entries(portfolioData?.irsBaseLimits || {}).map(([yr, lim]) => (
            <div key={yr} className="card-inner p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[var(--text-1)]">
                <span>{yr} Limits</span>
                {yr === activeYearData.year && (
                  <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                )}
              </div>
              <div className="text-[11px] space-y-1 text-[var(--text-2)] font-mono">
                <div className="flex justify-between">
                  <span>401(k):</span>
                  <span className="font-bold text-[var(--text-1)]">{formatMoney(lim.k401)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IRA:</span>
                  <span className="font-bold text-[var(--text-1)]">{formatMoney(lim.ira)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HSA Self:</span>
                  <span className="font-bold text-[var(--text-1)]">{formatMoney(lim.hsaSelf)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HSA Family:</span>
                  <span className="font-bold text-[var(--text-1)]">{formatMoney(lim.hsaFamily)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
