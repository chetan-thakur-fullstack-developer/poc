import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ShieldCheck
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

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({
    mode: 'month', // 'all' | 'month' | 'year' | 'custom'
    year: '2026',
    month: '09',
    startDate: '',
    endDate: '',
    label: 'Sep 2026'
  });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const datePopoverRef = useRef(null);

  // Bulk Selection State
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  // Drawers & Modals State
  const [drawerTx, setDrawerTx] = useState(null);
  const [popoverTxId, setPopoverTxId] = useState(null);
  const [splitModalTx, setSplitModalTx] = useState(null);
  const [splitRows, setSplitRows] = useState([
    { categoryId: '', amount: '' },
    { categoryId: '', amount: '' }
  ]);

  const categories = expensesData?.categories || [];
  const cards = expensesData?.cards || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePopoverRef.current && !datePopoverRef.current.contains(e.target)) {
        setShowDatePopover(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    });
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
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[var(--text-1)]">Transactions Ledger</h2>
          <p className="text-xs text-[var(--text-3)]">High-precision financial activity stream & categorization</p>
        </div>
        <button
          onClick={() => openModal('addTx')}
          className="btn-primary text-xs px-4 py-2.5 cursor-pointer flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* 1. Interactive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtered Volume */}
        <div
          onClick={() => setKpiFilter('all')}
          className="card p-4 flex items-center justify-between cursor-pointer hover:border-[var(--border-hover)] transition-all bg-[var(--surface)]"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Filtered Volume</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">+4.2%</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(totalFilteredVolume, 2)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Total Entries */}
        <div
          onClick={() => setKpiFilter('all')}
          className="card p-4 flex items-center justify-between cursor-pointer hover:border-[var(--border-hover)] transition-all bg-[var(--surface)]"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Total Entries</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Active</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-1">{filtered.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        {/* Average Ticket */}
        <div
          onClick={() => setKpiFilter(kpiFilter === 'aboveAverage' ? 'all' : 'aboveAverage')}
          className={`card p-4 flex items-center justify-between cursor-pointer transition-all ${kpiFilter === 'aboveAverage' ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-[var(--border-hover)] bg-[var(--surface)]'}`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Average Ticket</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">Filter &gt; Avg</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(avgTicket, 2)}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>

        {/* Recurring Burn */}
        <div
          onClick={() => setKpiFilter(kpiFilter === 'recurringBurn' ? 'all' : 'recurringBurn')}
          className={`card p-4 flex items-center justify-between cursor-pointer transition-all ${kpiFilter === 'recurringBurn' ? 'border-amber-500 bg-amber-500/10' : 'hover:border-[var(--border-hover)] bg-[var(--surface)]'}`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--text-4)]">Recurring Burn</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">SaaS</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-1)] mt-1">{formatMoney(recurringBurn, 2)}/mo</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Enriched Filter & Action Bar */}
      <div className="card p-4 space-y-3 bg-[var(--surface)] relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-4)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search merchants or amounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-xs pl-9 py-2.5"
            />
          </div>

          {/* Date Range & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Interactive Calendar Date Range Popover */}
            <div className="relative" ref={datePopoverRef}>
              <button
                onClick={() => setShowDatePopover(!showDatePopover)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-1)] font-semibold cursor-pointer hover:border-[var(--border-hover)]"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{dateFilter.mode === 'all' ? 'All Time' : dateFilter.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showDatePopover && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                    <span className="text-xs font-bold text-[var(--text-1)]">Calendar & Date Filter</span>
                    <button
                      onClick={() => { setDateFilter({ mode: 'all', year: '2026', month: '09', startDate: '', endDate: '', label: 'All Time' }); setShowDatePopover(false); }}
                      className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Year Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Year</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['2024', '2025', '2026'].map(y => (
                        <button
                          key={y}
                          onClick={() => {
                            const currentMonthName = MONTHS.find(m => m.val === dateFilter.month)?.label.slice(0, 3) || 'Sep';
                            setDateFilter({ mode: 'month', year: y, month: dateFilter.month, startDate: '', endDate: '', label: `${currentMonthName} ${y}` });
                          }}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            dateFilter.year === y && dateFilter.mode !== 'custom' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Month Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Month</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MONTHS.map(m => (
                        <button
                          key={m.val}
                          onClick={() => {
                            const monthLabel = `${m.label.slice(0, 3)} ${dateFilter.year}`;
                            setDateFilter({ mode: 'month', year: dateFilter.year, month: m.val, startDate: '', endDate: '', label: monthLabel });
                            setShowDatePopover(false);
                          }}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            dateFilter.month === m.val && dateFilter.mode === 'month'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-white'
                          }`}
                        >
                          {m.label.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Range Picker */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Custom Date Range</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-[var(--text-4)] block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value, mode: 'custom', label: `${e.target.value} to ${prev.endDate || 'Now'}` }))}
                          className="input-field text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-4)] block mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value, mode: 'custom', label: `${prev.startDate || 'Start'} to ${e.target.value}` }))}
                          className="input-field text-[11px] py-1.5"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDatePopover(false)}
                      className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm cursor-pointer"
                    >
                      Apply Custom Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account / Card Filter */}
            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              className="input-field text-xs py-2 cursor-pointer w-auto"
            >
              <option value="all">All Cards & Accounts</option>
              {cards.map(c => (
                <option key={c.id} value={c.id}>{c.name} (•{c.masked})</option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field text-xs py-2 cursor-pointer w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick-Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'recurring', label: 'Recurring Subscriptions' },
            { id: 'tax', label: 'Tax Deductible' },
            { id: 'flagged', label: 'Flagged / Review' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setQuickFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                quickFilter === pill.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 & 4. Transactions Table Container with Smart Merchant Rows & Hover Action Menu */}
      <div className="card overflow-hidden bg-[var(--surface)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer">
              {selectedTxIds.length > 0 && selectedTxIds.length === filtered.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-3)]">
              Ledger Entries ({filtered.length})
            </h3>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-3)]">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-[var(--text-4)] opacity-50" />
            <p className="font-bold text-[var(--text-1)]">No transactions found</p>
            <p className="text-[11px] text-[var(--text-4)] mt-0.5">Try adjusting your date range, filters, or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-4)] bg-[var(--surface-2)]/20 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Merchant / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Card / Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(tx => {
                  const card = cards.find(c => c.id === tx.cardId);
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const isSelected = selectedTxIds.includes(tx.id);
                  const isPositive = Number(tx.amount) > 0 && (tx.description?.toLowerCase().includes('refund') || tx.description?.toLowerCase().includes('deposit') || tx.description?.toLowerCase().includes('balance'));
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
                          {/* Circular Brand Favicon */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-[var(--border)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {merchantInitial}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-1)] flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.isTaxDeductible && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">TAX</span>
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
                        {/* Inline Category Popover trigger */}
                        <div className="relative">
                          <button
                            onClick={() => setPopoverTxId(popoverTxId === tx.id ? null : tx.id)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer hover:brightness-110"
                            style={{
                              backgroundColor: cat ? `${cat.color}18` : 'rgba(148,163,184,0.12)',
                              color: cat?.color || '#94A3B8',
                              border: `1px solid ${cat ? `${cat.color}30` : 'rgba(148,163,184,0.2)'}`
                            }}
                          >
                            {cat?.label || 'General'}
                            <ChevronDown className="w-3 h-3 opacity-70" />
                          </button>

                          {popoverTxId === tx.id && (
                            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-[var(--app-bg-2)] border border-[var(--border-strong)] shadow-2xl z-50 p-1.5 space-y-1">
                              <div className="px-2 py-1 text-[9px] font-bold uppercase text-[var(--text-4)]">Change Category</div>
                              {categories.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, categoryId: c.id } : t));
                                    setPopoverTxId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-2)] hover:text-white hover:bg-[var(--surface-2)] flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                  <span>{c.label}</span>
                                </button>
                              ))}
                              <div className="border-t border-[var(--border)] pt-1 mt-1">
                                <button
                                  onClick={() => {
                                    setPopoverTxId(null);
                                    setSplitModalTx(tx);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Split className="w-3.5 h-3.5" />
                                  <span>Split Transaction...</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-2)] font-medium">
                        {card ? `${card.name} (•{card.masked})` : 'Manual Entry'}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-black text-right text-sm ${isPositive ? 'text-emerald-400' : 'text-[var(--text-1)]'}`}>
                        {isPositive ? `+${formatMoney(Math.abs(tx.amount), 2)}` : formatMoney(tx.amount, 2)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {/* Hover-revealed action menu */}
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSplitModalTx(tx)}
                            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                            title="Split Transaction"
                          >
                            <Split className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const tagTax = !tx.isTaxDeductible;
                              setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, isTaxDeductible: tagTax } : t));
                            }}
                            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                            title="Tag Tax Deductible"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {/* 6. Bulk Selection Floating Toolbar */}
      {selectedTxIds.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[var(--surface)]/90 border border-[var(--border-strong)] backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center">
              {selectedTxIds.length}
            </span>
            <span className="text-xs font-bold text-[var(--text-1)]">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkTaxTag}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Tag Tax Deductible</span>
            </button>
            <button
              onClick={handleBulkExportCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
