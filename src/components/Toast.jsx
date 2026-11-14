import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export const Toast = () => {
  const { toasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map(t => {
        let borderClass = 'border-slate-700 bg-slate-900/95 text-slate-100';
        let icon = 'ℹ️';

        if (t.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100';
          icon = '✅';
        } else if (t.type === 'error') {
          borderClass = 'border-rose-500/40 bg-rose-950/90 text-rose-100';
          icon = '⚠️';
        } else if (t.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-amber-950/90 text-amber-100';
          icon = '⚡';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm animate-fade-in transition-all ${borderClass}`}
          >
            <span className="text-base shrink-0">{icon}</span>
            <span className="flex-1 font-medium">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};
