import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AlertTriangle, Check, X } from 'lucide-react';

export const ConfirmModal = () => {
  const { confirmModal, closeConfirmModal } = useApp();

  if (!confirmModal?.isOpen) return null;

  const { title, message, onConfirm, confirmText = 'Confirm', isDanger = false } = confirmModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card w-full max-w-md p-6 space-y-5 bg-[var(--surface)] border border-[var(--border)] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--text-1)] tracking-tight">{title || 'Are you sure?'}</h3>
            <p className="text-xs text-[var(--text-3)] mt-0.5">{message || 'This action cannot be undone.'}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="btn-secondary text-xs px-4 py-2 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              closeConfirmModal();
            }}
            className={`text-xs px-4 py-2 rounded-xl font-bold text-white shadow-lg cursor-pointer transition-all ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
