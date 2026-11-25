import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { TrendingUp, TrendingDown, Plus, ChevronDown, ChevronUp, Calendar, Layers, Trash2, RotateCcw } from 'lucide-react';

export const PortfolioTab = () => {
  const { portfolioData, formatMoney, updatePortfolioYear, addNewPortfolioYear, addNewPortfolioCategory, deletePortfolioYear, resetPortfolioYearValues, syncToCloud, isSyncing, showConfirmModal } = useApp();
  const [selectedYearIndex, setSelectedYearIndex] = useState(
    Math.max(0, (portfolioData?.defaultAccountData?.length || 1) - 1)
  );

  const [newYearStr, setNewYearStr] = useState('2027');
  const [showAddCat, setShowAddCat] = useState(false);
  const [catLabel, setCatLabel] = useState('');
  const [catType, setCatType] = useState('taxable');
  const [catColor, setCatColor] = useState('#10B981');
  const [expandedOldYears, setExpandedOldYears] = useState({});
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});

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

  const totalCatBalance = categories.reduce((sum, c) => sum + (activeYearData.balances?.[c.key] || 0), 0);
  const totalCatInvested = categories.reduce((sum, c) => sum + (activeYearData.invested?.[c.key] || 0), 0);
  const totalCatContri = categories.reduce((sum, c) => sum + (activeYearData.contri?.[c.key] || 0), 0);

  // Growth calculation vs previous year
  const prevYearData = selectedYearIndex > 0 ? years[selectedYearIndex - 1] : null;
  const prevTotalBalances = prevYearData?.balances
    ? Object.values(prevYearData.balances).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;
  const growthAmount = totalBalances - prevTotalBalances;
  const growthPct = prevTotalBalances > 0 ? (growthAmount / prevTotalBalances) * 100 : 0;

  const formatInputValue = (val) => {
    const num = Number(val);
    return isNaN(num) || val === '' || val === undefined ? '' : num.toLocaleString();
  };

  const parseInputValue = (str) => {
    const cleaned = String(str).replace(/[^0-9.-]/g, '');
    return cleaned === '' ? 0 : Number(cleaned);
  };

  const handleAddYear = (e) => {
    e.preventDefault();
    const yr = newYearStr.trim();
    if (!yr) return;
    const newIdx = addNewPortfolioYear(yr);
    setSelectedYearIndex(newIdx);
    setNewYearStr(String(Number(yr) + 1));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!catLabel.trim()) return;
    addNewPortfolioCategory(catLabel.trim(), catType, catColor);
    setCatLabel('');
    setShowAddCat(false);
  };

  const handleDeleteCurrentYear = () => {
    if (years.length <= 1) {
      showConfirmModal({
        title: 'Cannot Delete Year',
        message: 'Cannot delete the last remaining portfolio year.',
        confirmText: 'OK',
        isDanger: false
      });
      return;
    }
    showConfirmModal({
      title: `Delete Year ${activeYearData.year}?`,
      message: `Are you sure you want to delete year ${activeYearData.year}? All archived balances and contributions for this year will be permanently removed.`,
      confirmText: 'Delete Year',
      isDanger: true,
      onConfirm: () => {
        const nextIndex = Math.max(0, selectedYearIndex - 1);
        deletePortfolioYear(selectedYearIndex);
        setSelectedYearIndex(nextIndex);
      }
    });
  };

  const handleResetCurrentYear = () => {
    showConfirmModal({
      title: `Reset ${activeYearData.year} to $0?`,
      message: `Are you sure you want to reset all values for ${activeYearData.year} to $0? This will clear all balances, invested capital, and contributions for this year.`,
      confirmText: 'Reset to $0',
      isDanger: true,
      onConfirm: () => {
        resetPortfolioYearValues(selectedYearIndex);
      }
    });
  };

  const toggleExpandYear = (yr) => {
    setExpandedOldYears(prev => ({ ...prev, [yr]: !prev[yr] }));
  };

  const toggleMobileCategory = (key) => {
    setExpandedMobileCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sort archived years latest first
  const sortedArchivedYears = [...years]
    .map((y, idx) => ({ ...y, originalIndex: idx }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div className="space-y-6 pb-40 select-none">
      {/* Top Header & Year Filter / Growth Summary Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-[var(--surface)] border border-emerald-500/30 space-y-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PORTFOLIO GROWTH INTELLIGENCE
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              {/* Stacked total balance & sync button on mobile */}
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-1)] font-mono tracking-tight">
                {formatMoney(totalBalances)}
              </h2>
              {prevYearData && (
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm ${
                  growthAmount >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {growthAmount >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{growthAmount >= 0 ? '+' : ''}{growthPct.toFixed(1)}% vs {prevYearData.year}</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-3)] max-w-xl">
              Comparative multi-year asset growth, tax treatments, and contribution limits for <b>{activeYearData.year}</b>.
            </p>
          </div>

          {/* Action Toolbar (Stacked on mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 bg-[var(--surface-2)] p-2 rounded-2xl border border-[var(--border-strong)]">
              <span className="text-xs font-bold text-[var(--text-3)] pl-1">Year:</span>
              <select
                value={selectedYearIndex}
                onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
                className="input-field text-xs font-mono font-bold w-28 py-1.5 cursor-pointer bg-[var(--surface)]"
              >
                {years.map((y, idx) => (
                  <option key={y.year} value={idx}>
                    {y.year} {idx === selectedYearIndex ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddYear} className="flex items-center gap-1.5 bg-[var(--surface-2)] p-2 rounded-2xl border border-[var(--border-strong)]">
              <input
                type="text"
                placeholder="YYYY"
                value={newYearStr}
                onChange={(e) => setNewYearStr(e.target.value)}
                maxLength={4}
                className="w-16 px-2 py-1.5 text-xs font-mono font-bold text-center rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] outline-none"
              />
              <button
                type="submit"
                disabled={years.some(y => y.year === newYearStr.trim())}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  years.some(y => y.year === newYearStr.trim())
                    ? 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                    : 'btn-secondary !py-1.5 !px-3'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{years.some(y => y.year === newYearStr.trim()) ? 'Added' : 'Add Year'}</span>
              </button>
            </form>

            <button
              onClick={syncToCloud}
              disabled={isSyncing}
              className="btn-primary text-xs px-4 py-3 cursor-pointer shrink-0 shadow-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white min-h-[44px]"
            >
              {isSyncing ? 'Saving...' : '🔄 Sync Portfolio'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Selected Year: 2x2 Grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)] block truncate">
            {activeYearData.year} Salary
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-[var(--text-1)] mt-1 truncate">
            <AnimatedNumber value={activeYearData.salary || 0} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)] block truncate">
            Year-End Balance
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-purple-400 mt-1 truncate">
            <AnimatedNumber value={totalBalances} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)] block truncate">
            Invested Capital
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1 truncate">
            <AnimatedNumber value={totalInvested} />
          </p>
        </div>
        <div className="card p-4">
          <span className="text-[10px] font-bold uppercase text-[var(--text-3)] block truncate">
            Contributions
          </span>
          <p className="text-lg sm:text-xl font-black font-mono text-blue-400 mt-1 truncate">
            <AnimatedNumber value={totalContri} />
          </p>
        </div>
      </div>

      {/* Visuals: Stack Donut Chart and Line Chart vertically on mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
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

      {/* Category Breakdown: Accordion List on Mobile, Table on Desktop */}
      <div className="card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
              <span>Category Breakdown ({activeYearData.year})</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Edit
              </span>
            </h3>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Modify balances, invested capital, and contributions for {activeYearData.year}.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Category</span>
            </button>
            <button
              onClick={handleResetCurrentYear}
              className="btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5 text-amber-400 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ($0)</span>
            </button>
            <button
              onClick={handleDeleteCurrentYear}
              className="btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5 text-rose-400 min-h-[44px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Add Category Form Drawer */}
        {showAddCat && (
          <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-[var(--surface-2)] border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Category Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Crypto / Real Estate"
                value={catLabel}
                onChange={(e) => setCatLabel(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Tax Treatment</label>
              <select value={catType} onChange={(e) => setCatType(e.target.value)} className="input-field text-xs">
                <option value="taxable">Taxable</option>
                <option value="deferred">Tax-Deferred</option>
                <option value="exempt">Tax-Exempt</option>
                <option value="special">Special / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Tag Color</label>
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-[var(--border)]"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-xs py-2 flex-1 justify-center cursor-pointer min-h-[44px]">
                + Create
              </button>
              <button type="button" onClick={() => setShowAddCat(false)} className="btn-secondary text-xs py-2 px-3 cursor-pointer min-h-[44px]">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mobile View: Accordion List */}
        <div className="block lg:hidden space-y-3">
          {categories.map(cat => {
            const bal = activeYearData.balances?.[cat.key] || 0;
            const inv = activeYearData.invested?.[cat.key] || 0;
            const con = activeYearData.contri?.[cat.key] || 0;
            const sharePct = totalBalances > 0 ? Math.round((bal / totalBalances) * 100) : 0;
            const isExpanded = Boolean(expandedMobileCategories[cat.key]);

            return (
              <div key={cat.key} className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden shadow-sm">
                {/* Tappable Row Header: Category Name + Balance + Chevron Arrow */}
                <button
                  onClick={() => toggleMobileCategory(cat.key)}
                  className="w-full flex items-center justify-between p-4 cursor-pointer text-left min-h-[44px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                    <span className="font-extrabold text-sm text-[var(--text-1)] truncate">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-sm text-purple-400">{formatMoney(bal)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-3)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-3)]" />}
                  </div>
                </button>

                {/* Expanded Details: Tax Treatment, Allocation %, Invested, Contribution */}
                {isExpanded && (
                  <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-3)]">Tax Treatment:</span>
                      <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]">
                        {cat.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-3)]">Allocation Share:</span>
                      <span className="font-mono font-bold text-[var(--text-1)]">{sharePct}%</span>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Balance</label>
                        <input
                          type="text"
                          value={formatInputValue(bal)}
                          onChange={(e) => updatePortfolioYear(selectedYearIndex, 'balances', cat.key, parseInputValue(e.target.value))}
                          className="w-full text-right font-mono font-bold px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Invested Capital</label>
                        <input
                          type="text"
                          value={formatInputValue(inv)}
                          onChange={(e) => updatePortfolioYear(selectedYearIndex, 'invested', cat.key, parseInputValue(e.target.value))}
                          className="w-full text-right font-mono px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-2)] text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Contributions</label>
                        <input
                          type="text"
                          value={formatInputValue(con)}
                          onChange={(e) => updatePortfolioYear(selectedYearIndex, 'contri', cat.key, parseInputValue(e.target.value))}
                          className="w-full text-right font-mono px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] font-semibold text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block max-h-[600px] overflow-y-auto overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Category</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Tax Treatment</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Allocation</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Balance</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Invested</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right sticky top-0 z-20 bg-[var(--surface)] shadow-sm">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {categories.map(cat => {
                const bal = activeYearData.balances?.[cat.key] || 0;
                const inv = activeYearData.invested?.[cat.key] || 0;
                const con = activeYearData.contri?.[cat.key] || 0;
                const sharePct = totalBalances > 0 ? Math.round((bal / totalBalances) * 100) : 0;

                return (
                  <tr key={cat.key} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--text-1)] flex items-center gap-3">
                      <span className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]">
                        {cat.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-3)]">
                      {sharePct}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="text"
                        value={formatInputValue(bal)}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'balances', cat.key, parseInputValue(e.target.value))}
                        className="w-32 text-right font-mono font-bold px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] text-xs focus:border-[var(--accent)] outline-none transition-all"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="text"
                        value={formatInputValue(inv)}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'invested', cat.key, parseInputValue(e.target.value))}
                        className="w-32 text-right font-mono px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-2)] text-xs outline-none transition-all"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="text"
                        value={formatInputValue(con)}
                        onChange={(e) => updatePortfolioYear(selectedYearIndex, 'contri', cat.key, parseInputValue(e.target.value))}
                        className="w-32 text-right font-mono px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] font-semibold text-xs outline-none transition-all"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--surface-2)] font-bold">
                <td className="py-4 px-4 text-[var(--text-1)] uppercase tracking-wider text-[11px]">Total Portfolio</td>
                <td className="py-4 px-4"></td>
                <td className="py-4 px-4 text-right font-mono text-[var(--text-2)]">100%</td>
                <td className="py-4 px-4 text-right font-mono text-purple-400 text-sm">{formatMoney(totalCatBalance)}</td>
                <td className="py-4 px-4 text-right font-mono text-emerald-400 text-sm">{formatMoney(totalCatInvested)}</td>
                <td className="py-4 px-4 text-right font-mono text-blue-400 text-sm">{formatMoney(totalCatContri)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Bar showing the "Total Portfolio" summary on mobile */}
      <div className="lg:hidden fixed bottom-20 left-0 right-0 z-30 bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] p-4 flex items-center justify-between shadow-2xl select-none">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--text-3)] block">Total Portfolio</span>
          <span className="text-sm sm:text-base font-black font-mono text-purple-400">{formatMoney(totalCatBalance)}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-[var(--text-3)] block">Invested / Contrib</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{formatMoney(totalCatInvested)}</span>
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
