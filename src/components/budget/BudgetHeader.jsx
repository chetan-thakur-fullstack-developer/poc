import React, { useState } from 'react';
import { Calendar, Sliders, ChevronDown, Check, AlertCircle, RefreshCw } from 'lucide-react';

export const BudgetHeader = ({ period, periodState, setPeriodState, onOpenManageBudget }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customStart, setCustomStart] = useState(periodState.customRange?.start || '');
  const [customEnd, setCustomEnd] = useState(periodState.customRange?.end || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Generate month options: previous 24 and next 12 months relative to now
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -24; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const val = `${year}-${monthNum}`;
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleModeChange = (mode) => {
    setPeriodState(prev => ({ ...prev, mode }));
    setErrorMsg('');
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setPeriodState(prev => ({ ...prev, month, mode: 'month' }));
    setShowPicker(false);
  };

  const handlePresetChange = (preset) => {
    if (preset === 'custom') {
      setPeriodState(prev => ({ ...prev, preset: 'custom', mode: 'range' }));
    } else {
      setPeriodState(prev => ({ ...prev, preset, mode: 'range' }));
      setShowPicker(false);
      setErrorMsg('');
    }
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      setErrorMsg('Both start and end dates are required.');
      return;
    }
    if (new Date(customStart).getTime() > new Date(customEnd).getTime()) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }
    setErrorMsg('');
    setPeriodState(prev => ({
      ...prev,
      mode: 'range',
      preset: 'custom',
      customRange: { start: customStart, end: customEnd }
    }));
    setShowPicker(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-sm">
      {/* Left: Title & Period Display */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-1)]">
              {period.label || 'Budget Overview'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              {periodState.mode === 'month' ? 'Monthly' : (periodState.preset === 'custom' ? 'Custom Range' : 'Preset')}
            </span>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            {period.start && period.end ? `${period.start.toLocaleDateString()} — ${period.end.toLocaleDateString()}` : 'Select date range'}
          </p>
        </div>
      </div>

      {/* Right: Mode Switch, Period Picker & Manage Button */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Mode Segmented Toggle */}
        <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => handleModeChange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              periodState.mode === 'month' ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleModeChange('range')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              periodState.mode === 'range' ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            Date Range
          </button>
        </div>

        {/* Period Selector Dropdown / Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all cursor-pointer"
          >
            <span>Change Period</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-3)]" />
          </button>

          {/* Popup Picker Modal / Dropdown */}
          {showPicker && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl z-50 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-1)]">
                  Select Budget Period
                </h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {periodState.mode === 'month' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                    Select Month
                  </label>
                  <select
                    value={periodState.month || ''}
                    onChange={handleMonthChange}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--text-1)] outline-none cursor-pointer"
                  >
                    {monthOptions.map(m => (
                      <option key={m.val} value={m.val}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                    Preset Ranges
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'mtd', label: 'Month to Date' },
                      { id: 'ytd', label: 'Year to Date' },
                      { id: 'last_7', label: 'Last 7 Days' },
                      { id: 'last_30', label: 'Last 30 Days' },
                      { id: 'last_90', label: 'Last 90 Days' },
                      { id: 'last_12_months', label: 'Last 12 Months' },
                      { id: 'last_year', label: 'Last Year' },
                      { id: 'all_time', label: 'All Time' },
                      { id: 'custom', label: 'Custom Range...' }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePresetChange(p.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                          periodState.preset === p.id
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {periodState.preset === 'custom' && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-3)] font-bold">Start Date</label>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-1)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-3)] font-bold">End Date</label>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-1)] outline-none"
                          />
                        </div>
                      </div>
                      {errorMsg && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                      <button
                        onClick={handleApplyCustom}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        Apply Custom Range
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manage Budget Button */}
        <button
          onClick={onOpenManageBudget}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manage Budget</span>
        </button>
      </div>
    </div>
  );
};
