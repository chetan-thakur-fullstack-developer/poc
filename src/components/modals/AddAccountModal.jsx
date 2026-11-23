import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const AddAccountModal = () => {
  const { modals, closeModal, addAccount, currentCurrency } = useApp();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Chase');
  const [type, setType] = useState('checking');
  const [mask, setMask] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#8B5CF6');

  if (!modals.addAccount) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || balance === '') return;

    addAccount({
      name,
      institution,
      type,
      mask: mask || Math.floor(1000 + Math.random() * 9000).toString(),
      balance: parseFloat(balance) || 0,
      color,
      source: 'manual'
    });

    closeModal('addAccount');
    setName('');
    setBalance('');
    setMask('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl">
        <button
          onClick={() => closeModal('addAccount')}
          className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text-1)] text-lg"
        >
          ✕
        </button>

        <h3 className="text-base font-bold text-[var(--text-1)] mb-1">Link or Add Account</h3>
        <p className="text-xs text-[var(--text-3)] mb-4">
          Connect your checking, savings, credit, or investment accounts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chase Sapphire or Fidelity Brokerage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-base sm:text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Institution
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="input-field text-base sm:text-xs"
              >
                <option value="Chase">Chase</option>
                <option value="Vanguard">Vanguard</option>
                <option value="Fidelity">Fidelity</option>
                <option value="Bank of America">Bank of America</option>
                <option value="Citi">Citi</option>
                <option value="Charles Schwab">Charles Schwab</option>
                <option value="Capital One">Capital One</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field text-base sm:text-xs"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings / CD</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Taxable Investment</option>
                <option value="retirement">Retirement (401k/IRA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Current Balance ({currentCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="input-field text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength="4"
                placeholder="4821"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                className="input-field text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
              Badge Accent Color
            </label>
            <div className="flex gap-2">
              {['#8B5CF6', '#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#06B6D4'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-lg transition-transform ${color === c ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => closeModal('addAccount')}
              className="flex-1 btn-secondary text-xs py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary text-xs py-2"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
