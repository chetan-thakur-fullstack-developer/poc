import React from 'react';
import { Search } from 'lucide-react';

export const SearchFilterBar = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilter,
  onFilterChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 ${className}`}>
      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      )}

      {/* Filter Chips */}
      {filters.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-[var(--surface)] text-[var(--text-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-[var(--surface-2)] text-[var(--text-3)]'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
