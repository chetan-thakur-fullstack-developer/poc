import React from 'react';
import { Card } from './Card';
import { AnimatedNumber } from '../AnimatedNumber';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend, // 'up' | 'down' | 'neutral'
  trendValue,
  loading = false,
  className = '',
  formatter,
  onClick
}) => {
  return (
    <Card hoverEffect={!!onClick} onClick={onClick} className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">{title}</p>
          <div className="text-2xl font-black text-[var(--text-1)]">
            {loading ? (
              <div className="h-7 w-28 bg-[var(--surface-3)] rounded animate-pulse" />
            ) : typeof value === 'number' && formatter ? (
              formatter(value)
            ) : typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            {icon}
          </div>
        )}
      </div>
      {(subtitle || trendValue) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trendValue && (
            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
              trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
              'bg-[var(--surface-3)] text-[var(--text-2)]'
            }`}>
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-[var(--text-3)] truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
