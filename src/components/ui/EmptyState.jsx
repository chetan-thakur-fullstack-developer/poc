import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon = <Inbox className="w-8 h-8 text-[var(--text-3)]" />,
  title = "No data found",
  description = "Get started by adding your first item or changing your filters.",
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] ${className}`}>
      <div className="p-4 rounded-3xl bg-[var(--surface-2)] border border-[var(--border)] mb-4 shadow-sm">
        {icon}
      </div>
      <h4 className="text-base font-black text-[var(--text-1)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--text-3)] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
