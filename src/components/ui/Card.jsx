import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = 'p-5 sm:p-6',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`card ${padding} bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm ${
        hoverEffect ? 'transition-all hover:border-emerald-500/40 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
