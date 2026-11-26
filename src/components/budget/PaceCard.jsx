import React from 'react';
import { Gauge, ArrowUpRight, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import { Amount } from './Amount.jsx';

export const PaceCard = ({ metrics }) => {
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Ahead':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'On track':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const clampedPctSpent = Math.min(100, Math.max(0, metrics.pctSpent));
  const clampedPctElapsed = Math.min(100, Math.max(0, metrics.pctElapsed));

  return (
    <div className="card p-5 sm:p-6 space-y-5 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-1)]">
              Budget Pace &amp; Trajectory
            </h3>
            <p className="text-xs text-[var(--text-3)]">
              Comparing spend velocity against elapsed period time
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-black border ${getBadgeColor(metrics.paceStatus)}`}>
          {metrics.paceStatus}
        </div>
      </div>

      {/* Progress Bar with Elapsed Marker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--text-2)]">Spend Progress: <span className="text-[var(--text-1)] font-mono">{metrics.pctSpent}%</span></span>
          <span className="text-[var(--text-3)]">Time Elapsed: <span className="font-mono">{metrics.pctElapsed}%</span> ({metrics.elapsedDays} / {metrics.totalDays} days)</span>
        </div>
        <div className="relative h-4 w-full bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
          {/* Spent Bar */}
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${metrics.pctSpent > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
            style={{ width: `${clampedPctSpent}%` }}
          />
          {/* Elapsed Vertical Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[var(--text-1)] shadow-md z-10"
            style={{ left: `${clampedPctElapsed}%` }}
            title={`Time Elapsed: ${metrics.pctElapsed}%`}
          />
        </div>
      </div>

      {/* Three Supplementary Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[var(--border)]">
        <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Projected Period End</span>
          </div>
          <div className="text-lg font-black font-mono text-[var(--text-1)]">
            <Amount value={metrics.projectedPeriodEnd} decimals={2} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Average Spend</span>
          </div>
          <div className="text-lg font-black font-mono text-[var(--text-1)]">
            <Amount value={metrics.dailyAverage} decimals={2} />
            <span className="text-xs text-[var(--text-3)] font-normal">/day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-3)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended Daily</span>
          </div>
          <div className="text-lg font-black font-mono text-emerald-400">
            <Amount value={metrics.recommendedDaily} decimals={2} />
            <span className="text-xs text-[var(--text-3)] font-normal">/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
