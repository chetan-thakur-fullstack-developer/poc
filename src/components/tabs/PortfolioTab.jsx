import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { AnimatedNumber } from '../AnimatedNumber.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { AreaChart } from '../charts/AreaChart.jsx';
import { TrendingUp, TrendingDown, Plus, ChevronDown, ChevronUp, Calendar, Layers, Trash2, RotateCcw, RefreshCw, X, AlertCircle, Check } from 'lucide-react';

export const PortfolioTab = () => {
  const { portfolioData, formatMoney, updatePortfolioYear, addNewPortfolioYear, addNewPortfolioCategory, deletePortfolioYear, resetPortfolioYearValues, syncToCloud, isSyncing, showConfirmModal } = useApp();
  const [selectedYearIndex, setSelectedYearIndex] = useState(
    Math.max(0, (portfolioData?.defaultAccountData?.length || 1) - 1)
  );

  const [showAddCat, setShowAddCat] = useState(false);
  const [catLabel, setCatLabel] = useState('');
  const [catType, setCatType] = useState('taxable');
  const [catColor, setCatColor] = useState('#10B981');
  const [expandedOldYears, setExpandedOldYears] = useState({});
  const [mobileExpandedCat, setMobileExpandedCat] = useState({});
  const [mobileChartTab, setMobileChartTab] = useState('allocation'); // 'allocation' | 'growth'

  // Mobile Year Picker & Add Year Bottom Sheet State
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('2027');

  // Desktop Year Dropdown & Portal Modal State
  const [showDesktopYearDropdown, setShowDesktopYearDropdown] = useState(false);
  const [desktopDropdownPos, setDesktopDropdownPos] = useState(null);
  const [isDesktopAddYearOpen, setIsDesktopAddYearOpen] = useState(false);
  const [desktopNewYearInput, setDesktopNewYearInput] = useState('2027');
  const desktopYearBtnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      if (showDesktopYearDropdown && target && !target.closest('.desktop-year-dropdown-container')) {
        setShowDesktopYearDropdown(false);
        setDesktopDropdownPos(null);
      }
    };
    const handleScroll = () => {
      if (showDesktopYearDropdown) {
        setShowDesktopYearDropdown(false);
        setDesktopDropdownPos(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showDesktopYearDropdown]);

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

  // Duplicate year validations
  const isDuplicateMobileYear = years.some(y => y.year === newYearInput.trim());
  const isDuplicateDesktopYear = years.some(y => y.year === desktopNewYearInput.trim());

  const formatInputValue = (val) => {
    const num = Number(val);
    return isNaN(num) || val === '' || val === undefined ? '' : num.toLocaleString();
  };

  const parseInputValue = (str) => {
    const cleaned = String(str).replace(/[^0-9.-]/g, '');
    return cleaned === '' ? 0 : Number(cleaned);
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

  const toggleMobileCat = (key) => {
    setMobileExpandedCat(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sort archived years latest first
  const sortedArchivedYears = [...years]
    .map((y, idx) => ({ ...y, originalIndex: idx }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  const sortedYearsDesc = [...years]
    .map((y, idx) => ({ ...y, originalIndex: idx }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div className="space-y-6 sm:space-y-8 select-none pt-0 mt-0">
      {/* =========================================================
         MOBILE REDESIGNED PORTFOLIO VIEW (block lg:hidden)
         ========================================================= */}
      <div className="block lg:hidden space-y-4">
        {/* 1. The Compact Hero Header */}
        <div className="card p-4 bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-lg overflow-visible">
          {/* Row 1: Title & Sync Icon */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-3)]">
              Portfolio &amp; Wealth Tracker
            </h3>
            <button
              onClick={syncToCloud}
              disabled={isSyncing}
              className="p-2.5 rounded-xl bg-[var(--surface-2)] text-emerald-400 border border-[var(--border)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
              title="Sync Portfolio"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Row 2: Primary Total Balance */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-1)] font-mono tracking-tight">
              {formatMoney(totalBalances)}
            </div>
            {prevYearData && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${growthAmount >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {growthAmount >= 0 ? '+' : ''}{growthPct.toFixed(1)}% vs {prevYearData.year}
              </span>
            )}
          </div>

          {/* Row 3: Scalable Mobile Year Selector Button & [ + Add Year ] */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            <button
              onClick={() => setIsYearPickerOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-1)] flex items-center justify-between cursor-pointer min-h-[44px]"
            >
              <span>Year {activeYearData.year} (Active)</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => setIsAddYearOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] shrink-0 border border-dashed border-[var(--border-strong)] text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Year</span>
            </button>
          </div>
        </div>

        {/* 2. Horizontally Swipeable KPI Carousel */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 scrollbar-none">
          <div className="snap-start shrink-0 w-40 card p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Invested Capital</span>
            <p className="text-base font-black font-mono text-emerald-400">
              <AnimatedNumber value={totalInvested} />
            </p>
          </div>
          <div className="snap-start shrink-0 w-40 card p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Contributions</span>
            <p className="text-base font-black font-mono text-blue-400">
              <AnimatedNumber value={totalContri} />
            </p>
          </div>
          <div className="snap-start shrink-0 w-40 card p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">{activeYearData.year} Salary</span>
            <p className="text-base font-black font-mono text-[var(--text-1)]">
              <AnimatedNumber value={activeYearData.salary || 0} />
            </p>
          </div>
        </div>

        {/* 3. Segmented Control Tabs for Charts */}
        <div className="flex rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--border)]">
          <button
            onClick={() => setMobileChartTab('allocation')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
              mobileChartTab === 'allocation' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-3)]'
            }`}
          >
            Asset Allocation
          </button>
          <button
            onClick={() => setMobileChartTab('growth')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
              mobileChartTab === 'growth' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-3)]'
            }`}
          >
            Growth History
          </button>
        </div>

        {/* 4. Chart Display based on Segmented Control */}
        <div className="card p-4">
          {mobileChartTab === 'allocation' ? (
            <DonutChart
              title={`Asset Allocation (${activeYearData.year})`}
              data={categories.map(cat => ({
                label: cat.label,
                value: activeYearData.balances?.[cat.key] || 0,
                color: cat.color
              }))}
            />
          ) : (
            <AreaChart
              title="Net Worth Growth History"
              color="#8B5CF6"
              height={240}
              data={years.map(y => ({
                label: y.year,
                value: Object.values(y.balances || {}).reduce((sum, v) => sum + (Number(v) || 0), 0)
              }))}
            />
          )}
        </div>

        {/* 5. Category Breakdown (Accordion List with Framer Motion) */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <h3 className="font-bold text-sm text-[var(--text-1)]">Category Breakdown ({activeYearData.year})</h3>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowAddCat(!showAddCat)} className="p-2 rounded-xl bg-[var(--surface-2)] text-emerald-400 border border-[var(--border)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" title="Add Category">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={handleResetCurrentYear} className="p-2 rounded-xl bg-[var(--surface-2)] text-amber-400 border border-[var(--border)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" title="Reset ($0)">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handleDeleteCurrentYear} className="p-2 rounded-xl bg-[var(--surface-2)] text-rose-400 border border-[var(--border)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" title="Delete Year">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showAddCat && (
            <form onSubmit={handleAddCategory} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-emerald-500/30 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-3)] mb-1">Category Label</label>
                <input type="text" required placeholder="e.g. Crypto" value={catLabel} onChange={(e) => setCatLabel(e.target.value)} className="input-field text-xs py-2.5 w-full" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs py-2.5 flex-1 cursor-pointer min-h-[44px]">Add Category</button>
                <button type="button" onClick={() => setShowAddCat(false)} className="btn-secondary text-xs py-2.5 px-3 cursor-pointer min-h-[44px]">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {categories.map(cat => {
              const bal = activeYearData.balances?.[cat.key] || 0;
              const inv = activeYearData.invested?.[cat.key] || 0;
              const con = activeYearData.contri?.[cat.key] || 0;
              const sharePct = totalBalances > 0 ? Math.round((bal / totalBalances) * 100) : 0;
              const isExpanded = Boolean(mobileExpandedCat[cat.key]);

              return (
                <div key={cat.key} className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleMobileCat(cat.key)}
                    className="w-full flex items-center justify-between p-3.5 cursor-pointer text-left min-h-[44px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="font-extrabold text-xs sm:text-sm text-[var(--text-1)] truncate">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono font-black text-xs sm:text-sm text-[var(--text-1)]">{formatMoney(bal)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-3)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-3)]" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-3.5 bg-[var(--surface)] border-t border-[var(--border)] space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[var(--text-3)]">Tax Treatment:</span>
                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]">
                              {cat.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[var(--text-3)]">Allocation %:</span>
                            <span className="font-mono font-bold text-[var(--text-1)]">{sharePct}%</span>
                          </div>

                          <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
         REFRACTORED DESKTOP PORTFOLIO VIEW (hidden lg:block)
         Two-Column Layout: Balance & Controls Toolbar
         ========================================================= */}
      <div className="hidden lg:block space-y-6">
        <div className="card p-5 sm:p-6 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-[var(--surface)] border border-emerald-500/30 overflow-visible">
          <div className="flex justify-between items-center gap-6">
            {/* Left Column: Data & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PORTFOLIO GROWTH INTELLIGENCE
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
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
              <p className="text-xs text-[var(--text-3)] max-w-xl">
                Comparative multi-year asset growth, tax treatments, and contribution limits for <b>{activeYearData.year}</b>.
              </p>
            </div>

            {/* Right Column: Unified Toolbar (Year Selector Dropdown + Sync Outline Button) */}
            <div className="flex items-center gap-4 shrink-0 desktop-year-dropdown-container relative">
              {/* Option A: Dropdown Menu for Years (Scalable for many years) */}
              <div className="relative">
                <button
                  ref={desktopYearBtnRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showDesktopYearDropdown) {
                      setShowDesktopYearDropdown(false);
                      setDesktopDropdownPos(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDesktopDropdownPos({ top: rect.bottom + 4, left: rect.left });
                      setShowDesktopYearDropdown(true);
                    }
                  }}
                  className="btn-secondary text-xs px-4 py-2.5 font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm bg-[var(--surface)] min-w-[140px] justify-between"
                >
                  <span>{activeYearData.year} (Active)</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDesktopYearDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDesktopYearDropdown && desktopDropdownPos && createPortal(
                  <div
                    style={{ position: 'fixed', top: desktopDropdownPos.top, left: desktopDropdownPos.left, zIndex: 999999 }}
                    className="w-56 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--text-4)] border-b border-[var(--border)]">
                      Select Archive Year ({years.length} total)
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                      {sortedYearsDesc.map((y) => (
                        <button
                          key={y.year}
                          onClick={() => {
                            setSelectedYearIndex(y.originalIndex);
                            setShowDesktopYearDropdown(false);
                            setDesktopDropdownPos(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition-colors ${
                            selectedYearIndex === y.originalIndex ? 'bg-emerald-500/20 text-emerald-400' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                          }`}
                        >
                          <span>{y.year}</span>
                          {selectedYearIndex === y.originalIndex && <span className="text-[10px] font-sans font-normal">Active</span>}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[var(--border)] pt-1 mt-1">
                      <button
                        onClick={() => {
                          setShowDesktopYearDropdown(false);
                          setDesktopDropdownPos(null);
                          setIsDesktopAddYearOpen(true);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+ Add New Year</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>

              {/* Refined Sync Portfolio Button (Secondary / Outline style) */}
              <button
                onClick={syncToCloud}
                disabled={isSyncing}
                className="btn-secondary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-2 shadow-sm font-bold bg-[var(--surface)] text-[var(--text-1)] border-[var(--border-strong)] hover:border-[var(--accent)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Portfolio'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards for Selected Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="card p-4">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">
              {activeYearData.year} Base Salary
            </span>
            <p className="text-xl font-black font-mono text-[var(--text-1)] mt-1">
              <AnimatedNumber value={activeYearData.salary || 0} />
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

        {/* CURRENT YEAR: Editable Categories Breakdown Table */}
        <div className="card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-1)] flex items-center gap-2">
                <span>Category Breakdown ({activeYearData.year} — Active Editing)</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Edit
                </span>
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                Modify balances, invested capital, and contributions for {activeYearData.year}.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowAddCat(!showAddCat)}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Custom Category</span>
              </button>
              <button
                onClick={handleResetCurrentYear}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
                title="Reset all values to $0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Year ($0)</span>
              </button>
              <button
                onClick={handleDeleteCurrentYear}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-rose-400 hover:text-rose-300"
                title="Delete current year archive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Year</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Total: {formatMoney(totalBalances)}
              </span>
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
                <button type="submit" className="btn-primary text-xs py-2 flex-1 justify-center cursor-pointer">
                  + Create
                </button>
                <button type="button" onClick={() => setShowAddCat(false)} className="btn-secondary text-xs py-2 px-3 cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative">
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
                          className="w-32 text-right font-mono font-bold px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] text-xs focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] outline-none transition-all"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <input
                          type="text"
                          value={formatInputValue(inv)}
                          onChange={(e) => updatePortfolioYear(selectedYearIndex, 'invested', cat.key, parseInputValue(e.target.value))}
                          className="w-32 text-right font-mono px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-2)] text-xs focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] outline-none transition-all"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <input
                          type="text"
                          value={formatInputValue(con)}
                          onChange={(e) => updatePortfolioYear(selectedYearIndex, 'contri', cat.key, parseInputValue(e.target.value))}
                          className="w-32 text-right font-mono px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] font-semibold text-xs focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] outline-none transition-all"
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

      {/* Mobile Year Picker Bottom Sheet Drawer (Sorted Descending so latest year is on top) */}
      <AnimatePresence>
        {isYearPickerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200 select-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl p-6 space-y-5 shadow-2xl max-h-[70vh] overflow-y-auto"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 2rem) + 2rem)' }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-black text-sm text-[var(--text-1)]">Select Archive Year (Latest First)</h3>
                <button
                  onClick={() => setIsYearPickerOpen(false)}
                  className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {sortedYearsDesc.map((y) => {
                  const isActive = selectedYearIndex === y.originalIndex;
                  return (
                    <button
                      key={y.year}
                      onClick={() => {
                        setSelectedYearIndex(y.originalIndex);
                        setIsYearPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors min-h-[44px] ${
                        isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                      }`}
                    >
                      <span>Year {y.year}</span>
                      {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Year Bottom Sheet Modal for Mobile */}
      <AnimatePresence>
        {isAddYearOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200 select-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl p-6 space-y-5 shadow-2xl"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 2rem) + 2rem)' }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-black text-sm text-[var(--text-1)]">Add New Year</h3>
                <button
                  onClick={() => setIsAddYearOpen(false)}
                  className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-3)] block">
                  Year (e.g. 2025, 2027)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2027"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="input-field text-sm font-mono font-bold py-3 w-full text-center"
                />
                {isDuplicateMobileYear && (
                  <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Year {newYearInput} is already added.</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddYearOpen(false)}
                  className="btn-secondary text-xs py-3 px-5 flex-1 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDuplicateMobileYear || !newYearInput.trim()}
                  onClick={() => {
                    const yr = newYearInput.trim();
                    if (!yr || isDuplicateMobileYear) return;
                    const newIdx = addNewPortfolioYear(yr);
                    setSelectedYearIndex(newIdx);
                    setIsAddYearOpen(false);
                    setNewYearInput(String(Number(yr) + 1));
                  }}
                  className={`btn-primary text-xs py-3 px-5 flex-1 cursor-pointer font-bold ${isDuplicateMobileYear || !newYearInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Add Year
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Year Centered Modal Dialog for Desktop */}
      <AnimatePresence>
        {isDesktopAddYearOpen && (
          <div className="hidden lg:flex fixed inset-0 z-50 bg-black/70 backdrop-blur-sm items-center justify-center p-4 animate-in fade-in duration-200 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="card w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h3 className="font-bold text-base text-[var(--text-1)]">Add New Portfolio Year</h3>
                <button
                  onClick={() => setIsDesktopAddYearOpen(false)}
                  className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--text-2)] block">
                  Year (e.g. 2027)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2027"
                  value={desktopNewYearInput}
                  onChange={(e) => setDesktopNewYearInput(e.target.value)}
                  className="input-field text-sm font-mono font-bold py-3 w-full"
                />
                {isDuplicateDesktopYear && (
                  <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Year {desktopNewYearInput} is already added.</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsDesktopAddYearOpen(false)}
                  className="btn-secondary text-xs px-5 py-2.5 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDesktopAddYearOpen || !desktopNewYearInput.trim()}
                  onClick={() => {
                    const yr = desktopNewYearInput.trim();
                    if (!yr || isDesktopAddYearOpen) return;
                    const newIdx = addNewPortfolioYear(yr);
                    setSelectedYearIndex(newIdx);
                    setIsDesktopAddYearOpen(false);
                    setDesktopNewYearInput(String(Number(yr) + 1));
                  }}
                  className={`btn-primary text-xs px-6 py-2.5 cursor-pointer font-bold ${isDesktopAddYearOpen || !desktopNewYearInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Save Year
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
