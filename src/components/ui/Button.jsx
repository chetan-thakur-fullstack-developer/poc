import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm select-none';

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25',
    secondary: 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25',
    ghost: 'bg-transparent hover:bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text-1)] shadow-none border-none'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
