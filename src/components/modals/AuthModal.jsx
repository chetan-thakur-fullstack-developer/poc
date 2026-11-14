import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

export const AuthModal = () => {
  const { modals, closeModal, showToast } = useApp();
  const { user, isCloudAuthAvailable, signIn, signUp, signOut } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('owner');
  const [submitting, setSubmitting] = useState(false);

  if (!modals.auth) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp({ email, password, fullName, role });
        showToast('Account created successfully!', 'success');
      } else {
        await signIn({ email, password });
        showToast('Signed in successfully!', 'success');
      }
      closeModal('auth');
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out of session', 'info');
    closeModal('auth');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="card relative w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => closeModal('auth')}
          className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text-1)] text-lg"
        >
          ✕
        </button>

        {/* If user is already logged in */}
        {user ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
              {(user?.user_metadata?.full_name || user?.email || 'U')[0]}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-1)]">
                {user?.user_metadata?.full_name || 'Member'}
              </h3>
              <p className="text-xs text-[var(--text-3)]">{user?.email}</p>
              <div className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isCloudAuthAvailable ? 'Supabase Auth Verified' : 'Local Demo Account'}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex gap-3 justify-center">
              <button
                onClick={() => closeModal('auth')}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black mb-2 border border-emerald-500/30">
                💎
              </div>
              <h2 className="text-lg font-bold text-[var(--text-1)]">
                {mode === 'signup' ? 'Create Executive Wealth Account' : 'Welcome to Executive Wealth'}
              </h2>
              <p className="text-xs text-[var(--text-3)] mt-1">
                {isCloudAuthAvailable
                  ? 'Connected to your Supabase Cloud Authentication'
                  : 'Configure Supabase in .env for multi-device sync'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[var(--border)] mb-4">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                New Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chetan Thakur"
                    className="input-field text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@executivewealth.app"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field text-xs"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-2)] mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="owner">Primary Household Owner</option>
                    <option value="coowner">Co-Owner / Partner</option>
                    <option value="advisor">Financial Advisor (View Only)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary text-xs py-2.5 mt-2"
              >
                {submitting
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Complete Registration'
                  : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
