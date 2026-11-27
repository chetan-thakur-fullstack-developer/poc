import React from 'react';

export const Badge = ({
  children,
  variant = 'success', // success, warning, danger, info, neutral
  size = 'md', // sm, md
  className = ''
}) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    neutral: 'bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border)]'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full ${variants[variant] || variants.success} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
};
