import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext.jsx';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ArrowUpDown,
  Receipt,
  Calendar,
  CreditCard,
  Tag,
  CheckSquare,
  Square,
  MoreVertical,
  Split,
  FileText,
  Download,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';

const MONTHS = [
  { val: '01', label: 'January' },
  { val: '02', label: 'February' },
  { val: '03', label: 'March' },
  { val: '04', label: 'April' },
  { val: '05', label: 'May' },
  { val: '06', label: 'June' },
  { val: '07', label: 'July' },
  { val: '08', label: 'August' },
  { val: '09', label: 'September' },
  { val: '10', label: 'October' },
  { val: '11', label: 'November' },
  { val: '12', label: 'December' },
];

export const TransactionsTab = () => {
  const { transactions, setTransactions, formatMoney, openModal, deleteTransaction, expensesData } = useApp();

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCard, setSelectedCard] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'recurring', 'tax', 'flagged'
  const [kpiFilter, setKpiFilter] = useState('all'); // 'all', 'aboveAverage', 'recurringBurn'
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({
    mode: 'all', // 'all' | 'month' | 'year' | 'custom'
    year: '2026',
    month: '11',
    startDate: '',
    endDate: '',
    label: 'All Time'
  });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [rowCatSearchQuery, setRowCatSearchQuery] = useState('');

  const datePopoverRef = useRef(null);
  const cardDropdownRef = useRef(null);
  const catDropdownRef = useRef(null);
  const isHoveringDropdown = useRef(false);

  // Bulk Selection State
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  // Drawers & Modals State
  const [drawerTx, setDrawerTx] = useState(null);
  const [popoverTxId, setPopoverTxId] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [splitModalTx, setSplitModalTx] = useState(null);
  const [splitRows, setSplitRows] = useState([
    { categoryId: '', amount: '' },
    { categoryId: '', amount: '' }
  ]);

  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCard !== 'all' ? 1 : 0) +
    (dateFilter.mode !== 'all' ? 1 : 0) +
    (quickFilter !== 'all' ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      if (datePopoverRef.current && !datePopoverRef.current.contains(e.target)) {
        setShowDatePopover(false);
      }
      if (cardDropdownRef.current && !cardDropdownRef.current.contains(e.target)) {
        setShowCardDropdown(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setShowCatDropdown(false);
      }
      if (popoverTxId && target && !target.closest('.category-popover-container')) {
        setPopoverTxId(null);
        setPopoverPos(null);
      }
      if (openRowMenuId && target && !target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
        setMenuPos(null);
      }
    };
    const handleScroll = () => {
      if (isHoveringDropdown.current) {
        return;
      }
      setOpenRowMenuId(null);
      setMenuPos(null);
      setPopoverTxId(null);
      setPopoverPos(null);
      setShowDatePopover(false);
      setShowCardDropdown(false);
      setShowCatDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [popoverTxId, openRowMenuId]);

  // Filter logic
  const filtered = useMemo(() => {
    return (transactions || []).filter(t => {
      const matchesSearch =
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        String(t.amount).includes(search);

      const matchesCategory =
        selectedCategory === 'all' || t.categoryId === selectedCategory;

      const matchesCard =
        selectedCard === 'all' || t.cardId === selectedCard;

      let matchesQuick = true;
      if (quickFilter === 'recurring') matchesQuick = t.isRecurring;
      if (quickFilter === 'tax') matchesQuick = t.isTaxDeductible;
      if (quickFilter === 'flagged') matchesQuick = t.isFlagged;

      let matchesKpi = true;
      const totalAmt = Number(t.amount) || 0;
      const avg = transactions.length > 0 ? transactions.reduce((s, x) => s + (Number(x.amount) || 0), 0) / transactions.length : 0;
      if (kpiFilter === 'aboveAverage') matchesKpi = totalAmt > avg;
      if (kpiFilter === 'recurringBurn') matchesKpi = t.isRecurring;

      let matchesDate = true;
      if (t.date) {
        if (dateFilter.mode === 'year') {
          matchesDate = t.date.startsWith(dateFilter.year);
        } else if (dateFilter.mode === 'month') {
          matchesDate = t.date.startsWith(`${dateFilter.year}-${dateFilter.month}`);
        } else if (dateFilter.mode === 'custom') {
          if (dateFilter.startDate && dateFilter.endDate) {
            matchesDate = t.date >= dateFilter.startDate && t.date <= dateFilter.endDate;
          } else if (dateFilter.startDate) {
            matchesDate = t.date >= dateFilter.startDate;
          } else if (dateFilter.endDate) {
            matchesDate = t.date <= dateFilter.endDate;
          }
        }
      }

      return matchesSearch && matchesCategory && matchesCard && matchesQuick && matchesKpi && matchesDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, selectedCategory, selectedCard, quickFilter, kpiFilter, dateFilter]);

  // KPI Calculations
  const totalFilteredVolume = filtered.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const avgTicket = filtered.length > 0 ? totalFilteredVolume / filtered.length : 0;
  const recurringBurn = (transactions || [])
    .filter(t => t.isRecurring)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // Bulk Select Toggle
  const toggleSelectAll = () => {
    if (selectedTxIds.length === filtered.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filtered.map(t => t.id));
    }
  };

  const toggleSelectTx = (id) => {
    setSelectedTxIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedTxIds.length} selected transactions?`)) {
      selectedTxIds.forEach(id => deleteTransaction(id));
      setSelectedTxIds([]);
    }
  };

  const handleBulkTaxTag = () => {
    setTransactions(prev => prev.map(t => selectedTxIds.includes(t.id) ? { ...t, isTaxDeductible: true } : t));
    setSelectedTxIds([]);
  };

  const handleBulkExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,Date,Description,Amount,Category"].join(",") + "\n" +
      filtered.filter(t => selectedTxIds.includes(t.id)).map(t => `${t.id},${t.date},"${t.description}",${t.amount},${t.categoryId}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ledger_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-32">
      {/* 1. Interactive KPI Summary Cards (2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Filtered Volume */}
        <div
          onClick={() => setKpiFilter('all')}
          className="card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:border-[var(--border-hover)] transition-all bg-[var(--surface)]"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Filtered Volume</span>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">+4.2%</span>
            </div>
            <div className="text-base sm:text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(totalFilteredVolume, 2)}</div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Entries */}
        <div
          onClick={() => setKpiFilter('all')}
          className="card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:border-[var(--border-hover)] transition-all bg-[var(--surface)]"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Total Entries</span>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Active</span>
            </div>
            <div className="text-base sm:text-xl font-black font-mono text-[var(--text-1)] mt-1">{filtered.length}</div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Average Ticket */}
        <div
          onClick={() => setKpiFilter(kpiFilter === 'aboveAverage' ? 'all' : 'aboveAverage')}
          className={`card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all ${kpiFilter === 'aboveAverage' ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-[var(--border-hover)] bg-[var(--surface)]'}`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Average Ticket</span>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">&gt; Avg</span>
            </div>
            <div className="text-base sm:text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(avgTicket, 2)}</div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Recurring Burn */}
        <div
          onClick={() => setKpiFilter(kpiFilter === 'recurringBurn' ? 'all' : 'recurringBurn')}
          className={`card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all ${kpiFilter === 'recurringBurn' ? 'border-amber-500 bg-amber-500/10' : 'hover:border-[var(--border-hover)] bg-[var(--surface)]'}`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Recurring Burn</span>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">SaaS</span>
            </div>
            <div className="text-base sm:text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(recurringBurn, 2)}/mo</div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* UNIFIED MASTER CARD: Integrated Filter Bar + Transactions Stream / Table */}
      <div className="card overflow-visible bg-[var(--surface)] shadow-xl">
        {/* Top Filter Toolbar Section inside Master Card */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] space-y-4 bg-[var(--surface-2)]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer" title="Select All">
                {selectedTxIds.length > 0 && selectedTxIds.length === filtered.length ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-2)]">
                Ledger Entries ({filtered.length})
              </h3>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Bulk Action Bar (if items selected) */}
              {selectedTxIds.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs animate-fadeIn">
                  <span className="font-bold text-emerald-400">{selectedTxIds.length} selected</span>
                  <button onClick={handleBulkTaxTag} className="btn-secondary text-[11px] !py-1 !px-2.5 cursor-pointer">Tag Tax</button>
                  <button onClick={handleBulkExportCSV} className="btn-secondary text-[11px] !py-1 !px-2.5 cursor-pointer">Export CSV</button>
                  <button onClick={handleBulkDelete} className="btn-secondary text-[11px] !py-1 !px-2.5 text-rose-400 hover:text-rose-300 cursor-pointer">Delete</button>
                </div>
              )}

              {/* Desktop Record Transaction Button */}
              <button
                onClick={() => openModal('addTx')}
                className="hidden sm:flex btn-primary text-xs px-4 py-2.5 cursor-pointer items-center gap-1.5 text-white shadow-sm shrink-0 whitespace-nowrap min-h-[44px]"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Record Transaction</span>
              </button>
            </div>
          </div>

          {/* Mobile Search + Filter Trigger row */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-4)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchants or amounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-9 py-2.5 w-full"
              />
            </div>
            <button
              onClick={() => setShowMobileFilterModal(true)}
              className="relative px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-1)] font-bold flex items-center gap-2 shrink-0 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filter Row */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-4)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchants or amounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-9 py-2.5"
              />
            </div>

            {/* Date Range & Calendar Popover */}
            <div className="relative" ref={datePopoverRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePopover(!showDatePopover);
                  setShowCardDropdown(false);
                  setShowCatDropdown(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-1)] font-semibold cursor-pointer hover:border-[var(--border-hover)]"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{dateFilter.label}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showDatePopover && (
                <div
                  onMouseEnter={() => { isHoveringDropdown.current = true; }}
                  onMouseLeave={() => { isHoveringDropdown.current = false; }}
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 dropdown-menu-portal"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                    <span className="text-xs font-bold text-[var(--text-1)]">Date Filter</span>
                    <button
                      onClick={() => { setDateFilter({ mode: 'all', year: '2026', month: '11', startDate: '', endDate: '', label: 'All Time' }); setShowDatePopover(false); }}
                      className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setDateFilter({ mode: 'all', year: '2026', month: '11', startDate: '', endDate: '', label: 'All Time' });
                        setShowDatePopover(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        dateFilter.mode === 'all' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white'
                      }`}
                    >
                      <span>All Time</span>
                      {dateFilter.mode === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <button
                      onClick={() => {
                        const now = new Date();
                        const yr = String(now.getFullYear());
                        const mo = String(now.getMonth() + 1).padStart(2, '0');
                        setDateFilter({ mode: 'month', year: yr, month: mo, startDate: '', endDate: '', label: 'Current Month' });
                        setShowDatePopover(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        dateFilter.mode === 'month' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white'
                      }`}
                    >
                      <span>Current Month</span>
                      {dateFilter.mode === 'month' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <button
                      onClick={() => {
                        const now = new Date();
                        const yr = String(now.getFullYear());
                        const mo = String(now.getMonth() + 1).padStart(2, '0');
                        setDateFilter({ mode: 'year', year: yr, month: mo, startDate: '', endDate: '', label: 'Current Year' });
                        setShowDatePopover(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        dateFilter.mode === 'year' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white'
                      }`}
                    >
                      <span>Current Year</span>
                      {dateFilter.mode === 'year' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  </div>

                  {/* Custom Date Range Picker */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Custom Range</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-[var(--text-4)] block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                          className="input-field text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-4)] block mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                          className="input-field text-[11px] py-1.5"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (dateFilter.startDate || dateFilter.endDate) {
                          setDateFilter(prev => ({
                            ...prev,
                            mode: 'custom',
                            label: `${prev.startDate || 'Start'} to ${prev.endDate || 'Now'}`
                          }));
                        }
                        setShowDatePopover(false);
                      }}
                      className="w-full mt-1 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm cursor-pointer"
                    >
                      Apply Custom Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account / Card Custom Popup Dropdown */}
            <div className="relative" ref={cardDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardDropdown(!showCardDropdown);
                  setShowCatDropdown(false);
                  setShowDatePopover(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-1)] font-semibold cursor-pointer hover:border-[var(--border-hover)]"
              >
                <div className="flex items-center gap-2 truncate">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{selectedCard === 'all' ? 'All Cards & Accounts' : `${cards.find(c => c.id === selectedCard)?.name || selectedCard}`}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {showCardDropdown && (
                <div
                  onMouseEnter={() => { isHoveringDropdown.current = true; }}
                  onMouseLeave={() => { isHoveringDropdown.current = false; }}
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150 dropdown-menu-portal"
                >
                  <div className="p-2 border-b border-[var(--border)]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-4)] pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search cards/accounts..."
                        value={cardSearchQuery}
                        onChange={(e) => setCardSearchQuery(e.target.value)}
                        className="input-field text-xs pl-8 py-1.5 w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                    <button
                      onClick={() => { setSelectedCard('all'); setShowCardDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedCard === 'all' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                      }`}
                    >
                      <span>All Cards &amp; Accounts</span>
                      {selectedCard === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    {cards.filter(c => c.name.toLowerCase().includes(cardSearchQuery.toLowerCase()) || c.masked.includes(cardSearchQuery)).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCard(c.id); setShowCardDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          selectedCard === c.id ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{c.name} (•{c.masked})</span>
                        {selectedCard === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Custom Popup Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCatDropdown(!showCatDropdown);
                  setShowCardDropdown(false);
                  setShowDatePopover(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-1)] font-semibold cursor-pointer hover:border-[var(--border-hover)]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.label || 'Category'}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {showCatDropdown && (
                <div
                  onMouseEnter={() => { isHoveringDropdown.current = true; }}
                  onMouseLeave={() => { isHoveringDropdown.current = false; }}
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150 dropdown-menu-portal"
                >
                  <div className="p-2 border-b border-[var(--border)]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-4)] pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={catSearchQuery}
                        onChange={(e) => setCatSearchQuery(e.target.value)}
                        className="input-field text-xs pl-8 py-1.5 w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                    <button
                      onClick={() => { setSelectedCategory('all'); setShowCatDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedCategory === 'all' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                      }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    {categories.filter(c => c.label.toLowerCase().includes(catSearchQuery.toLowerCase())).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCategory(c.id); setShowCatDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          selectedCategory === c.id ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{c.label}</span>
                        {selectedCategory === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick-Toggle Pills: Horizontally scrollable on mobile */}
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 pt-2 border-t border-[var(--border)] scrollbar-none items-center">
            {[
              { id: 'all', label: 'All Entries' },
              { id: 'recurring', label: 'Recurring Subscriptions' },
              { id: 'tax', label: 'Tax Deductible' },
              { id: 'flagged', label: 'Flagged / Review' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setQuickFilter(pill.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  quickFilter === pill.id
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List / Table */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--text-3)]">
            <Receipt className="w-10 h-10 mx-auto mb-3 text-[var(--text-4)] opacity-60" />
            <p className="font-bold text-[var(--text-1)] text-sm">No transactions recorded</p>
            <p className="text-xs text-[var(--text-3)] mt-1 max-w-sm mx-auto leading-relaxed">
              Record your first income, expense, or transfer transaction using the floating "+" button to populate your high-precision financial activity stream.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (100% Original Desktop Table) */}
            <div
              onScroll={() => {
                setOpenRowMenuId(null);
                setMenuPos(null);
                setPopoverTxId(null);
                setPopoverPos(null);
              }}
              className="hidden sm:block max-h-[600px] overflow-y-auto overflow-x-auto relative"
            >
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-4)] uppercase tracking-wider text-[10px] font-extrabold">
                    <th className="py-3 px-4 w-10 sticky-th"></th>
                    <th className="py-3 px-4 sticky-th">Date</th>
                    <th className="py-3 px-4 sticky-th">Merchant / Description</th>
                    <th className="py-3 px-4 sticky-th">Category</th>
                    <th className="py-3 px-4 sticky-th">Card / Account</th>
                    <th className="py-3 px-4 text-right sticky-th">Amount</th>
                    <th className="py-3 px-4 text-right sticky-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map(tx => {
                    const card = cards.find(c => c.id === tx.cardId);
                    const cat = categories.find(c => c.id === tx.categoryId);
                    const isSelected = selectedTxIds.includes(tx.id);
                    const isExpense = tx.isExpense !== undefined ? tx.isExpense : (Number(tx.amount) >= 0);
                    const merchantInitial = tx.description?.[0] || 'M';

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-[var(--surface-2)]/60 transition-colors group cursor-pointer ${isSelected ? 'bg-emerald-500/10' : ''}`}
                        onClick={() => setDrawerTx(tx)}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSelectTx(tx.id)} className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[var(--text-3)] text-[11px]">{tx.date}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-[var(--border)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {merchantInitial}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-1)] flex items-center gap-2">
                                <span className={tx.isExcluded ? 'line-through opacity-60' : ''}>{tx.description}</span>
                                {tx.isTaxDeductible && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">TAX</span>
                                )}
                                {tx.isExcluded && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">EXCLUDED</span>
                                )}
                              </div>
                              {tx.isRecurring && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 font-bold uppercase mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  Recurring
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative category-popover-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (popoverTxId === tx.id) {
                                  setPopoverTxId(null);
                                  setPopoverPos(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setPopoverTxId(tx.id);
                                  setPopoverPos({ top: rect.bottom + 4, left: rect.left });
                                }
                              }}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer hover:ring-2 hover:ring-[var(--accent)] transition-all"
                              style={{
                                backgroundColor: cat ? `${cat.color}18` : 'rgba(148,163,184,0.12)',
                                color: cat?.color || '#94A3B8',
                                border: `1px solid ${cat ? `${cat.color}40` : 'rgba(148,163,184,0.3)'}`
                              }}
                              title="Click to change category"
                            >
                              <span>{cat?.label || 'General'}</span>
                              <ChevronDown className="w-3 h-3 opacity-90 stroke-[2.5]" />
                            </button>

                            {popoverTxId === tx.id && popoverPos && createPortal(
                              <div
                                style={{ position: 'fixed', top: popoverPos.top, left: popoverPos.left, zIndex: 999999 }}
                                onMouseEnter={() => { isHoveringDropdown.current = true; }}
                                onMouseLeave={() => { isHoveringDropdown.current = false; }}
                                className="w-56 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 dropdown-menu-portal"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2 border-b border-[var(--border)]">
                                  <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-4)] pointer-events-none" />
                                    <input
                                      type="text"
                                      placeholder="Search categories..."
                                      value={rowCatSearchQuery}
                                      onChange={(e) => setRowCatSearchQuery(e.target.value)}
                                      className="input-field text-xs pl-8 py-1.5 w-full"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                                  {categories.filter(c => c.label.toLowerCase().includes(rowCatSearchQuery.toLowerCase())).map(c => {
                                    const isSelected = tx.categoryId === c.id;
                                    return (
                                      <button
                                        key={c.id}
                                        onClick={() => {
                                          setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, categoryId: c.id } : t));
                                          setPopoverTxId(null);
                                          setPopoverPos(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                                          isSelected ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-white'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                          <span className="truncate">{c.label}</span>
                                        </div>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>,
                              document.getElementById('portal-root') || document.body
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-2)] font-medium">
                          {card ? `${card.name} (•${card.masked})` : 'Manual Entry'}
                        </td>
                        <td className={`py-3.5 px-4 font-mono font-black text-right text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isExpense ? `-${formatMoney(Math.abs(tx.amount), 2)}` : `+${formatMoney(Math.abs(tx.amount), 2)}`}
                        </td>
                        <td className="py-3.5 px-4 text-right relative row-menu-container" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openRowMenuId === tx.id) {
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOpenRowMenuId(tx.id);
                                const menuWidth = 208;
                                let left = rect.right - menuWidth;
                                if (left < 12) left = 12;
                                if (left + menuWidth > window.innerWidth - 12) left = window.innerWidth - menuWidth - 12;
                                setMenuPos({ top: rect.bottom + 4, left: left });
                              }
                            }}
                            className="p-2 rounded-lg text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                            title="Transaction Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openRowMenuId === tx.id && menuPos && createPortal(
                            <div
                              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 999999 }}
                              className="w-52 rounded-xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setOpenRowMenuId(null);
                                  setMenuPos(null);
                                  setSplitModalTx(tx);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Split className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Split Transaction...</span>
                              </button>
                              <button
                                onClick={() => {
                                  const tagTax = !tx.isTaxDeductible;
                                  setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, isTaxDeductible: tagTax } : t));
                                  setOpenRowMenuId(null);
                                  setMenuPos(null);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Tag className="w-3.5 h-3.5 text-purple-400" />
                                <span>{tx.isTaxDeductible ? 'Untag Tax Deductible' : 'Tag Tax Deductible'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, isExcluded: !tx.isExcluded } : t));
                                  setOpenRowMenuId(null);
                                  setMenuPos(null);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <span>{tx.isExcluded ? '📥 Include in Tracking' : '📤 Exclude from Tracking'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  deleteTransaction(tx.id);
                                  setOpenRowMenuId(null);
                                  setMenuPos(null);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-3)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Transaction</span>
                              </button>
                            </div>,
                            document.body
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Fintech List Items with Actions Menu */}
            <div className="sm:hidden p-3 space-y-3">
              {filtered.map(tx => {
                const card = cards.find(c => c.id === tx.cardId);
                const cat = categories.find(c => c.id === tx.categoryId);
                const isSelected = selectedTxIds.includes(tx.id);
                const isExpense = tx.isExpense !== undefined ? tx.isExpense : (Number(tx.amount) >= 0);
                const merchantInitial = tx.description?.[0] || 'M';

                return (
                  <div
                    key={tx.id}
                    onClick={() => setDrawerTx(tx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${isSelected ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-[var(--surface-2)]/60 border-[var(--border)]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div onClick={(e) => { e.stopPropagation(); toggleSelectTx(tx.id); }} className="shrink-0 text-[var(--text-3)]">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                        </div>
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {merchantInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-[var(--text-1)] truncate flex items-center gap-1.5">
                            <span className={tx.isExcluded ? 'line-through opacity-60' : ''}>{tx.description}</span>
                            {tx.isTaxDeductible && (
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-indigo-500/20 text-indigo-400">TAX</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--text-3)] truncate mt-0.5">
                            {tx.date} • {card ? card.name : 'Manual Entry'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-black text-xs ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isExpense ? `-${formatMoney(Math.abs(tx.amount), 2)}` : `+${formatMoney(Math.abs(tx.amount), 2)}`}
                        </div>
                        <div className="mt-1">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold inline-block"
                            style={{
                              backgroundColor: cat ? `${cat.color}18` : 'rgba(148,163,184,0.12)',
                              color: cat?.color || '#94A3B8',
                              border: `1px solid ${cat ? `${cat.color}40` : 'rgba(148,163,184,0.3)'}`
                            }}
                          >
                            {cat?.label || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Footer with Tags and Actions Menu */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[10px]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Recurring
                          </span>
                        )}
                        {tx.isExcluded && (
                          <span className="text-slate-400 font-bold">Excluded</span>
                        )}
                      </div>

                      <div className="relative row-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openRowMenuId === tx.id) {
                              setOpenRowMenuId(null);
                              setMenuPos(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setOpenRowMenuId(tx.id);
                              const menuWidth = 208;
                              let left = rect.right - menuWidth;
                              if (left < 12) left = 12;
                              if (left + menuWidth > window.innerWidth - 12) left = window.innerWidth - menuWidth - 12;
                              setMenuPos({ top: rect.bottom + 4, left: left });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] hover:text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Actions</span>
                        </button>

                        {openRowMenuId === tx.id && menuPos && createPortal(
                          <div
                            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 999999 }}
                            className="w-52 rounded-xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                                setSplitModalTx(tx);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Split className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Split Transaction...</span>
                            </button>
                            <button
                              onClick={() => {
                                const tagTax = !tx.isTaxDeductible;
                                setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, isTaxDeductible: tagTax } : t));
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Tag className="w-3.5 h-3.5 text-purple-400" />
                              <span>{tx.isTaxDeductible ? 'Untag Tax Deductible' : 'Tag Tax Deductible'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, isExcluded: !tx.isExcluded } : t));
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-3)] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <span>{tx.isExcluded ? '📥 Include in Tracking' : '📤 Exclude from Tracking'}</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                setOpenRowMenuId(null);
                                setMenuPos(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-3)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Transaction</span>
                            </button>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile */}
      <button
        onClick={() => openModal('addTx')}
        className="fixed right-5 bottom-24 z-30 sm:hidden w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
        title="Record Transaction"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Mobile Filter Bottom Sheet Modal */}
      {showMobileFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200 select-none sm:hidden">
          <div
            className="bg-[var(--app-bg-2)] border-t border-[var(--border-strong)] rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 2rem) + 4rem)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-sm text-[var(--text-1)]">Filter Transactions</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCard('all');
                  setDateFilter({ mode: 'all', year: '2026', month: '09', startDate: '', endDate: '', label: 'All Time' });
                  setQuickFilter('all');
                }}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Quick Segmented Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-4)]">View Type</label>
              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Entries' },
                  { id: 'recurring', label: 'Recurring' },
                  { id: 'tax', label: 'Tax Deductible' },
                  { id: 'flagged', label: 'Flagged' }
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setQuickFilter(pill.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      quickFilter === pill.id
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)]'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account / Card Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-4)]">Card & Account</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="input-field text-xs py-3 w-full cursor-pointer"
              >
                <option value="all">All Cards & Accounts</option>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (•{c.masked})</option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-4)]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field text-xs py-3 w-full cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-4)]">Date Filter ({dateFilter.label})</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['2024', '2025', '2026'].map(y => (
                  <button
                    key={y}
                    onClick={() => {
                      const currentMonthName = MONTHS.find(m => m.val === dateFilter.month)?.label.slice(0, 3) || 'Sep';
                      setDateFilter({ mode: 'month', year: y, month: dateFilter.month, startDate: '', endDate: '', label: `${currentMonthName} ${y}` });
                    }}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      dateFilter.year === y && dateFilter.mode !== 'custom' ? 'bg-[#8B5CF6] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)]'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {MONTHS.map(m => (
                  <button
                    key={m.val}
                    onClick={() => {
                      setDateFilter({ mode: 'month', year: dateFilter.year, month: m.val, startDate: '', endDate: '', label: `${m.label.slice(0, 3)} ${dateFilter.year}` });
                    }}
                    className={`py-2 rounded-xl text-[11px] font-semibold cursor-pointer ${
                      dateFilter.month === m.val && dateFilter.mode === 'month' ? 'bg-[#8B5CF6] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)]'
                    }`}
                  >
                    {m.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => setShowMobileFilterModal(false)}
                className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer"
              >
                Apply Filters ({filtered.length} matches)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Slide-Over Merchant & Receipt Detail Drawer */}
      {drawerTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[var(--app-bg-2)] border-l border-[var(--border-strong)] h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {drawerTx.description?.[0] || 'M'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-1)]">{drawerTx.description}</h3>
                  <p className="text-xs font-mono text-emerald-400 font-bold">{formatMoney(drawerTx.amount, 2)}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerTx(null)}
                className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant Analytics Insight */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Merchant Intelligence</span>
              </div>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Total spent at <strong>{drawerTx.description}</strong> this year: <span className="font-mono font-bold text-[var(--text-1)]">$840.00</span> across 12 visits. Average ticket: $70.00.
              </p>
            </div>

            {drawerTx.isRecurring && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-400">Subscription Price Alert</p>
                  <p className="text-[var(--text-2)]">This recurring charge increased by $2.00 (+14%) compared to Q2 historical billing.</p>
                </div>
              </div>
            )}

            {/* Receipt Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-2)]">Receipt Attachment</label>
              <div className="border-2 border-dashed border-[var(--border-strong)] rounded-2xl p-6 text-center bg-[var(--surface-2)]/50 hover:border-emerald-500/50 transition-colors cursor-pointer">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[var(--text-3)]" />
                <p className="text-xs font-bold text-[var(--text-1)]">Drop receipt PDF or image here</p>
                <p className="text-[10px] text-[var(--text-4)] mt-0.5">Supports PNG, JPG, PDF up to 15MB</p>
              </div>
            </div>

            {/* Notes / Memo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-2)]">Notes & Memo</label>
              <textarea
                rows={3}
                placeholder="Add contextual memo, project code, or reimbursement tags..."
                className="input-field text-xs resize-none"
                defaultValue={drawerTx.memo || ''}
              />
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => setDrawerTx(null)}
                className="btn-primary text-xs px-5 py-2.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Split Transaction Modal */}
      {splitModalTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-lg p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--text-1)]">Split Transaction</h3>
                <p className="text-xs text-[var(--text-3)]">Divide {splitModalTx.description} ({formatMoney(splitModalTx.amount, 2)}) across categories</p>
              </div>
              <button onClick={() => setSplitModalTx(null)} className="p-2 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {splitRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <select
                    value={row.categoryId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitRows(prev => prev.map((r, i) => i === idx ? { ...r, categoryId: val } : r));
                    }}
                    className="input-field text-xs flex-1"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitRows(prev => prev.map((r, i) => i === idx ? { ...r, amount: val } : r));
                    }}
                    className="input-field text-xs w-32 font-mono text-right"
                  />
                </div>
              ))}
              <button
                onClick={() => setSplitRows(prev => [...prev, { categoryId: '', amount: '' }])}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                + Add Another Split Row
              </button>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-3">
              <button onClick={() => setSplitModalTx(null)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
              <button
                onClick={() => {
                  setSplitModalTx(null);
                  alert('Transaction successfully split!');
                }}
                className="btn-primary text-xs px-5 py-2"
              >
                Confirm Split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
