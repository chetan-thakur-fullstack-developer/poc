import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Sparkles } from 'lucide-react';

export const InsightsCards = ({ insights = [] }) => {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgStyle = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-2)]">
          Smart Insights &amp; Pacing Alerts
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={insight.id || idx}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm transition-all ${getBgStyle(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wide text-[var(--text-1)]">
                {insight.title}
              </h4>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
